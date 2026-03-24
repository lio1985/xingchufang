import { Injectable } from '@nestjs/common';
import { Inspiration, CreateInspirationDto } from '../types/inspiration.types';

@Injectable()
export class InspirationService {
  // 模拟数据存储（生产环境应使用数据库）
  private inspirations: Inspiration[] = [
    {
      id: '1',
      content: '尝试拍摄"一日三餐"的系列视频，展示不同地区的美食文化',
      createdAt: '2025-01-10T08:30:00Z',
      updatedAt: '2025-01-10T08:30:00Z'
    },
    {
      id: '2',
      content: '结合最近的"国潮"趋势，做一期传统文化与现代生活结合的内容',
      createdAt: '2025-01-09T14:20:00Z',
      updatedAt: '2025-01-09T14:20:00Z'
    }
  ];

  // 获取所有灵感（按创建时间倒序）
  findAll(): Inspiration[] {
    return [...this.inspirations].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // 根据ID获取灵感
  findOne(id: string): Inspiration | undefined {
    return this.inspirations.find(ins => ins.id === id);
  }

  // 创建新灵感
  create(createInspirationDto: CreateInspirationDto): Inspiration {
    const now = new Date().toISOString();
    const newInspiration: Inspiration = {
      id: Date.now().toString(),
      content: createInspirationDto.content || '',
      images: createInspirationDto.images || [],
      createdAt: now,
      updatedAt: now
    };
    this.inspirations.unshift(newInspiration);
    return newInspiration;
  }

  // 删除灵感
  delete(id: string): boolean {
    const index = this.inspirations.findIndex(ins => ins.id === id);
    if (index !== -1) {
      this.inspirations.splice(index, 1);
      return true;
    }
    return false;
  }
}
