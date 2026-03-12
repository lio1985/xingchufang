import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { InspirationService } from './inspiration.service';
import { CreateInspirationDto } from '../types/inspiration.types';

@Controller('inspirations')
export class InspirationController {
  constructor(private readonly inspirationService: InspirationService) {}

  // 获取所有灵感
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    const inspirations = this.inspirationService.findAll();
    return {
      code: 200,
      msg: 'success',
      data: inspirations
    };
  }

  // 创建新灵感
  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() createInspirationDto: CreateInspirationDto) {
    console.log('创建灵感，请求参数：', createInspirationDto);

    if (!createInspirationDto.content || createInspirationDto.content.trim() === '') {
      return {
        code: 400,
        msg: '灵感内容不能为空',
        data: null
      };
    }

    const inspiration = this.inspirationService.create(createInspirationDto);
    console.log('灵感创建成功：', inspiration);

    return {
      code: 200,
      msg: 'success',
      data: inspiration
    };
  }

  // 删除灵感
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    console.log('删除灵感，ID：', id);

    const success = this.inspirationService.delete(id);

    if (success) {
      console.log('灵感删除成功');
      return {
        code: 200,
        msg: 'success',
        data: null
      };
    } else {
      console.log('灵感删除失败，未找到该灵感');
      return {
        code: 404,
        msg: '灵感不存在',
        data: null
      };
    }
  }
}
