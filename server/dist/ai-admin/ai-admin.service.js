"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAdminService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
let AiAdminService = class AiAdminService {
    constructor() {
        this.client = (0, supabase_client_1.getSupabaseClient)();
    }
    async getAllModels() {
        const { data, error } = await this.client
            .from('ai_models')
            .select('*')
            .order('created_at', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data || [];
    }
    async getModelById(id) {
        const { data, error } = await this.client
            .from('ai_models')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116')
            throw new Error(error.message);
        return data;
    }
    async createModel(modelData) {
        const { data, error } = await this.client
            .from('ai_models')
            .insert(modelData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async updateModel(id, updates) {
        const { data, error } = await this.client
            .from('ai_models')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async deleteModel(id) {
        const { error } = await this.client
            .from('ai_models')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async setDefaultModel(id) {
        await this.client
            .from('ai_models')
            .update({ is_default: false })
            .neq('id', '00000000-0000-0000-0000-000000000000');
        const { error } = await this.client
            .from('ai_models')
            .update({ is_default: true })
            .eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async getAllModules() {
        const { data, error } = await this.client
            .from('ai_modules')
            .select(`
        *,
        model:ai_models(*)
      `)
            .order('display_order', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data || [];
    }
    async getModuleById(id) {
        const { data, error } = await this.client
            .from('ai_modules')
            .select(`
        *,
        model:ai_models(*)
      `)
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116')
            throw new Error(error.message);
        return data;
    }
    async createModule(moduleData) {
        const { data, error } = await this.client
            .from('ai_modules')
            .insert(moduleData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async updateModule(id, updates) {
        const { data, error } = await this.client
            .from('ai_modules')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async deleteModule(id) {
        const { error } = await this.client
            .from('ai_modules')
            .delete()
            .eq('id', id);
        if (error)
            throw new Error(error.message);
    }
    async toggleModule(id) {
        const module = await this.getModuleById(id);
        if (!module)
            throw new Error('模块不存在');
        const { data, error } = await this.client
            .from('ai_modules')
            .update({ is_active: !module.is_active, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getUsageStats(startDate, endDate) {
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        const { count: totalCalls } = await this.client
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        const { count: successCalls } = await this.client
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'success')
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        const { data: tokenData } = await this.client
            .from('ai_usage_logs')
            .select('input_token_count, output_token_count')
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        const totalInputTokens = tokenData?.reduce((sum, log) => sum + (log.input_token_count || 0), 0) || 0;
        const totalOutputTokens = tokenData?.reduce((sum, log) => sum + (log.output_token_count || 0), 0) || 0;
        const { data: costData } = await this.client
            .from('ai_usage_logs')
            .select('estimated_cost')
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        const totalCost = costData?.reduce((sum, log) => sum + (log.estimated_cost || 0), 0) || 0;
        const { data: activeUsers } = await this.client
            .from('ai_usage_logs')
            .select('user_id')
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        const uniqueUsers = new Set(activeUsers?.map(log => log.user_id) || []).size;
        const { data: responseTimeData } = await this.client
            .from('ai_usage_logs')
            .select('response_time_ms')
            .not('response_time_ms', 'is', null)
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        const avgResponseTime = responseTimeData && responseTimeData.length > 0
            ? responseTimeData.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / responseTimeData.length
            : 0;
        return {
            totalCalls: totalCalls || 0,
            successCalls: successCalls || 0,
            successRate: totalCalls ? ((successCalls || 0) / totalCalls * 100).toFixed(1) : 0,
            totalInputTokens,
            totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
            totalCost,
            activeUsers: uniqueUsers,
            avgResponseTime: Math.round(avgResponseTime),
        };
    }
    async getModuleUsageStats(startDate, endDate) {
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        const { data, error } = await this.client
            .from('ai_usage_logs')
            .select('module_id, module_code')
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        if (error)
            throw new Error(error.message);
        const moduleStats = new Map();
        for (const log of data || []) {
            const key = log.module_code || log.module_id;
            moduleStats.set(key, (moduleStats.get(key) || 0) + 1);
        }
        const modules = await this.getAllModules();
        const result = modules.map(module => ({
            ...module,
            callCount: moduleStats.get(module.code) || moduleStats.get(module.id) || 0,
        }));
        return result.sort((a, b) => b.callCount - a.callCount);
    }
    async getUserUsageRanking(limit = 10, startDate, endDate) {
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        const { data, error } = await this.client
            .from('ai_usage_logs')
            .select('user_id, estimated_cost, input_token_count, output_token_count')
            .gte('created_at', start)
            .lte('created_at', end + ' 23:59:59');
        if (error)
            throw new Error(error.message);
        const userStats = new Map();
        for (const log of data || []) {
            if (!userStats.has(log.user_id)) {
                userStats.set(log.user_id, {
                    userId: log.user_id,
                    callCount: 0,
                    totalCost: 0,
                    totalTokens: 0,
                });
            }
            const stats = userStats.get(log.user_id);
            stats.callCount += 1;
            stats.totalCost += log.estimated_cost || 0;
            stats.totalTokens += (log.input_token_count || 0) + (log.output_token_count || 0);
        }
        const userIds = Array.from(userStats.keys()).slice(0, limit);
        const { data: users } = await this.client
            .from('users')
            .select('id, nickname, avatarUrl')
            .in('id', userIds);
        const ranking = Array.from(userStats.values())
            .sort((a, b) => b.callCount - a.callCount)
            .slice(0, limit)
            .map((stats, index) => {
            const user = users?.find(u => u.id === stats.userId);
            return {
                rank: index + 1,
                ...stats,
                nickname: user?.nickname,
                avatarUrl: user?.avatarUrl,
            };
        });
        return ranking;
    }
    async getUsageLogs(options = {}) {
        const { userId, moduleId, status, limit = 50, offset = 0 } = options;
        let query = this.client
            .from('ai_usage_logs')
            .select(`
        *,
        user:users(id, nickname, avatarUrl),
        module:ai_modules(id, code, name)
      `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (userId)
            query = query.eq('user_id', userId);
        if (moduleId)
            query = query.eq('module_id', moduleId);
        if (status)
            query = query.eq('status', status);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data || [];
    }
    async logUsage(logData) {
        const { data, error } = await this.client
            .from('ai_usage_logs')
            .insert(logData)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getSettings() {
        const { data, error } = await this.client
            .from('ai_settings')
            .select('*')
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116')
            throw new Error(error.message);
        if (!data) {
            const { data: newSettings, error: createError } = await this.client
                .from('ai_settings')
                .insert({
                response_style: 'professional',
                response_tone: 'neutral',
                max_response_length: 2000,
                enable_content_filter: true,
                sensitive_words: [],
                enable_ai_chat: true,
                enable_ai_writing: true,
                enable_ai_analysis: true,
            })
                .select()
                .single();
            if (createError)
                throw new Error(createError.message);
            return newSettings;
        }
        return data;
    }
    async updateSettings(updates, updatedBy) {
        const currentSettings = await this.getSettings();
        const { data, error } = await this.client
            .from('ai_settings')
            .update({
            ...updates,
            updated_by: updatedBy,
            updated_at: new Date().toISOString(),
        })
            .eq('id', currentSettings.id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { count: modelCount } = await this.client
            .from('ai_models')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        const { count: moduleCount } = await this.client
            .from('ai_modules')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        const { count: todayCalls } = await this.client
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const { data: monthCostData } = await this.client
            .from('ai_usage_logs')
            .select('estimated_cost')
            .gte('created_at', monthStart);
        const monthCost = monthCostData?.reduce((sum, log) => sum + (log.estimated_cost || 0), 0) || 0;
        const usageStats = await this.getUsageStats(weekAgo, today);
        return {
            modelCount: modelCount || 0,
            moduleCount: moduleCount || 0,
            todayCalls: todayCalls || 0,
            monthCost,
            ...usageStats,
        };
    }
    async getRecentLogs(limit = 10) {
        const { data, error } = await this.client
            .from('ai_usage_logs')
            .select(`
        id,
        status,
        created_at,
        response_time_ms,
        input_token_count,
        output_token_count,
        user:users(id, nickname),
        module:ai_modules(id, name)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return data || [];
    }
};
exports.AiAdminService = AiAdminService;
exports.AiAdminService = AiAdminService = __decorate([
    (0, common_1.Injectable)()
], AiAdminService);
//# sourceMappingURL=ai-admin.service.js.map