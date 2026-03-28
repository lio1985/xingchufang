export declare enum RecycleStatus {
    PENDING = "pending",
    CONTACTED = "contacted",
    ASSESSING = "assessing",
    NEGOTIATING = "negotiating",
    DEAL = "deal",
    RECYCLING = "recycling",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class CreateRecycleStoreDto {
    store_name: string;
    phone?: string;
    wechat?: string;
    xiaohongshu?: string;
    douyin?: string;
    city?: string;
    address?: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    business_type?: string;
    area_size?: number;
    open_date?: string;
    close_reason?: string;
    recycle_status?: RecycleStatus;
    estimated_devices?: string;
    estimated_value?: number;
    purchase_price?: number;
    transport_cost?: number;
    labor_cost?: number;
    total_cost?: number;
    recycle_date?: string;
    device_count?: number;
    device_status?: string;
    firstFollowUpAt?: string;
    firstFollowUpContent?: string;
    firstFollowUpMethod?: string;
}
export declare class UpdateRecycleStoreDto {
    store_name?: string;
    phone?: string;
    wechat?: string;
    xiaohongshu?: string;
    douyin?: string;
    city?: string;
    address?: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    business_type?: string;
    area_size?: number;
    open_date?: string;
    close_reason?: string;
    recycle_status?: RecycleStatus;
    estimated_devices?: string;
    estimated_value?: number;
    purchase_price?: number;
    transport_cost?: number;
    labor_cost?: number;
    total_cost?: number;
    recycle_date?: string;
    device_count?: number;
    device_status?: string;
}
export declare class CreateFollowUpDto {
    followUpTime: string;
    content: string;
    followUpMethod?: string;
    nextFollowUpPlan?: string;
}
export declare class RecycleStoreQueryDto {
    page?: number;
    pageSize?: number;
    status?: RecycleStatus;
    keyword?: string;
    orderBy?: string;
    order?: string;
}
