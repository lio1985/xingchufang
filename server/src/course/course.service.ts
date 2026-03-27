import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

/**
 * 课程内容类型
 */
export enum ContentType {
  TEXT = 'text',           // 纯文字
  IMAGE_TEXT = 'image_text', // 图文
  PDF = 'pdf',             // PDF文档
  PPT = 'ppt',             // PPT演示文稿
  VIDEO = 'video',         // 视频
  OTHER = 'other',         // 其他
}

/**
 * 课程难度
 */
export enum Difficulty {
  BEGINNER = 'beginner',     // 入门
  INTERMEDIATE = 'intermediate', // 进阶
  ADVANCED = 'advanced',     // 高级
}

/**
 * 课程状态
 */
export enum CourseStatus {
  DRAFT = 'draft',         // 草稿
  PUBLISHED = 'published', // 已发布
  ARCHIVED = 'archived',   // 已归档
}

/**
 * 创建课程DTO
 */
export interface CreateCourseDto {
  title: string;
  description?: string;
  content?: string;
  categoryId?: string;
  contentType?: ContentType;
  coverImage?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  difficulty?: Difficulty;
  status?: CourseStatus;
  tags?: string[];
}

/**
 * 更新课程DTO
 */
export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

/**
 * 课程学习进度更新DTO
 */
export interface UpdateLearningDto {
  progress?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  lastPosition?: number;
  timeSpent?: number;
}

@Injectable()
export class CourseService {
  private get supabase() {
    return getSupabaseClient();
  }

  /**
   * 获取课程分类列表
   */
  async getCategories() {
    const { data, error } = await this.supabase
      .from('course_categories')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('获取课程分类失败:', error);
      throw new BadRequestException('获取课程分类失败');
    }

    return { success: true, data: data || [] };
  }

  /**
   * 创建课程（管理员）
   */
  async createCourse(dto: CreateCourseDto, userId: string) {
    const courseData = {
      title: dto.title,
      description: dto.description || null,
      content: dto.content || null,
      category_id: dto.categoryId || null,
      content_type: dto.contentType || ContentType.TEXT,
      cover_image: dto.coverImage || null,
      file_url: dto.fileUrl || null,
      file_name: dto.fileName || null,
      file_size: dto.fileSize || null,
      duration: dto.duration || 0,
      difficulty: dto.difficulty || Difficulty.BEGINNER,
      status: dto.status || CourseStatus.DRAFT,
      tags: dto.tags || [],
      created_by: userId,
    };

    const { data, error } = await this.supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (error) {
      console.error('创建课程失败:', error);
      throw new BadRequestException(`创建课程失败: ${error.message}`);
    }

    return { success: true, data };
  }

  /**
   * 获取课程列表
   */
  async getCourses(params: {
    categoryId?: string;
    contentType?: ContentType;
    status?: CourseStatus;
    keyword?: string;
    page?: number;
    limit?: number;
    userId?: string;
    isAdmin?: boolean;
  }) {
    const { categoryId, contentType, status, keyword, page = 1, limit = 20, userId, isAdmin } = params;

    let query = this.supabase
      .from('courses')
      .select(`
        *,
        category:course_categories(id, name),
        creator:users!courses_created_by_fkey(id, nickname, avatar_url)
      `, { count: 'exact' });

    // 非管理员只能看已发布的课程
    if (!isAdmin) {
      query = query.eq('status', CourseStatus.PUBLISHED);
    } else if (status) {
      query = query.eq('status', status);
    }

    // 筛选条件
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (contentType) {
      query = query.eq('content_type', contentType);
    }
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('获取课程列表失败:', error);
      throw new BadRequestException('获取课程列表失败');
    }

    // 如果用户已登录，获取学习进度
    let coursesWithProgress = data || [];
    if (userId && coursesWithProgress.length > 0) {
      const courseIds = coursesWithProgress.map(c => c.id);
      const { data: learnings } = await this.supabase
        .from('course_learnings')
        .select('*')
        .eq('user_id', userId)
        .in('course_id', courseIds);

      const learningMap = new Map((learnings || []).map(l => [l.course_id, l]));
      
      coursesWithProgress = coursesWithProgress.map(course => ({
        ...course,
        learning: learningMap.get(course.id) || null,
      }));
    }

    return {
      success: true,
      data: {
        list: coursesWithProgress,
        pagination: { page, limit, total: count || 0 },
      },
    };
  }

  /**
   * 获取课程详情
   */
  async getCourseDetail(courseId: string, userId?: string) {
    const { data: course, error } = await this.supabase
      .from('courses')
      .select(`
        *,
        category:course_categories(id, name),
        creator:users!courses_created_by_fkey(id, nickname, avatar_url)
      `)
      .eq('id', courseId)
      .single();

    if (error || !course) {
      throw new BadRequestException('课程不存在');
    }

    // 增加浏览量
    await this.supabase
      .from('courses')
      .update({ view_count: (course.view_count || 0) + 1 })
      .eq('id', courseId);

    // 获取学习进度
    let learning = null;
    if (userId) {
      const { data: learningData } = await this.supabase
        .from('course_learnings')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();
      learning = learningData;
    }

    return {
      success: true,
      data: {
        ...course,
        view_count: (course.view_count || 0) + 1,
        learning,
      },
    };
  }

  /**
   * 更新课程（管理员）
   */
  async updateCourse(courseId: string, dto: UpdateCourseDto, userId: string) {
    const updateData: any = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.contentType !== undefined) updateData.content_type = dto.contentType;
    if (dto.coverImage !== undefined) updateData.cover_image = dto.coverImage;
    if (dto.fileUrl !== undefined) updateData.file_url = dto.fileUrl;
    if (dto.fileName !== undefined) updateData.file_name = dto.fileName;
    if (dto.fileSize !== undefined) updateData.file_size = dto.fileSize;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.difficulty !== undefined) updateData.difficulty = dto.difficulty;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    const { data, error } = await this.supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('更新课程失败:', error);
      throw new BadRequestException('更新课程失败');
    }

    return { success: true, data };
  }

  /**
   * 删除课程（管理员）
   */
  async deleteCourse(courseId: string) {
    const { error } = await this.supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('删除课程失败:', error);
      throw new BadRequestException('删除课程失败');
    }

    return { success: true, message: '删除成功' };
  }

  /**
   * 发布课程（管理员）
   */
  async publishCourse(courseId: string) {
    const { error } = await this.supabase
      .from('courses')
      .update({ status: CourseStatus.PUBLISHED })
      .eq('id', courseId);

    if (error) {
      throw new BadRequestException('发布课程失败');
    }

    return { success: true, message: '发布成功' };
  }

  /**
   * 归档课程（管理员）
   */
  async archiveCourse(courseId: string) {
    const { error } = await this.supabase
      .from('courses')
      .update({ status: CourseStatus.ARCHIVED })
      .eq('id', courseId);

    if (error) {
      throw new BadRequestException('归档课程失败');
    }

    return { success: true, message: '归档成功' };
  }

  /**
   * 更新学习进度
   */
  async updateLearning(courseId: string, userId: string, dto: UpdateLearningDto) {
    // 检查课程是否存在
    const { data: course } = await this.supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (!course) {
      throw new BadRequestException('课程不存在');
    }

    const updateData: any = {};
    if (dto.progress !== undefined) updateData.progress = dto.progress;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.lastPosition !== undefined) updateData.last_position = dto.lastPosition;
    if (dto.timeSpent !== undefined) updateData.time_spent = dto.timeSpent;

    // 如果完成，记录完成时间
    if (dto.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      
      // 增加课程完成人数
      await this.supabase.rpc('increment_course_completion', { course_id: courseId });
    }

    // 使用 upsert 创建或更新学习记录
    const { data, error } = await this.supabase
      .from('course_learnings')
      .upsert({
        course_id: courseId,
        user_id: userId,
        ...updateData,
      }, { onConflict: 'course_id,user_id' })
      .select()
      .single();

    if (error) {
      console.error('更新学习进度失败:', error);
      throw new BadRequestException('更新学习进度失败');
    }

    return { success: true, data };
  }

  /**
   * 收藏/取消收藏课程
   */
  async toggleFavorite(courseId: string, userId: string) {
    // 检查是否已收藏
    const { data: existing } = await this.supabase
      .from('course_favorites')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // 取消收藏
      await this.supabase
        .from('course_favorites')
        .delete()
        .eq('id', existing.id);
      
      return { success: true, data: { isFavorite: false } };
    } else {
      // 添加收藏
      await this.supabase
        .from('course_favorites')
        .insert({ course_id: courseId, user_id: userId });
      
      return { success: true, data: { isFavorite: true } };
    }
  }

  /**
   * 获取用户收藏的课程
   */
  async getFavoriteCourses(userId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from('course_favorites')
      .select(`
        created_at,
        course:courses(
          *,
          category:course_categories(id, name)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('获取收藏课程失败:', error);
      throw new BadRequestException('获取收藏课程失败');
    }

    return {
      success: true,
      data: {
        list: (data || []).map(item => ({
          ...item.course,
          favoriteAt: item.created_at,
        })),
        pagination: { page, limit, total: count || 0 },
      },
    };
  }

  /**
   * 获取用户学习记录
   */
  async getLearningHistory(userId: string, page = 1, limit = 20) {
    const { data, error, count } = await this.supabase
      .from('course_learnings')
      .select(`
        *,
        course:courses(
          id,
          title,
          cover_image,
          duration,
          category:course_categories(id, name)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .neq('status', 'not_started')
      .order('updated_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('获取学习记录失败:', error);
      throw new BadRequestException('获取学习记录失败');
    }

    return {
      success: true,
      data: {
        list: data || [],
        pagination: { page, limit, total: count || 0 },
      },
    };
  }

  /**
   * 获取课程统计数据
   */
  async getStatistics(userId?: string) {
    // 总课程数
    const { count: totalCourses } = await this.supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('status', CourseStatus.PUBLISHED);

    // 用户学习统计
    let userStats: { completedCount: number; inProgressCount: number; totalTimeSpent: number } | null = null;
    if (userId) {
      const { data: learnings } = await this.supabase
        .from('course_learnings')
        .select('status, time_spent')
        .eq('user_id', userId);

      const completedCount = (learnings || []).filter(l => l.status === 'completed').length;
      const inProgressCount = (learnings || []).filter(l => l.status === 'in_progress').length;
      const totalTimeSpent = (learnings || []).reduce((sum, l) => sum + (l.time_spent || 0), 0);

      userStats = {
        completedCount,
        inProgressCount,
        totalTimeSpent,
      };
    }

    // 分类统计
    const { data: categoryStats } = await this.supabase
      .from('courses')
      .select('category_id, category:course_categories(id, name)')
      .eq('status', CourseStatus.PUBLISHED);

    const categoryCount = new Map<string, { id: string; name: string; count: number }>();
    (categoryStats || []).forEach(item => {
      // Supabase返回的category可能是对象或数组
      const categoryData = item.category as unknown;
      let category: { id: string; name: string } | null = null;
      
      if (Array.isArray(categoryData) && categoryData.length > 0) {
        category = categoryData[0] as { id: string; name: string };
      } else if (categoryData && typeof categoryData === 'object' && 'id' in categoryData) {
        category = categoryData as { id: string; name: string };
      }
      
      if (category && category.id) {
        const key = category.id;
        if (categoryCount.has(key)) {
          categoryCount.get(key)!.count++;
        } else {
          categoryCount.set(key, { id: category.id, name: category.name, count: 1 });
        }
      }
    });

    return {
      success: true,
      data: {
        totalCourses: totalCourses || 0,
        userStats,
        categoryStats: Array.from(categoryCount.values()),
      },
    };
  }

  /**
   * 获取推荐课程
   */
  async getRecommendedCourses(userId?: string, limit = 5) {
    // 获取用户已完成的课程分类
    let preferredCategories: string[] = [];
    
    if (userId) {
      const { data: completedCourses } = await this.supabase
        .from('course_learnings')
        .select('course:courses(category_id)')
        .eq('user_id', userId)
        .eq('status', 'completed');

      preferredCategories = [...new Set(
        (completedCourses || [])
          .map((item: any) => item.course?.category_id)
          .filter(Boolean)
      )];
    }

    let query = this.supabase
      .from('courses')
      .select(`
        *,
        category:course_categories(id, name)
      `)
      .eq('status', CourseStatus.PUBLISHED)
      .order('completion_count', { ascending: false })
      .limit(limit);

    // 如果有偏好分类，优先推荐
    if (preferredCategories.length > 0) {
      query = query.in('category_id', preferredCategories);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取推荐课程失败:', error);
      throw new BadRequestException('获取推荐课程失败');
    }

    return { success: true, data: data || [] };
  }
}
