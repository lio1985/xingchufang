import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

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
  @IsString()
  recycle_status?: string; // 移除严格枚举验证

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
  first_follow_up_at?: string;

  @IsOptional()
  @IsString()
  first_follow_up_content?: string;

  @IsOptional()
  @IsString()
  first_follow_up_method?: string;
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
  @IsString()
  recycle_status?: string;

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
  @IsString()
  status?: string;

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
