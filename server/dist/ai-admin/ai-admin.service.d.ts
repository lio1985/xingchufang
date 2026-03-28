export interface AiModel {
    id: string;
    name: string;
    provider: string;
    model_id: string;
    api_key?: string;
    api_endpoint?: string;
    max_tokens: number;
    temperature: number;
    top_p: number;
    input_cost_per_1k?: number;
    output_cost_per_1k?: number;
    capabilities: string[];
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}
export interface AiModule {
    id: string;
    code: string;
    name: string;
    description?: string;
    position?: string;
    responsibility?: string;
    model_id?: string;
    prompt_template: string;
    system_prompt?: string;
    temperature?: number;
    max_tokens?: number;
    context_enabled: boolean;
    context_max_turns: number;
    allowed_roles: string[];
    daily_limit_per_user?: number;
    is_active: boolean;
    icon?: string;
    display_order: number;
    created_at: string;
    updated_at: string;
    model?: AiModel;
}
export interface AiUsageLog {
    id: string;
    user_id: string;
    team_id?: string;
    module_id: string;
    module_code?: string;
    model_id?: string;
    model_name?: string;
    input_messages?: any;
    input_token_count?: number;
    output_content?: string;
    output_token_count?: number;
    response_time_ms?: number;
    estimated_cost?: number;
    status: string;
    error_message?: string;
    user_rating?: number;
    user_feedback?: string;
    created_at: string;
}
export interface AiSettings {
    id: string;
    default_model_id?: string;
    response_style: string;
    response_tone: string;
    max_response_length: number;
    enable_content_filter: boolean;
    sensitive_words: string[];
    global_system_prompt?: string;
    prompt_enhancements?: any;
    monthly_budget?: number;
    alert_threshold?: number;
    enable_ai_chat: boolean;
    enable_ai_writing: boolean;
    enable_ai_analysis: boolean;
    updated_by?: string;
    updated_at: string;
}
export declare class AiAdminService {
    private client;
    getAllModels(): Promise<AiModel[]>;
    getModelById(id: string): Promise<AiModel | null>;
    createModel(modelData: Partial<AiModel>): Promise<AiModel>;
    updateModel(id: string, updates: Partial<AiModel>): Promise<AiModel>;
    deleteModel(id: string): Promise<void>;
    setDefaultModel(id: string): Promise<void>;
    getAllModules(): Promise<AiModule[]>;
    getModuleById(id: string): Promise<AiModule | null>;
    createModule(moduleData: Partial<AiModule>): Promise<AiModule>;
    updateModule(id: string, updates: Partial<AiModule>): Promise<AiModule>;
    deleteModule(id: string): Promise<void>;
    toggleModule(id: string): Promise<AiModule>;
    getUsageStats(startDate?: string, endDate?: string): Promise<{
        totalCalls: number;
        successCalls: number;
        successRate: string | number;
        totalInputTokens: any;
        totalOutputTokens: any;
        totalTokens: any;
        totalCost: any;
        activeUsers: number;
        avgResponseTime: number;
    }>;
    getModuleUsageStats(startDate?: string, endDate?: string): Promise<{
        callCount: number;
        id: string;
        code: string;
        name: string;
        description?: string;
        position?: string;
        responsibility?: string;
        model_id?: string;
        prompt_template: string;
        system_prompt?: string;
        temperature?: number;
        max_tokens?: number;
        context_enabled: boolean;
        context_max_turns: number;
        allowed_roles: string[];
        daily_limit_per_user?: number;
        is_active: boolean;
        icon?: string;
        display_order: number;
        created_at: string;
        updated_at: string;
        model?: AiModel;
    }[]>;
    getUserUsageRanking(limit?: number, startDate?: string, endDate?: string): Promise<any[]>;
    getUsageLogs(options?: {
        userId?: string;
        moduleId?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<any[]>;
    logUsage(logData: Partial<AiUsageLog>): Promise<AiUsageLog>;
    getSettings(): Promise<AiSettings>;
    updateSettings(updates: Partial<AiSettings>, updatedBy?: string): Promise<AiSettings>;
    getDashboardStats(): Promise<{
        totalCalls: number;
        successCalls: number;
        successRate: string | number;
        totalInputTokens: any;
        totalOutputTokens: any;
        totalTokens: any;
        totalCost: any;
        activeUsers: number;
        avgResponseTime: number;
        modelCount: number;
        moduleCount: number;
        todayCalls: number;
        monthCost: any;
    }>;
    getRecentLogs(limit?: number): Promise<{
        id: any;
        status: any;
        created_at: any;
        response_time_ms: any;
        input_token_count: any;
        output_token_count: any;
        user: {
            id: any;
            nickname: any;
        }[];
        module: {
            id: any;
            name: any;
        }[];
    }[]>;
}
