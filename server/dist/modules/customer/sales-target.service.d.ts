export interface SalesTarget {
    id?: string;
    user_id: string;
    target_type: 'monthly' | 'quarterly' | 'yearly';
    target_year: number;
    target_month?: number;
    target_quarter?: number;
    target_amount: number;
    target_deals: number;
    target_customers: number;
    description?: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    user_name?: string;
}
export interface TargetProgress {
    target: SalesTarget;
    currentAmount: number;
    currentDeals: number;
    currentCustomers: number;
    amountProgress: number;
    dealsProgress: number;
    customersProgress: number;
    daysElapsed: number;
    daysTotal: number;
    timeProgress: number;
    isAhead: boolean;
    gapAmount: number;
}
export interface TeamTargetStats {
    totalTargets: number;
    achievedTargets: number;
    totalTargetAmount: number;
    totalAchievedAmount: number;
    overallProgress: number;
    byMember: Array<{
        userId: string;
        userName: string;
        targetAmount: number;
        achievedAmount: number;
        progress: number;
        rank: number;
    }>;
}
export declare class SalesTargetService {
    createTarget(target: Omit<SalesTarget, 'id' | 'created_at' | 'updated_at'>): Promise<SalesTarget | null>;
    updateTarget(targetId: string, updates: Partial<SalesTarget>): Promise<boolean>;
    deleteTarget(targetId: string): Promise<boolean>;
    getTargetById(targetId: string): Promise<SalesTarget | null>;
    getTargets(params: {
        userId?: string;
        targetType?: string;
        year?: number;
        month?: number;
        quarter?: number;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        targets: SalesTarget[];
        total: number;
    }>;
    getCurrentTarget(userId: string, type: 'monthly' | 'quarterly' | 'yearly'): Promise<SalesTarget | null>;
    getTargetProgress(targetId: string): Promise<TargetProgress | null>;
    getUserTargetsProgress(userId: string): Promise<TargetProgress[]>;
    getTeamTargetStats(year?: number, month?: number, quarter?: number): Promise<TeamTargetStats>;
    checkAndSuggestTarget(userId: string): Promise<{
        needsTarget: boolean;
        suggestedType: string;
        message: string;
    }>;
}
