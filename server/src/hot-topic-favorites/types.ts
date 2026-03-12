export interface HotTopicFavorite {
  id: number;
  user_id: string;
  topic_id: string;
  title: string;
  url?: string;
  platform?: string;
  hotness: number;
  category?: string;
  site_name?: string;
  publish_time?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFavoriteDto {
  topic_id: string;
  title: string;
  url?: string;
  platform?: string;
  hotness: number;
  category?: string;
  site_name?: string;
  publish_time?: string;
}
