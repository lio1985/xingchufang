import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { QuickNotesService } from './quick-notes.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import {
  QuickNote,
  QuickNoteListResponse,
  CreateQuickNoteDto,
  UpdateQuickNoteDto,
} from './types';

@Controller('quick-notes')
export class QuickNotesController {
  constructor(private readonly quickNotesService: QuickNotesService) {}

  /**
   * 获取当前用户的笔记 - 支持游客模式（返回空数据）
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  async getAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('showStarredOnly') showStarredOnly?: string,
  ) {
    try {
      // 游客模式返回空数据
      if (!req.user) {
        return { 
          code: 200, 
          msg: 'success', 
          data: {
            list: [],
            pagination: {
              page: page || 1,
              pageSize: pageSize || 20,
              total: 0,
              totalPages: 0,
            }
          } 
        };
      }
      
      const userId = req.user.sub;
      const data = await this.quickNotesService.getByUserId(
        userId,
        userId,
        page,
        pageSize,
        search,
        tag,
        showStarredOnly === 'true',
      );
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 管理员获取所有用户的笔记
   */
  @Get('admin/all')
  @UseGuards(ActiveUserGuard, AdminGuard)
  async getAllForAdmin(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('showStarredOnly') showStarredOnly?: string,
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.quickNotesService.getAllForAdmin(
        userId,
        page,
        pageSize,
        search,
        tag,
        showStarredOnly === 'true',
      );
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 获取所有标签（管理员）
   */
  @Get('admin/tags')
  @UseGuards(ActiveUserGuard, AdminGuard)
  async getAllTags(@Request() req) {
    try {
      const userId = req.user.sub;
      const data = await this.quickNotesService.getAllTags(userId);
      return { code: 200, msg: 'success', data: { tags: data } };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 获取笔记详情 - 支持游客模式
   */
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async getById(@Request() req, @Param('id') id: string) {
    try {
      // 游客模式返回空数据
      if (!req.user) {
        return { 
          code: 200, 
          msg: 'success', 
          data: null 
        };
      }
      
      const userId = req.user.sub;
      const data = await this.quickNotesService.getById(userId, id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 创建笔记
   */
  @Post()
  @UseGuards(ActiveUserGuard)
  async create(
    @Request() req,
    @Body() body: {
      title: string;
      content: string;
      tags?: string[];
      images?: string[];
      is_starred?: boolean;
      is_pinned?: boolean;
    },
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.quickNotesService.create(userId, body);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 更新笔记
   */
  @Put(':id')
  @UseGuards(ActiveUserGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() body: {
      title?: string;
      content?: string;
      tags?: string[];
      images?: string[];
      is_starred?: boolean;
      is_pinned?: boolean;
    },
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.quickNotesService.update(userId, id, body);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 删除笔记
   */
  @Delete(':id')
  @UseGuards(ActiveUserGuard)
  async delete(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.sub;
      await this.quickNotesService.delete(userId, id);
      return { code: 200, msg: 'success', data: null };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 批量删除笔记（管理员）
   */
  @Delete('admin/batch')
  @UseGuards(ActiveUserGuard, AdminGuard)
  async batchDelete(@Request() req, @Body() body: { ids: string[] }) {
    try {
      const userId = req.user.sub;
      await this.quickNotesService.batchDelete(userId, body.ids);
      return { code: 200, msg: 'success', data: null };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 切换星标状态
   */
  @Post(':id/toggle-star')
  @UseGuards(ActiveUserGuard)
  async toggleStar(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.sub;
      const data = await this.quickNotesService.toggleStar(userId, id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 切换置顶状态
   */
  @Post(':id/toggle-pin')
  @UseGuards(ActiveUserGuard)
  async togglePin(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.sub;
      const data = await this.quickNotesService.togglePin(userId, id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }
}
