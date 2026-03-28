"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SubscribeMessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeMessageService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
const axios_1 = require("axios");
let SubscribeMessageService = SubscribeMessageService_1 = class SubscribeMessageService {
    constructor() {
        this.logger = new common_1.Logger(SubscribeMessageService_1.name);
        this.accessTokenCache = null;
    }
    get supabase() {
        return (0, supabase_client_1.getSupabaseClient)();
    }
    async getAccessToken() {
        if (this.accessTokenCache && this.accessTokenCache.expires_at > Date.now()) {
            return this.accessTokenCache.access_token;
        }
        const appid = process.env.WX_APPID;
        const secret = process.env.WX_SECRET;
        if (!appid || !secret) {
            throw new Error('缺少微信小程序配置：WX_APPID 或 WX_SECRET');
        }
        try {
            const response = await axios_1.default.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`);
            const { access_token, expires_in, errcode, errmsg } = response.data;
            if (errcode) {
                throw new Error(`获取 access_token 失败: ${errmsg}`);
            }
            this.accessTokenCache = {
                access_token,
                expires_in,
                expires_at: Date.now() + (expires_in - 300) * 1000,
            };
            this.logger.log('获取 access_token 成功');
            return access_token;
        }
        catch (error) {
            this.logger.error('获取 access_token 失败:', error);
            throw error;
        }
    }
    async subscribe(userId, templateId, wxTemplateId) {
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('openid')
            .eq('id', userId)
            .single();
        if (userError || !user?.openid) {
            throw new Error('用户不存在或未绑定 openid');
        }
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
    async unsubscribe(userId, templateId) {
        const { error } = await this.supabase
            .from('subscribe_messages')
            .delete()
            .eq('user_id', userId)
            .eq('template_id', templateId)
            .eq('used', false);
        if (error) {
            this.logger.error('取消订阅失败:', error);
            throw new Error('取消订阅失败');
        }
        return { success: true, message: '取消订阅成功' };
    }
    async getSubscribeStatus(userId) {
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
    async sendSubscribeMessage(userId, templateId, data, page = 'pages/tab-home/index') {
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
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.post(`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`, {
                touser: subscribeRecord.openid,
                template_id: subscribeRecord.wx_template_id,
                page,
                data,
                miniprogram_state: 'formal',
                lang: 'zh_CN',
            });
            const { errcode, errmsg } = response.data;
            if (errcode !== 0) {
                this.logger.error(`发送订阅消息失败: ${errmsg}`);
                return { success: false, message: errmsg };
            }
            await this.supabase
                .from('subscribe_messages')
                .update({
                used: true,
                used_at: new Date().toISOString(),
            })
                .eq('id', subscribeRecord.id);
            this.logger.log(`发送订阅消息成功: userId=${userId}, templateId=${templateId}`);
            return { success: true, message: '发送成功' };
        }
        catch (error) {
            this.logger.error('发送订阅消息失败:', error);
            throw error;
        }
    }
    async batchSendSubscribeMessage(userIds, templateId, data, page = 'pages/tab-home/index') {
        const results = [];
        for (const userId of userIds) {
            try {
                const result = await this.sendSubscribeMessage(userId, templateId, data, page);
                results.push({ userId, success: result.success, message: result.message });
            }
            catch (error) {
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
};
exports.SubscribeMessageService = SubscribeMessageService;
exports.SubscribeMessageService = SubscribeMessageService = SubscribeMessageService_1 = __decorate([
    (0, common_1.Injectable)()
], SubscribeMessageService);
//# sourceMappingURL=subscribe-message.service.js.map