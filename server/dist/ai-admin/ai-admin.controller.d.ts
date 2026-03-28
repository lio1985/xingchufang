import { AiAdminService } from './ai-admin.service';
export declare class AiAdminController {
    private readonly aiAdminService;
    constructor(aiAdminService: AiAdminService);
    getDashboard(): Promise<{
        code: number;
        msg: string;
        data: {
            stats: {
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
            };
            recentLogs: {
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
            }[];
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getAllModels(): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModel[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getModel(id: string): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModel;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    createModel(modelData: any): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModel;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    updateModel(id: string, updates: any): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModel;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    deleteModel(id: string): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    setDefaultModel(id: string): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    testModel(id: string): Promise<{
        code: number;
        msg: string;
        data: {
            modelName: string;
            provider: string;
            testTime: string;
            responseTime: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getAllModules(): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModule[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getModule(id: string): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModule;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    createModule(moduleData: any): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModule;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    updateModule(id: string, updates: any): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModule;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    deleteModule(id: string): Promise<{
        code: number;
        msg: any;
        data: null;
    }>;
    toggleModule(id: string): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiModule;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getUsageStats(startDate?: string, endDate?: string): Promise<{
        code: number;
        msg: string;
        data: {
            totalCalls: number;
            successCalls: number;
            successRate: string | number;
            totalInputTokens: any;
            totalOutputTokens: any;
            totalTokens: any;
            totalCost: any;
            activeUsers: number;
            avgResponseTime: number;
        };
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getModuleUsageStats(startDate?: string, endDate?: string): Promise<{
        code: number;
        msg: string;
        data: {
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
            model?: import("./ai-admin.service").AiModel;
        }[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getUserUsageRanking(limit?: string, startDate?: string, endDate?: string): Promise<{
        code: number;
        msg: string;
        data: any[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getUsageLogs(userId?: string, moduleId?: string, status?: string, limit?: string, offset?: string): Promise<{
        code: number;
        msg: string;
        data: any[];
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    getSettings(): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiSettings;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
    updateSettings(updates: any, req: any): Promise<{
        code: number;
        msg: string;
        data: import("./ai-admin.service").AiSettings;
    } | {
        code: number;
        msg: any;
        data: null;
    }>;
}
