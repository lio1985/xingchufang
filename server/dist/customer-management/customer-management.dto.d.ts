export declare enum CustomerStatus {
    NORMAL = "normal",
    AT_RISK = "at_risk",
    LOST = "lost"
}
export declare enum OrderStatus {
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}
export declare enum CustomerType {
    NEWBIE = "\u9910\u996E\u5C0F\u767D\u521B\u4E1A",
    OWNER = "\u9910\u996E\u8001\u677F",
    OTHER = "\u5176\u4ED6"
}
export declare enum OrderBelonging {
    WAREHOUSE = "\u661F\u53A8\u623F\u603B\u4ED3",
    BAGUOCheng = "\u5DF4\u56FD\u57CE\u5E97",
    WULIDIAN = "\u4E94\u91CC\u5E97\u8463\u5BB6\u6EAA\u5E97"
}
export declare enum CustomerSource {
    DOUYIN = "\u6296\u97F3",
    XIAOHONGSHU = "\u5C0F\u7EA2\u4E66",
    REFERRAL = "\u8F6C\u4ECB\u7ECD",
    OFFLINE = "\u7EBF\u4E0B",
    OTHER = "\u5176\u4ED6"
}
export declare class CreateCustomerDto {
    name: string;
    wechat?: string;
    xiaohongshu?: string;
    douyin?: string;
    phone?: string;
    category?: string;
    city?: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    source?: CustomerSource;
    customerType?: CustomerType;
    requirements?: string;
    estimatedAmount?: string;
    firstFollowUpAt?: string;
    firstFollowUpContent?: string;
    firstFollowUpMethod?: string;
    status?: CustomerStatus;
    orderBelonging?: OrderBelonging;
    orderStatus?: OrderStatus;
}
export declare class UpdateCustomerDto {
    name?: string;
    wechat?: string;
    xiaohongshu?: string;
    douyin?: string;
    phone?: string;
    category?: string;
    city?: string;
    location?: {
        latitude: number;
        longitude: number;
        address: string;
    };
    source?: CustomerSource;
    customerType?: CustomerType;
    requirements?: string;
    estimatedAmount?: string;
    status?: CustomerStatus;
    orderBelonging?: OrderBelonging;
    orderStatus?: OrderStatus;
    statusChangeReason?: string;
}
export declare class CreateFollowUpDto {
    followUpTime: string;
    content: string;
    followUpMethod?: string;
    nextFollowUpPlan?: string;
}
export declare class CustomerQueryDto {
    page?: number;
    pageSize?: number;
    status?: CustomerStatus;
    customerType?: CustomerType;
    orderBelonging?: OrderBelonging;
    orderStatus?: OrderStatus;
    keyword?: string;
    userId?: string;
    orderBy?: string;
    order?: 'asc' | 'desc';
}
