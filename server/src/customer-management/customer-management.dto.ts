import { IsString, IsOptional, IsNumber, IsEnum, IsJSON, IsDateString, IsDecimal, IsUUID } from 'class-validator';

export enum CustomerStatus {
  NORMAL = 'normal',
  AT_RISK = 'at_risk',
  LOST = 'lost'
}

export enum OrderStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum CustomerType {
  NEWBIE = '餐饮小白创业',
  OWNER = '餐饮老板',
  OTHER = '其他'
}

export enum OrderBelonging {
  WAREHOUSE = '星厨房总仓',
  BAGUOCheng = '巴国城店',
  WULIDIAN = '五里店董家溪店'
}

export enum CustomerSource {
  DOUYIN = '抖音',
  XIAOHONGSHU = '小红书',
  REFERRAL = '转介绍',
  OFFLINE = '线下',
  OTHER = '其他'
}

export class CreateCustomerDto {
  @IsString()
  name: string; // 称呼

  @IsOptional()
  @IsString()
  wechat?: string; // 微信号

  @IsOptional()
  @IsString()
  xiaohongshu?: string; // 小红书号

  @IsOptional()
  @IsString()
  douyin?: string; // 抖音号

  @IsOptional()
  @IsString()
  phone?: string; // 手机号码

  @IsOptional()
  @IsString()
  category?: string; // 餐饮类别

  @IsOptional()
  @IsString()
  city?: string; // 所在城市

  @IsOptional()
  location?: { // 项目位置
    latitude: number;
    longitude: number;
    address: string;
  };

  @IsOptional()
  @IsString()
  source?: string; // 客户来源（前端发送中文：抖音、小红书等）

  @IsOptional()
  @IsString()
  customer_type?: string; // 客户类别（前端发送中文：餐饮小白创业、餐饮老板、其他）

  @IsOptional()
  @IsString()
  requirements?: string; // 客户需求

  @IsOptional()
  @IsString()
  estimated_amount?: string; // 预计销售金额

  @IsOptional()
  @IsDateString()
  first_follow_up_at?: string; // 第一轮跟进时间

  @IsOptional()
  @IsString()
  first_follow_up_content?: string; // 第一轮跟进内容

  @IsOptional()
  @IsString()
  first_follow_up_method?: string; // 第一轮跟进方式

  @IsOptional()
  @IsString()
  status?: string; // 客户状态（normal, at_risk, lost）

  @IsOptional()
  @IsString()
  order_belonging?: string; // 订单归属（星厨房总仓、巴国城店、五里店董家溪店）

  @IsOptional()
  @IsString()
  order_status?: string; // 订单状态（in_progress, completed）
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  wechat?: string;

  @IsOptional()
  @IsString()
  xiaohongshu?: string;

  @IsOptional()
  @IsString()
  douyin?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  customer_type?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  estimated_amount?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  order_belonging?: string;

  @IsOptional()
  @IsString()
  order_status?: string;

  @IsOptional()
  @IsString()
  statusChangeReason?: string; // 状态变更原因
}

export class CreateFollowUpDto {
  @IsDateString()
  followUpTime: string; // 跟进时间

  @IsString()
  content: string; // 跟进内容

  @IsOptional()
  @IsString()
  followUpMethod?: string; // 跟进方式

  @IsOptional()
  @IsString()
  nextFollowUpPlan?: string; // 下次跟进计划
}

export class CustomerQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsString()
  status?: string; // normal, at_risk, lost

  @IsOptional()
  @IsString()
  customer_type?: string; // 餐饮小白创业, 餐饮老板, 其他

  @IsOptional()
  @IsString()
  order_belonging?: string; // 星厨房总仓, 巴国城店, 五里店董家溪店

  @IsOptional()
  @IsString()
  order_status?: string; // in_progress, completed

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}
