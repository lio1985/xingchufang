import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { UserService } from '../user/user.service';
import { StorageService } from '../storage/storage.service';
import { KnowledgeShareService } from './knowledge-share.service';

@Controller('knowledge-shares')
export class KnowledgeShareController {
  constructor(
    private readonly knowledgeShareService: KnowledgeShareService,
    private readonly userService: UserService,
    private readonly storageService: StorageService
  ) {}

  // 获取知识分享列表
  @Get()
  async findAll(@Query('keyword') keyword?: string) {
    try {
      const data = await this.knowledgeShareService.findAll(keyword);
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
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.knowledgeShareService.findOne(id);
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

  // 从请求中提取用户ID
  private async extractUserId(req: any): Promise<string | null> {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);
    return payload?.sub || null;
  }

  // 创建知识分享
  @Post()
  @UseGuards(ActiveUserGuard)
  async create(@Body() body: any, @Request() req: any) {
    try {
      const userId = await this.extractUserId(req);
      if (!userId) {
        return {
          code: 401,
          msg: '未授权',
          data: null,
        };
      }
      const data = await this.knowledgeShareService.create(userId, body);
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
  @UseGuards(ActiveUserGuard)
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    try {
      const userId = await this.extractUserId(req);
      if (!userId) {
        return {
          code: 401,
          msg: '未授权',
          data: null,
        };
      }
      const data = await this.knowledgeShareService.update(id, userId, body);
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
  @UseGuards(ActiveUserGuard)
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      const userId = await this.extractUserId(req);
      if (!userId) {
        return {
          code: 401,
          msg: '未授权',
          data: null,
        };
      }
      const data = await this.knowledgeShareService.remove(id, userId);
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
  async like(@Param('id') id: string) {
    try {
      const data = await this.knowledgeShareService.like(id);
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

  // 上传附件（图片、文件、录音）
  @Post('upload')
  @UseGuards(ActiveUserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    try {
      if (!file) {
        return {
          code: 400,
          msg: '文件不能为空',
          data: null,
        };
      }

      // 文件大小限制检查（已经在 MulterModule 配置，但这里再检查一次）
      const maxSize = 100 * 1024 * 1024; // 100MB
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

      // 判断文件类型是否允许
      const fileType = this.getFileType(file.mimetype);
      if (!fileType) {
        return {
          code: 400,
          msg: '不支持的文件类型',
          data: null,
        };
      }

      // 上传到对象存储
      const fileKey = await this.storageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // 生成预签名 URL（有效期 1 天）
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

  // 根据文件类型判断附件类型
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
    // 不支持的文件类型
    return null;
  }
}
