export interface ChurnRiskConfig {
    yellowThreshold: number;
    orangeThreshold: number;
    redThreshold: number;
    competitorMentionWeight: number;
    priceSensitivityWeight: number;
    negativeFeedbackWeight: number;
    highValueDiscount: number;
    loyalCustomerDiscount: number;
}
export interface ChurnRiskAssessment {
    customerId: string;
    customerName: string;
    riskLevel: 'low' | 'yellow' | 'orange' | 'red';
    riskScore: number;
    daysSinceLastFollowUp: number;
    riskFactors: string[];
    suggestedActions: string[];
    lastFollowUpDate?: string;
    salesName?: string;
    estimatedAmount?: number;
}
export interface ChurnWarningRecord {
    id?: string;
    customer_id: string;
    customer_name: string;
    risk_level: 'yellow' | 'orange' | 'red';
    risk_score: number;
    handled_by: string;
    handler_name: string;
    handle_action: 'phone' | 'visit' | 'message' | 'email' | 'other';
    handle_result: 'success' | 'pending' | 'failed' | 'converted';
    handle_notes?: string;
    follow_up_date?: string;
    created_at?: string;
    updated_at?: string;
}
export interface HandleResultStats {
    totalWarnings: number;
    handledCount: number;
    successCount: number;
    convertedCount: number;
    failedCount: number;
    pendingCount: number;
    successRate: number;
    conversionRate: number;
    byActionType: Record<string, {
        count: number;
        successRate: number;
    }>;
    byRiskLevel: Record<string, {
        count: number;
        successRate: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        warnings: number;
        handled: number;
        success: number;
        converted: number;
    }>;
}
export declare const DEFAULT_CHURN_CONFIG: ChurnRiskConfig;
export declare class ChurnWarningService {
    private config;
    updateConfig(newConfig: Partial<ChurnRiskConfig>): void;
    getConfig(): ChurnRiskConfig;
    assessCustomerRisk(customerId: string): Promise<ChurnRiskAssessment | null>;
    assessAllCustomers(salesId?: string): Promise<ChurnRiskAssessment[]>;
    getRiskStatistics(salesId?: string): Promise<{
        total: number;
        red: number;
        orange: number;
        yellow: number;
        totalAtRisk: number;
    }>;
    generateWarningReport(salesId?: string): Promise<{
        generatedAt: string;
        statistics: {
            total: number;
            red: number;
            orange: number;
            yellow: number;
            totalAtRisk: number;
        };
        highRiskCustomers: ChurnRiskAssessment[];
        bySales: Record<string, ChurnRiskAssessment[]>;
    }>;
    createHandleRecord(record: Omit<ChurnWarningRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ChurnWarningRecord | null>;
    getHandleRecords(params: {
        customerId?: string;
        handlerId?: string;
        riskLevel?: string;
        handleResult?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        records: ChurnWarningRecord[];
        total: number;
    }>;
    updateHandleRecord(recordId: string, updates: Partial<ChurnWarningRecord>): Promise<boolean>;
    getHandleResultStats(params: {
        handlerId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<HandleResultStats>;
    getHandlerRanking(limit?: number): Promise<Array<{
        handlerId: string;
        handlerName: string;
        totalHandled: number;
        successCount: number;
        convertedCount: number;
        successRate: number;
    }>>;
    private getEmptyStats;
}
