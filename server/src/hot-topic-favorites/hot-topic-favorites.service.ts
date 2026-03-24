import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { UserService } from '../user/user.service';
import { HotTopicFavorite, CreateFavoriteDto } from './types';

@Injectable()
export class HotTopicFavoritesService {
  private client = getSupabaseClient();

  constructor(private readonly userService: UserService) {}

  /**
   * 添加收藏
   */
  async addFavorite(userId: string, dto: CreateFavoriteDto) {
    try {
      const result = await this.client
        .from('hot_topic_favorites')
        .upsert({
          user_id: userId,
          topic_id: dto.topic_id,
          title: dto.title,
          url: dto.url,
          platform: dto.platform,
          hotness: dto.hotness,
          category: dto.category,
          site_name: dto.site_name,
          publish_time: dto.publish_time ? new Date(dto.publish_time) : null,
          updated_at: new Date(),
        }, {
          onConflict: 'user_id,topic_id'
        })
        .select()
        .single();

      return {
        success: true,
        data: result.data as HotTopicFavorite
      };
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: string, topicId: string) {
    try {
      const { error } = await this.client
        .from('hot_topic_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('topic_id', topicId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: '取消收藏成功'
      };
    } catch (error) {
      console.error('取消收藏失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户收藏列表
   */
  async getFavorites(userId: string, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.client
        .from('hot_topic_favorites')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as HotTopicFavorite[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否已收藏
   */
  async isFavorite(userId: string, topicId: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('hot_topic_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('topic_id', topicId)
        .maybeSingle();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('检查收藏状态失败:', error);
      return false;
    }
  }

  /**
   * 获取收藏的热点ID列表
   */
  async getFavoriteTopicIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('hot_topic_favorites')
        .select('topic_id')
        .eq('user_id', userId);

      if (error) {
        return [];
      }

      return (data || []).map(item => item.topic_id);
    } catch (error) {
      console.error('获取收藏ID列表失败:', error);
      return [];
    }
  }

  /**
   * 批量检查收藏状态
   */
  async batchCheckFavorites(userId: string, topicIds: string[]): Promise<Record<string, boolean>> {
    if (topicIds.length === 0) {
      return {};
    }

    try {
      const { data, error } = await this.client
        .from('hot_topic_favorites')
        .select('topic_id')
        .eq('user_id', userId)
        .in('topic_id', topicIds);

      if (error) {
        return {};
      }

      const favoriteSet = new Set((data || []).map(item => item.topic_id));
      const result: Record<string, boolean> = {};

      topicIds.forEach(id => {
        result[id] = favoriteSet.has(id);
      });

      return result;
    } catch (error) {
      console.error('批量检查收藏状态失败:', error);
      return {};
    }
  }
}
