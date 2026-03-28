"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = exports.CourseStatus = exports.Difficulty = exports.ContentType = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
var ContentType;
(function (ContentType) {
    ContentType["TEXT"] = "text";
    ContentType["IMAGE_TEXT"] = "image_text";
    ContentType["PDF"] = "pdf";
    ContentType["PPT"] = "ppt";
    ContentType["VIDEO"] = "video";
    ContentType["OTHER"] = "other";
})(ContentType || (exports.ContentType = ContentType = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["BEGINNER"] = "beginner";
    Difficulty["INTERMEDIATE"] = "intermediate";
    Difficulty["ADVANCED"] = "advanced";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
var CourseStatus;
(function (CourseStatus) {
    CourseStatus["DRAFT"] = "draft";
    CourseStatus["PUBLISHED"] = "published";
    CourseStatus["ARCHIVED"] = "archived";
})(CourseStatus || (exports.CourseStatus = CourseStatus = {}));
let CourseService = class CourseService {
    get supabase() {
        return (0, supabase_client_1.getSupabaseClient)();
    }
    async getCategories() {
        const { data, error } = await this.supabase
            .from('course_categories')
            .select('*')
            .eq('status', 'active')
            .order('sort_order', { ascending: true });
        if (error) {
            console.error('获取课程分类失败:', error);
            throw new common_1.BadRequestException('获取课程分类失败');
        }
        return { success: true, data: data || [] };
    }
    async createCourse(dto, userId) {
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
            throw new common_1.BadRequestException(`创建课程失败: ${error.message}`);
        }
        return { success: true, data };
    }
    async getCourses(params) {
        const { categoryId, contentType, status, keyword, page = 1, limit = 20, userId, isAdmin } = params;
        let query = this.supabase
            .from('courses')
            .select(`
        *,
        category:course_categories(id, name),
        creator:users!courses_created_by_fkey(id, nickname, avatar_url)
      `, { count: 'exact' });
        if (!isAdmin) {
            query = query.eq('status', CourseStatus.PUBLISHED);
        }
        else if (status) {
            query = query.eq('status', status);
        }
        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }
        if (contentType) {
            query = query.eq('content_type', contentType);
        }
        if (keyword) {
            query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        }
        query = query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);
        const { data, error, count } = await query;
        if (error) {
            console.error('获取课程列表失败:', error);
            throw new common_1.BadRequestException('获取课程列表失败');
        }
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
    async getCourseDetail(courseId, userId) {
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
            throw new common_1.BadRequestException('课程不存在');
        }
        await this.supabase
            .from('courses')
            .update({ view_count: (course.view_count || 0) + 1 })
            .eq('id', courseId);
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
    async updateCourse(courseId, dto, userId) {
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.content !== undefined)
            updateData.content = dto.content;
        if (dto.categoryId !== undefined)
            updateData.category_id = dto.categoryId;
        if (dto.contentType !== undefined)
            updateData.content_type = dto.contentType;
        if (dto.coverImage !== undefined)
            updateData.cover_image = dto.coverImage;
        if (dto.fileUrl !== undefined)
            updateData.file_url = dto.fileUrl;
        if (dto.fileName !== undefined)
            updateData.file_name = dto.fileName;
        if (dto.fileSize !== undefined)
            updateData.file_size = dto.fileSize;
        if (dto.duration !== undefined)
            updateData.duration = dto.duration;
        if (dto.difficulty !== undefined)
            updateData.difficulty = dto.difficulty;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.tags !== undefined)
            updateData.tags = dto.tags;
        const { data, error } = await this.supabase
            .from('courses')
            .update(updateData)
            .eq('id', courseId)
            .select()
            .single();
        if (error) {
            console.error('更新课程失败:', error);
            throw new common_1.BadRequestException('更新课程失败');
        }
        return { success: true, data };
    }
    async deleteCourse(courseId) {
        const { error } = await this.supabase
            .from('courses')
            .delete()
            .eq('id', courseId);
        if (error) {
            console.error('删除课程失败:', error);
            throw new common_1.BadRequestException('删除课程失败');
        }
        return { success: true, message: '删除成功' };
    }
    async publishCourse(courseId) {
        const { error } = await this.supabase
            .from('courses')
            .update({ status: CourseStatus.PUBLISHED })
            .eq('id', courseId);
        if (error) {
            throw new common_1.BadRequestException('发布课程失败');
        }
        return { success: true, message: '发布成功' };
    }
    async archiveCourse(courseId) {
        const { error } = await this.supabase
            .from('courses')
            .update({ status: CourseStatus.ARCHIVED })
            .eq('id', courseId);
        if (error) {
            throw new common_1.BadRequestException('归档课程失败');
        }
        return { success: true, message: '归档成功' };
    }
    async updateLearning(courseId, userId, dto) {
        const { data: course } = await this.supabase
            .from('courses')
            .select('id')
            .eq('id', courseId)
            .single();
        if (!course) {
            throw new common_1.BadRequestException('课程不存在');
        }
        const updateData = {};
        if (dto.progress !== undefined)
            updateData.progress = dto.progress;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.lastPosition !== undefined)
            updateData.last_position = dto.lastPosition;
        if (dto.timeSpent !== undefined)
            updateData.time_spent = dto.timeSpent;
        if (dto.status === 'completed') {
            updateData.completed_at = new Date().toISOString();
            await this.supabase.rpc('increment_course_completion', { course_id: courseId });
        }
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
            throw new common_1.BadRequestException('更新学习进度失败');
        }
        return { success: true, data };
    }
    async toggleFavorite(courseId, userId) {
        const { data: existing } = await this.supabase
            .from('course_favorites')
            .select('id')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();
        if (existing) {
            await this.supabase
                .from('course_favorites')
                .delete()
                .eq('id', existing.id);
            return { success: true, data: { isFavorite: false } };
        }
        else {
            await this.supabase
                .from('course_favorites')
                .insert({ course_id: courseId, user_id: userId });
            return { success: true, data: { isFavorite: true } };
        }
    }
    async getFavoriteCourses(userId, page = 1, limit = 20) {
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
            throw new common_1.BadRequestException('获取收藏课程失败');
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
    async getLearningHistory(userId, page = 1, limit = 20) {
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
            throw new common_1.BadRequestException('获取学习记录失败');
        }
        return {
            success: true,
            data: {
                list: data || [],
                pagination: { page, limit, total: count || 0 },
            },
        };
    }
    async getStatistics(userId) {
        const { count: totalCourses } = await this.supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('status', CourseStatus.PUBLISHED);
        let userStats = null;
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
        const { data: categoryStats } = await this.supabase
            .from('courses')
            .select('category_id, category:course_categories(id, name)')
            .eq('status', CourseStatus.PUBLISHED);
        const categoryCount = new Map();
        (categoryStats || []).forEach(item => {
            const categoryData = item.category;
            let category = null;
            if (Array.isArray(categoryData) && categoryData.length > 0) {
                category = categoryData[0];
            }
            else if (categoryData && typeof categoryData === 'object' && 'id' in categoryData) {
                category = categoryData;
            }
            if (category && category.id) {
                const key = category.id;
                if (categoryCount.has(key)) {
                    categoryCount.get(key).count++;
                }
                else {
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
    async getRecommendedCourses(userId, limit = 5) {
        let preferredCategories = [];
        if (userId) {
            const { data: completedCourses } = await this.supabase
                .from('course_learnings')
                .select('course:courses(category_id)')
                .eq('user_id', userId)
                .eq('status', 'completed');
            preferredCategories = [...new Set((completedCourses || [])
                    .map((item) => item.course?.category_id)
                    .filter(Boolean))];
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
        if (preferredCategories.length > 0) {
            query = query.in('category_id', preferredCategories);
        }
        const { data, error } = await query;
        if (error) {
            console.error('获取推荐课程失败:', error);
            throw new common_1.BadRequestException('获取推荐课程失败');
        }
        return { success: true, data: data || [] };
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = __decorate([
    (0, common_1.Injectable)()
], CourseService);
//# sourceMappingURL=course.service.js.map