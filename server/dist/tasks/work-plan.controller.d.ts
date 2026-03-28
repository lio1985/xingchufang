import { WorkPlanService, CreatePlanDto, UpdatePlanDto, CreateTaskDto, UpdateTaskDto } from './work-plan.service';
export declare class WorkPlanController {
    private readonly workPlanService;
    constructor(workPlanService: WorkPlanService);
    createPlan(req: any, dto: Omit<CreatePlanDto, 'userId'>): Promise<{
        code: number;
        msg: string;
        data: import("./work-plan.service").WorkPlan;
    }>;
    getUserPlans(req: any, targetUserId?: string, status?: string, limit?: string, offset?: string): Promise<{
        code: number;
        msg: string;
        data: {
            plans: import("./work-plan.service").WorkPlan[];
            total: number;
        };
    }>;
    getPlanById(planId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: import("./work-plan.service").WorkPlan;
    }>;
    updatePlan(planId: string, req: any, dto: UpdatePlanDto): Promise<{
        code: number;
        msg: string;
        data: import("./work-plan.service").WorkPlan;
    }>;
    deletePlan(planId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    }>;
    addTaskToPlan(planId: string, req: any, dto: CreateTaskDto): Promise<{
        code: number;
        msg: string;
        data: import("./work-plan.service").WorkPlanTask;
    }>;
    getPlanTasks(planId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            tasks: import("./work-plan.service").WorkPlanTask[];
            count: number;
        };
    }>;
    updateTask(planId: string, taskId: string, req: any, dto: UpdateTaskDto): Promise<{
        code: number;
        msg: string;
        data: import("./work-plan.service").WorkPlanTask;
    }>;
    deleteTask(planId: string, taskId: string, req: any): Promise<{
        code: number;
        msg: string;
        data: {
            message: string;
        };
    }>;
}
