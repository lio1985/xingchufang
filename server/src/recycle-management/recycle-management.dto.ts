import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';

export enum RecycleStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  ASSESSING = 'assessing',
  NEGOTIATING = 'negotiating',
  DEAL = 'deal',
  RECYCLING = 'recycling',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class CreateRecycleStoreDto {
  @IsString()
  store_name: string;

  @IsOptional()
  @IsString()
  phone?: string;

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
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @IsOptional()
  @IsString()
  business_type?: string;

  @IsOptional()
  @IsNumber()
  area_size?: number;

  @IsOptional()
  @IsDateString()
  open_date?: string;

  @IsOptional()
  @IsString()
  close_reason?: string;

  @IsOptional()
  @IsEnum(RecycleStatus)
  recycle_status?: RecycleStatus;

  @IsOptional()
  @IsString()
  estimated_devices?: string;

  @IsOptional()
  @IsNumber()
  estimated_value?: number;

  @IsOptional()
  @IsNumber()
  purchase_price?: number;

  @IsOptional()
  @IsNumber()
  transport_cost?: number;

  @IsOptional()
  @IsNumber()
  labor_cost?: number;

  @IsOptional()
  @IsNumber()
  total_cost?: number;

  @IsOptional()
  @IsDateString()
  recycle_date?: string;

  @IsOptional()
  @IsNumber()
  device_count?: number;

  @IsOptional()
  @IsString()
  device_status?: string;

  @IsOptional()
  @IsDateString()
  firstFollowUpAt?: string;

  @IsOptional()
  @IsString()
  firstFollowUpContent?: string;

  @IsOptional()
  @IsString()
  firstFollowUpMethod?: string;
}

export class UpdateRecycleStoreDto {
  @IsOptional()
  @IsString()
  store_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

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
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @IsOptional()
  @IsString()
  business_type?: string;

  @IsOptional()
  @IsNumber()
  area_size?: number;

  @IsOptional()
  @IsDateString()
  open_date?: string;

  @IsOptional()
  @IsString()
  close_reason?: string;

  @IsOptional()
  @IsEnum(RecycleStatus)
  recycle_status?: RecycleStatus;

  @IsOptional()
  @IsString()
  estimated_devices?: string;

  @IsOptional()
  @IsNumber()
  estimated_value?: number;

  @IsOptional()
  @IsNumber()
  purchase_price?: number;

  @IsOptional()
  @IsNumber()
  transport_cost?: number;

  @IsOptional()
  @IsNumber()
  labor_cost?: number;

  @IsOptional()
  @IsNumber()
  total_cost?: number;

  @IsOptional()
  @IsDateString()
  recycle_date?: string;

  @IsOptional()
  @IsNumber()
  device_count?: number;

  @IsOptional()
  @IsString()
  device_status?: string;
}

export class CreateFollowUpDto {
  @IsDateString()
  followUpTime: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  followUpMethod?: string;

  @IsOptional()
  @IsString()
  nextFollowUpPlan?: string;
}

export class RecycleStoreQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsEnum(RecycleStatus)
  status?: RecycleStatus;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  order?: string;
}
