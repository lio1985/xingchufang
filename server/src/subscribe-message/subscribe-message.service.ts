import { Injectable, Logger } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import axios from 'axios';

interface SubscribeRecord {
  id: string;
  user_id: string;
  template_id: string;
  wx_template_id: string;
  openid: string;
  subscribed_at: string;
  used: boolean;
  used_at?: string;
}

interface WxAccessToken {
  access_token: string;
  expires_in: number;
  expires_at: number;
}

@Injectable()
export class SubscribeMessageService {
  private readonly logger = new Logger(SubscribeMessageService.name);
  private get supabase() {
    return getSupabaseClient();
  }

  // 缓存 access_token
  private accessTokenCache: WxAccessToken | null = null;

  /**
   * 获取微信 access_token
   */
  private async getAccessToken(): Promise<string> {
    // 检查缓存是否有效
    if (this.accessTokenCache && this.accessTokenCache.expires_at > Date.now()) {
      return this.accessTokenCache.access_token;
    }

    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;

    if (!appid || !secret) {
      throw new Error('缺少微信小程序配置：WX_APPID 或 WX_SECRET');
    }

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
      );

      const { access_token, expires_in, errcode, errmsg } = response.data;

      if (errcode) {
        throw new Error(`获取 access_token 失败: ${errmsg}`);
      }

      // 缓存 token（提前5分钟过期）
      this.accessTokenCache = {
        access_token,
        expires_in,
        expires_at: Date.now() + (expires_in - 300) * 1000,
      };

      this.logger.log('获取 access_token 成功');
      return access_token;
    } catch (error) {
      this.logger.error('获取 access_token 失败:', error);
      throw error;
    }
  }

  /**
   * 订阅消息
   */
  async subscribe(userId: string, templateId: string, wxTemplateId: string) {
    // 1. 获取用户 openid
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('openid')
      .eq('id', userId)
      .single();

    if (userError || !user?.openid) {
      throw new Error('用户不存在或未绑定 openid');
    }

    // 2. 保存订阅记录
    const { error } = await this.supabase
      .from('subscribe_messages')
      .insert({
        user_id: userId,
        template_id: templateId,
        wx_template_id: wxTemplateId,
        openid: user.openid,
        subscribed_at: new Date().toISOString(),
        used: false,
      });

    if (error) {
      this.logger.error('保存订阅记录失败:', error);
      throw new Error('订阅失败');
    }

    return { success: true, message: '订阅成功' };
  }

  /**
   * 取消订阅
   */
  async unsubscribe(userId: string, templateId: string) {
    const { error } = await this.supabase
      .from('subscribe_messages')
      .delete()
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .eq('used', false); // 只删除未使用的订阅

    if (error) {
      this.logger.error('取消订阅失败:', error);
      throw new Error('取消订阅失败');
    }

    return { success: true, message: '取消订阅成功' };
  }

  /**
   * 获取用户订阅状态
   */
  async getSubscribeStatus(userId: string) {
    const { data, error } = await this.supabase
      .from('subscribe_messages')
      .select('template_id')
      .eq('user_id', userId)
      .eq('used', false);

    if (error) {
      this.logger.error('查询订阅状态失败:', error);
      throw new Error('查询订阅状态失败');
    }

    return {
      success: true,
      data: {
        subscribedIds: data?.map(item => item.template_id) || [],
      },
    };
  }

  /**
   * 发送订阅消息
   * @param userId 用户ID
   * @param templateId 模板ID（系统内部ID）
   * @param data 消息数据
   * @param page 跳转页面
   */
  async sendSubscribeMessage(
    userId: string,
    templateId: string,
    data: Record<string, { value: string }>,
    page: string = 'pages/tab-home/index'
  ) {
    // 1. 获取用户订阅记录（未使用的）
    const { data: subscribeRecord, error: recordError } = await this.supabase
      .from('subscribe_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .eq('used', false)
      .order('subscribed_at', { ascending: true })
      .limit(1)
      .single();

    if (recordError || !subscribeRecord) {
      this.logger.warn(`用户 ${userId} 未订阅消息 ${templateId}`);
      return { success: false, message: '用户未订阅该消息' };
    }

    try {
      // 2. 获取 access_token
      const accessToken = await this.getAccessToken();

      // 3. 发送订阅消息
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
        {
          touser: subscribeRecord.openid,
          template_id: subscribeRecord.wx_template_id,
          page,
          data,
          miniprogram_state: 'formal', // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版
          lang: 'zh_CN',
        }
      );

      const { errcode, errmsg } = response.data;

      if (errcode !== 0) {
        this.logger.error(`发送订阅消息失败: ${errmsg}`);
        return { success: false, message: errmsg };
      }

      // 4. 标记订阅记录为已使用
      await this.supabase
        .from('subscribe_messages')
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', subscribeRecord.id);

      this.logger.log(`发送订阅消息成功: userId=${userId}, templateId=${templateId}`);
      return { success: true, message: '发送成功' };
    } catch (error) {
      this.logger.error('发送订阅消息失败:', error);
      throw error;
    }
  }

  /**
   * 批量发送订阅消息（给多个用户）
   */
  async batchSendSubscribeMessage(
    userIds: string[],
    templateId: string,
    data: Record<string, { value: string }>,
    page: string = 'pages/tab-home/index'
  ) {
    const results: Array<{ userId: string; success: boolean; message: string }> = [];

    for (const userId of userIds) {
      try {
        const result = await this.sendSubscribeMessage(userId, templateId, data, page);
        results.push({ userId, success: result.success, message: result.message });
      } catch (error: any) {
        results.push({ userId, success: false, message: error.message });
      }
    }

    return {
      success: true,
      data: {
        total: userIds.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      },
    };
  }
}
