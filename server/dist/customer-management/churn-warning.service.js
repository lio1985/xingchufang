"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChurnWarningService = exports.DEFAULT_CHURN_CONFIG = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../storage/database/supabase-client");
exports.DEFAULT_CHURN_CONFIG = {
    yellowThreshold: 7,
    orangeThreshold: 14,
    redThreshold: 30,
    competitorMentionWeight: 20,
    priceSensitivityWeight: 15,
    negativeFeedbackWeight: 25,
    highValueDiscount: 10,
    loyalCustomerDiscount: 15,
};
let ChurnWarningService = class ChurnWarningService {
    constructor() {
        this.config = exports.DEFAULT_CHURN_CONFIG;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    getConfig() {
        return { ...this.config };
    }
    async assessCustomerRisk(customerId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*, users(name)')
            .eq('id', customerId)
            .eq('is_deleted', false)
            .single();
        if (customerError || !customer) {
            console.error('[ChurnWarning] Customer not found:', customerId);
            return null;
        }
        const { data: followUps, error: followUpError } = await supabase
            .from('customer_follow_ups')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(5);
        if (followUpError) {
            console.error('[ChurnWarning] Follow-up query error:', followUpError);
        }
        const lastFollowUp = followUps?.[0];
        const lastFollowUpDate = lastFollowUp?.created_at;
        const daysSinceLastFollowUp = lastFollowUpDate
            ? Math.floor((Date.now() - new Date(lastFollowUpDate).getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));
        let riskScore = 0;
        const riskFactors = [];
        const suggestedActions = [];
        if (daysSinceLastFollowUp >= this.config.redThreshold) {
            riskScore += 50;
            riskFactors.push(`超过${this.config.redThreshold}天未跟进`);
            suggestedActions.push('立即电话回访，了解客户现状');
            suggestedActions.push('发送关怀短信或微信');
        }
        else if (daysSinceLastFollowUp >= this.config.orangeThreshold) {
            riskScore += 35;
            riskFactors.push(`超过${this.config.orangeThreshold}天未跟进`);
            suggestedActions.push('安排专人跟进，了解客户需求变化');
        }
        else if (daysSinceLastFollowUp >= this.config.yellowThreshold) {
            riskScore += 20;
            riskFactors.push(`超过${this.config.yellowThreshold}天未跟进`);
            suggestedActions.push('发送产品资料或优惠信息');
        }
        followUps?.forEach(fu => {
            const content = fu.content?.toLowerCase() || '';
            if (content.includes('竞品') || content.includes('竞争对手') || content.includes('别家')) {
                riskScore += this.config.competitorMentionWeight;
                if (!riskFactors.includes('客户提及竞品')) {
                    riskFactors.push('客户提及竞品');
                    suggestedActions.push('准备竞品对比资料，突出差异化优势');
                }
            }
            if (content.includes('贵') || content.includes('便宜') || content.includes('预算') || content.includes('降价')) {
                riskScore += this.config.priceSensitivityWeight;
                if (!riskFactors.includes('客户对价格敏感')) {
                    riskFactors.push('客户对价格敏感');
                    suggestedActions.push('提供优惠方案或分期付款选项');
                }
            }
            if (content.includes('不满意') || content.includes('失望') || content.includes('问题') || content.includes('投诉')) {
                riskScore += this.config.negativeFeedbackWeight;
                if (!riskFactors.includes('客户表达不满')) {
                    riskFactors.push('客户表达不满');
                    suggestedActions.push('主管亲自跟进，解决客户问题');
                }
            }
        });
        if (customer.status === 'at_risk') {
            riskScore += 15;
            riskFactors.push('客户状态标记为有风险');
        }
        else if (customer.status === 'lost') {
            riskScore += 30;
            riskFactors.push('客户已流失');
        }
        if (customer.order_status === 'in_progress' && daysSinceLastFollowUp > 14) {
            riskScore += 10;
            riskFactors.push('进行中的订单长期无进展');
        }
        const estimatedAmount = parseFloat(customer.estimated_amount) || 0;
        if (estimatedAmount > 100000) {
            riskScore -= this.config.highValueDiscount;
            riskFactors.push('高价值客户（优先级提升）');
        }
        riskScore = Math.max(0, Math.min(100, riskScore));
        let riskLevel = 'low';
        if (riskScore >= 60 || daysSinceLastFollowUp >= this.config.redThreshold) {
            riskLevel = 'red';
        }
        else if (riskScore >= 40 || daysSinceLastFollowUp >= this.config.orangeThreshold) {
            riskLevel = 'orange';
        }
        else if (riskScore >= 20 || daysSinceLastFollowUp >= this.config.yellowThreshold) {
            riskLevel = 'yellow';
        }
        if (suggestedActions.length === 0) {
            suggestedActions.push('定期保持联系，维护客户关系');
        }
        return {
            customerId,
            customerName: customer.name,
            riskLevel,
            riskScore,
            daysSinceLastFollowUp,
            riskFactors,
            suggestedActions,
            lastFollowUpDate,
            salesName: Array.isArray(customer.users) && customer.users[0]?.name
                ? customer.users[0].name
                : (customer.users?.name || '未知'),
            estimatedAmount,
        };
    }
    async assessAllCustomers(salesId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let query = supabase
            .from('customers')
            .select('id')
            .eq('is_deleted', false);
        if (salesId && salesId.trim() !== '') {
            query = query.eq('user_id', salesId);
        }
        const { data: customers, error } = await query;
        if (error) {
            console.error('[ChurnWarning] Query error:', error);
            throw new Error(`查询客户失败: ${error.message}`);
        }
        const assessments = [];
        for (const customer of customers || []) {
            const assessment = await this.assessCustomerRisk(customer.id);
            if (assessment && assessment.riskLevel !== 'low') {
                assessments.push(assessment);
            }
        }
        return assessments.sort((a, b) => b.riskScore - a.riskScore);
    }
    async getRiskStatistics(salesId) {
        const assessments = await this.assessAllCustomers(salesId);
        const stats = {
            total: assessments.length,
            red: assessments.filter(a => a.riskLevel === 'red').length,
            orange: assessments.filter(a => a.riskLevel === 'orange').length,
            yellow: assessments.filter(a => a.riskLevel === 'yellow').length,
            totalAtRisk: assessments.filter(a => a.estimatedAmount).reduce((sum, a) => sum + (a.estimatedAmount || 0), 0),
        };
        return stats;
    }
    async generateWarningReport(salesId) {
        const assessments = await this.assessAllCustomers(salesId);
        const stats = await this.getRiskStatistics(salesId);
        const bySales = {};
        assessments.forEach(a => {
            const salesName = a.salesName || '未知';
            if (!bySales[salesName]) {
                bySales[salesName] = [];
            }
            bySales[salesName].push(a);
        });
        return {
            generatedAt: new Date().toISOString(),
            statistics: stats,
            highRiskCustomers: assessments.slice(0, 10),
            bySales,
        };
    }
    async createHandleRecord(record) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('churn_warning_records')
            .insert([{
                ...record,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }])
            .select()
            .single();
        if (error) {
            console.error('[ChurnWarning] Create handle record error:', error);
            return null;
        }
        if (record.handle_result === 'success' || record.handle_result === 'converted') {
            await supabase
                .from('customers')
                .update({
                status: record.handle_result === 'converted' ? 'converted' : 'normal',
                updated_at: new Date().toISOString(),
            })
                .eq('id', record.customer_id);
        }
        return data;
    }
    async getHandleRecords(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let query = supabase
            .from('churn_warning_records')
            .select('*', { count: 'exact' });
        if (params.customerId) {
            query = query.eq('customer_id', params.customerId);
        }
        if (params.handlerId) {
            query = query.eq('handled_by', params.handlerId);
        }
        if (params.riskLevel) {
            query = query.eq('risk_level', params.riskLevel);
        }
        if (params.handleResult) {
            query = query.eq('handle_result', params.handleResult);
        }
        if (params.startDate) {
            query = query.gte('created_at', params.startDate);
        }
        if (params.endDate) {
            query = query.lte('created_at', params.endDate);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);
        if (error) {
            console.error('[ChurnWarning] Get handle records error:', error);
            return { records: [], total: 0 };
        }
        return { records: data || [], total: count || 0 };
    }
    async updateHandleRecord(recordId, updates) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { error } = await supabase
            .from('churn_warning_records')
            .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
            .eq('id', recordId);
        if (error) {
            console.error('[ChurnWarning] Update handle record error:', error);
            return false;
        }
        return true;
    }
    async getHandleResultStats(params) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let query = supabase
            .from('churn_warning_records')
            .select('*');
        if (params.handlerId) {
            query = query.eq('handled_by', params.handlerId);
        }
        if (params.startDate) {
            query = query.gte('created_at', params.startDate);
        }
        if (params.endDate) {
            query = query.lte('created_at', params.endDate);
        }
        const { data: records, error } = await query;
        if (error || !records) {
            console.error('[ChurnWarning] Get stats error:', error);
            return this.getEmptyStats();
        }
        const totalWarnings = records.length;
        const handledRecords = records.filter(r => r.handle_result !== 'pending');
        const handledCount = handledRecords.length;
        const successCount = records.filter(r => r.handle_result === 'success').length;
        const convertedCount = records.filter(r => r.handle_result === 'converted').length;
        const failedCount = records.filter(r => r.handle_result === 'failed').length;
        const pendingCount = records.filter(r => r.handle_result === 'pending').length;
        const successRate = handledCount > 0
            ? Math.round(((successCount + convertedCount) / handledCount) * 100)
            : 0;
        const conversionRate = handledCount > 0
            ? Math.round((convertedCount / handledCount) * 100)
            : 0;
        const byActionType = {};
        const actionTypes = ['phone', 'visit', 'message', 'email', 'other'];
        actionTypes.forEach(action => {
            const actionRecords = records.filter(r => r.handle_action === action);
            const actionHandled = actionRecords.filter(r => r.handle_result !== 'pending');
            const actionSuccess = actionRecords.filter(r => r.handle_result === 'success' || r.handle_result === 'converted').length;
            byActionType[action] = {
                count: actionRecords.length,
                successRate: actionHandled.length > 0 ? Math.round((actionSuccess / actionHandled.length) * 100) : 0,
            };
        });
        const byRiskLevel = {};
        const riskLevels = ['yellow', 'orange', 'red'];
        riskLevels.forEach(level => {
            const levelRecords = records.filter(r => r.risk_level === level);
            const levelHandled = levelRecords.filter(r => r.handle_result !== 'pending');
            const levelSuccess = levelRecords.filter(r => r.handle_result === 'success' || r.handle_result === 'converted').length;
            byRiskLevel[level] = {
                count: levelRecords.length,
                successRate: levelHandled.length > 0 ? Math.round((levelSuccess / levelHandled.length) * 100) : 0,
            };
        });
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toISOString().slice(0, 7);
            const monthRecords = records.filter(r => r.created_at?.startsWith(monthStr));
            monthlyTrend.push({
                month: monthStr,
                warnings: monthRecords.length,
                handled: monthRecords.filter(r => r.handle_result !== 'pending').length,
                success: monthRecords.filter(r => r.handle_result === 'success').length,
                converted: monthRecords.filter(r => r.handle_result === 'converted').length,
            });
        }
        return {
            totalWarnings,
            handledCount,
            successCount,
            convertedCount,
            failedCount,
            pendingCount,
            successRate,
            conversionRate,
            byActionType,
            byRiskLevel,
            monthlyTrend,
        };
    }
    async getHandlerRanking(limit = 10) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: records, error } = await supabase
            .from('churn_warning_records')
            .select('handled_by, handler_name, handle_result');
        if (error || !records) {
            console.error('[ChurnWarning] Get ranking error:', error);
            return [];
        }
        const handlerMap = {};
        records.forEach(record => {
            const key = record.handled_by;
            if (!handlerMap[key]) {
                handlerMap[key] = {
                    handlerId: record.handled_by,
                    handlerName: record.handler_name,
                    totalHandled: 0,
                    successCount: 0,
                    convertedCount: 0,
                };
            }
            if (record.handle_result !== 'pending') {
                handlerMap[key].totalHandled++;
                if (record.handle_result === 'success') {
                    handlerMap[key].successCount++;
                }
                else if (record.handle_result === 'converted') {
                    handlerMap[key].convertedCount++;
                }
            }
        });
        const rankings = Object.values(handlerMap).map(h => ({
            ...h,
            successRate: h.totalHandled > 0
                ? Math.round(((h.successCount + h.convertedCount) / h.totalHandled) * 100)
                : 0,
        }));
        return rankings
            .sort((a, b) => b.totalHandled - a.totalHandled)
            .slice(0, limit);
    }
    getEmptyStats() {
        return {
            totalWarnings: 0,
            handledCount: 0,
            successCount: 0,
            convertedCount: 0,
            failedCount: 0,
            pendingCount: 0,
            successRate: 0,
            conversionRate: 0,
            byActionType: {},
            byRiskLevel: {},
            monthlyTrend: [],
        };
    }
};
exports.ChurnWarningService = ChurnWarningService;
exports.ChurnWarningService = ChurnWarningService = __decorate([
    (0, common_1.Injectable)()
], ChurnWarningService);
//# sourceMappingURL=churn-warning.service.js.map