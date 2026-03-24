export interface Inspiration {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspirationDto {
  content: string;
  images?: string[];
}

export interface UpdateInspirationDto {
  content?: string;
  images?: string[];
}
