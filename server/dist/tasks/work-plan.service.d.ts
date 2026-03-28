import { UserService } from '../user/user.service';
export interface WorkPlan {
    id: string;
    userId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    progress: number;
    createdAt: string;
    updatedAt: string;
}
export interface WorkPlanTask {
    id: string;
    planId: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreatePlanDto {
    userId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}
export interface UpdatePlanDto {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: 'draft' | 'active' | 'completed' | 'archived';
}
export interface CreateTaskDto {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
}
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
}
export declare class WorkPlanService {
    private readonly userService;
    private client;
    constructor(userService: UserService);
    createPlan(dto: CreatePlanDto): Promise<WorkPlan>;
    getUserPlans(currentUserId: string, targetUserId?: string, status?: string, limit?: number, offset?: number): Promise<{
        plans: WorkPlan[];
        total: number;
    }>;
    getPlanById(planId: string, currentUserId: string): Promise<WorkPlan>;
    updatePlan(planId: string, currentUserId: string, dto: UpdatePlanDto): Promise<WorkPlan>;
    deletePlan(planId: string, currentUserId: string): Promise<void>;
    addTaskToPlan(planId: string, currentUserId: string, dto: CreateTaskDto): Promise<WorkPlanTask>;
    getPlanTasks(planId: string, currentUserId: string): Promise<WorkPlanTask[]>;
    updateTask(taskId: string, planId: string, currentUserId: string, dto: UpdateTaskDto): Promise<WorkPlanTask>;
    deleteTask(taskId: string, planId: string, currentUserId: string): Promise<void>;
    getTaskById(taskId: string, planId: string, currentUserId: string): Promise<WorkPlanTask>;
    private mapToPlan;
    private mapToTask;
}
