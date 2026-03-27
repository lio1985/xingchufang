import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';
import { KnowledgeShareService } from './knowledge-share.service';

@Controller('api/knowledge-shares')
export class KnowledgeShareController {
  constructor(
    private readonly knowledgeShareService: KnowledgeShareService,
    private readonly storageService: StorageService
  ) {}

  // 获取知识分享列表
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req, @Query('keyword') keyword?: string) {
    try {
      const data = await this.knowledgeShareService.findAll(req.user.id, keyword);
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: [],
      };
    }
  }

  // 获取单个知识分享详情
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const data = await this.knowledgeShareService.findOne(id, req.user.id);
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 404,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 创建知识分享
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Request() req) {
    try {
      const data = await this.knowledgeShareService.create(req.user.id, body);
      return {
        code: 200,
        msg: '创建成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '创建失败',
        data: null,
      };
    }
  }

  // 更新知识分享
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    try {
      const data = await this.knowledgeShareService.update(id, req.user.id, body);
      return {
        code: 200,
        msg: '更新成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '更新失败',
        data: null,
      };
    }
  }

  // 删除知识分享
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const data = await this.knowledgeShareService.remove(id, req.user.id);
      return {
        code: 200,
        msg: '删除成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '删除失败',
        data: null,
      };
    }
  }

  // 点赞知识分享
  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async like(@Param('id') id: string, @Request() req) {
    try {
      const data = await this.knowledgeShareService.like(id, req.user.id);
      return {
        code: 200,
        msg: '点赞成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '点赞失败',
        data: null,
      };
    }
  }

  // 获取当前用户的知识分享列表
  @Get('my/list')
  @UseGuards(JwtAuthGuard)
  async findByUserId(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const data = await this.knowledgeShareService.findByUserId(
        req.user.id,
        page ? parseInt(page) : 1,
        pageSize ? parseInt(pageSize) : 20,
      );
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 管理员获取所有知识分享
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async findAllForAdmin(
    @Request() req,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const data = await this.knowledgeShareService.findAllForAdmin(
        req.user.id,
        page ? parseInt(page) : 1,
        pageSize ? parseInt(pageSize) : 20,
      );
      return {
        code: 200,
        msg: '获取成功',
        data,
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  // 上传附件
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        return {
          code: 400,
          msg: '文件不能为空',
          data: null,
        };
      }

      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          code: 400,
          msg: `文件大小不能超过 ${maxSize / (1024 * 1024)}MB`,
          data: null,
        };
      }

      console.log('上传文件信息:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      const fileType = this.getFileType(file.mimetype);
      if (!fileType) {
        return {
          code: 400,
          msg: '不支持的文件类型',
          data: null,
        };
      }

      const fileKey = await this.storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      const fileUrl = await this.storageService.generatePresignedUrl(fileKey, 86400);

      return {
        code: 200,
        msg: '上传成功',
        data: {
          fileKey,
          fileUrl,
          fileName: file.originalname,
          fileType,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      };
    } catch (error) {
      console.error('文件上传失败:', error);
      return {
        code: 500,
        msg: error.message || '上传失败',
        data: null,
      };
    }
  }

  // 获取文件预签名 URL
  @Post('file-url')
  async getFileUrl(@Body() body: { fileKey: string }) {
    try {
      const { fileKey } = body;
      if (!fileKey) {
        return {
          code: 400,
          msg: '文件 key 不能为空',
          data: null,
        };
      }

      const fileUrl = await this.storageService.generatePresignedUrl(fileKey, 86400);

      return {
        code: 200,
        msg: '获取成功',
        data: {
          fileKey,
          fileUrl,
        },
      };
    } catch (error) {
      return {
        code: 500,
        msg: error.message || '获取失败',
        data: null,
      };
    }
  }

  private getFileType(mimetype: string): string | null {
    if (mimetype.startsWith('image/')) {
      return 'image';
    } else if (mimetype.startsWith('audio/')) {
      return 'audio';
    } else if (mimetype.startsWith('video/')) {
      return 'video';
    } else if (
      mimetype === 'application/pdf' ||
      mimetype.includes('document') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('presentation')
    ) {
      return 'document';
    } else if (
      mimetype === 'text/plain' ||
      mimetype === 'text/markdown'
    ) {
      return 'document';
    }
    return null;
  }
}
