"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesTargetService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../../storage/database/supabase-client");
let SalesTargetService = class SalesTargetService {
    async createTarget(target) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('sales_targets')
            .insert([{
                ...target,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }])
            .select()
            .single();
        if (error) {
            console.error('[SalesTarget] Create error:', error);
            return null;
        }
        return data;
    }
    async updateTarget(targetId, updates) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { error } = await supabase
            .from('sales_targets')
            .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
            .eq('id', targetId);
        if (error) {
            console.error('[SalesTarget] Update error:', error);
            return false;
        }
        return true;
    }
    async deleteTarget(targetId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { error } = await supabase
            .from('sales_targets')
            .delete()
            .eq('id', targetId);
        if (error) {
            console.error('[SalesTarget] Delete error:', error);
            return false;
        }
        return true;
    }
    async getTargetById(targetId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('sales_targets')
            .select('*, users(name)')
            .eq('id', targetId)
            .single();
        if (error || !data) {
            console.error('[SalesTarget] Get by id error:', error);
            return null;
        }
        return {
            ...data,
            user_name: data.users?.name,
        };
    }
    async getTargets(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let query = supabase
            .from('sales_targets')
            .select('*, users(name)', { count: 'exact' });
        if (params.userId && params.userId.trim() !== '') {
            query = query.eq('user_id', params.userId);
        }
        if (params.targetType) {
            query = query.eq('target_type', params.targetType);
        }
        if (params.year) {
            query = query.eq('target_year', params.year);
        }
        if (params.month) {
            query = query.eq('target_month', params.month);
        }
        if (params.quarter) {
            query = query.eq('target_quarter', params.quarter);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }
        const { data, error, count } = await query
            .order('target_year', { ascending: false })
            .order('target_month', { ascending: false })
            .order('target_quarter', { ascending: false })
            .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);
        if (error) {
            console.error('[SalesTarget] Get list error:', error);
            return { targets: [], total: 0 };
        }
        const targets = (data || []).map(item => ({
            ...item,
            user_name: item.users?.name,
        }));
        return { targets, total: count || 0 };
    }
    async getCurrentTarget(userId, type) {
        const now = new Date();
        const year = now.getFullYear();
        let query = (0, supabase_client_1.getSupabaseClient)()
            .from('sales_targets')
            .select('*')
            .eq('user_id', userId)
            .eq('target_type', type)
            .eq('target_year', year)
            .eq('status', 'active');
        if (type === 'monthly') {
            query = query.eq('target_month', now.getMonth() + 1);
        }
        else if (type === 'quarterly') {
            const quarter = Math.floor(now.getMonth() / 3) + 1;
            query = query.eq('target_quarter', quarter);
        }
        const { data, error } = await query.single();
        if (error) {
            return null;
        }
        return data;
    }
    async getTargetProgress(targetId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const target = await this.getTargetById(targetId);
        if (!target)
            return null;
        const { data: customers, error } = await supabase
            .from('customers')
            .select('actual_amount, order_status')
            .eq('user_id', target.user_id)
            .eq('is_deleted', false)
            .gte('created_at', target.start_date)
            .lte('created_at', target.end_date);
        if (error) {
            console.error('[SalesTarget] Get progress error:', error);
            return null;
        }
        const currentAmount = customers?.reduce((sum, c) => sum + (parseFloat(c.actual_amount) || 0), 0) || 0;
        const currentDeals = customers?.filter(c => c.order_status === 'completed').length || 0;
        const currentCustomers = customers?.length || 0;
        const amountProgress = target.target_amount > 0 ? Math.round((currentAmount / target.target_amount) * 100) : 0;
        const dealsProgress = target.target_deals > 0 ? Math.round((currentDeals / target.target_deals) * 100) : 0;
        const customersProgress = target.target_customers > 0 ? Math.round((currentCustomers / target.target_customers) * 100) : 0;
        const start = new Date(target.start_date);
        const end = new Date(target.end_date);
        const now = new Date();
        const daysTotal = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const timeProgress = daysTotal > 0 ? Math.round((daysElapsed / daysTotal) * 100) : 0;
        const isAhead = amountProgress >= timeProgress;
        const gapAmount = target.target_amount - currentAmount;
        return {
            target,
            currentAmount,
            currentDeals,
            currentCustomers,
            amountProgress,
            dealsProgress,
            customersProgress,
            daysElapsed,
            daysTotal,
            timeProgress,
            isAhead,
            gapAmount,
        };
    }
    async getUserTargetsProgress(userId) {
        const { targets } = await this.getTargets({
            userId,
            status: 'active',
            limit: 100,
        });
        const progresses = [];
        for (const target of targets) {
            const progress = await this.getTargetProgress(target.id);
            if (progress) {
                progresses.push(progress);
            }
        }
        return progresses.sort((a, b) => b.amountProgress - a.amountProgress);
    }
    async getTeamTargetStats(year, month, quarter) {
        const now = new Date();
        const targetYear = year || now.getFullYear();
        const { targets } = await this.getTargets({
            year: targetYear,
            month,
            quarter,
            status: 'active',
            limit: 1000,
        });
        let totalTargetAmount = 0;
        let totalAchievedAmount = 0;
        const memberMap = {};
        for (const target of targets) {
            const progress = await this.getTargetProgress(target.id);
            if (!progress)
                continue;
            totalTargetAmount += target.target_amount;
            totalAchievedAmount += progress.currentAmount;
            const key = target.user_id;
            if (!memberMap[key]) {
                memberMap[key] = {
                    userId: target.user_id,
                    userName: target.user_name || '未知',
                    targetAmount: 0,
                    achievedAmount: 0,
                };
            }
            memberMap[key].targetAmount += target.target_amount;
            memberMap[key].achievedAmount += progress.currentAmount;
        }
        const byMember = Object.values(memberMap)
            .map(m => ({
            ...m,
            progress: m.targetAmount > 0 ? Math.round((m.achievedAmount / m.targetAmount) * 100) : 0,
            rank: 0,
        }))
            .sort((a, b) => b.progress - a.progress)
            .map((m, idx) => ({ ...m, rank: idx + 1 }));
        return {
            totalTargets: targets.length,
            achievedTargets: byMember.filter(m => m.progress >= 100).length,
            totalTargetAmount,
            totalAchievedAmount,
            overallProgress: totalTargetAmount > 0 ? Math.round((totalAchievedAmount / totalTargetAmount) * 100) : 0,
            byMember,
        };
    }
    async checkAndSuggestTarget(userId) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        const monthlyTarget = await this.getCurrentTarget(userId, 'monthly');
        if (!monthlyTarget) {
            return {
                needsTarget: true,
                suggestedType: 'monthly',
                message: `${year}年${month}月业绩目标尚未设置`,
            };
        }
        const quarterlyTarget = await this.getCurrentTarget(userId, 'quarterly');
        if (!quarterlyTarget) {
            return {
                needsTarget: true,
                suggestedType: 'quarterly',
                message: `${year}年第${quarter}季度业绩目标尚未设置`,
            };
        }
        const yearlyTarget = await this.getCurrentTarget(userId, 'yearly');
        if (!yearlyTarget) {
            return {
                needsTarget: true,
                suggestedType: 'yearly',
                message: `${year}年年度业绩目标尚未设置`,
            };
        }
        return {
            needsTarget: false,
            suggestedType: '',
            message: '当前期间目标已设置',
        };
    }
};
exports.SalesTargetService = SalesTargetService;
exports.SalesTargetService = SalesTargetService = __decorate([
    (0, common_1.Injectable)()
], SalesTargetService);
//# sourceMappingURL=sales-target.service.js.map