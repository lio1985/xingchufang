import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LexiconService } from './lexicon.service';
import { ActiveUserGuard } from '../../guards/active-user.guard';
import { OptionalAuthGuard } from '../../guards/optional-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { ShareLexiconRequest } from '../../share/types';
import { parseOptionalUUID } from '../../utils/uuid.util';

@Controller('lexicon')
@UseGuards(OptionalAuthGuard)
export class LexiconController {
  constructor(private readonly lexiconService: LexiconService) {}

  @Get()
  async getAll(
    @Request() req,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('product_id') product_id?: string,
    @Query('userId') targetUserId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('viewAll') viewAll?: string,
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

      const currentUserId = req.user.sub;
      // 验证 targetUserId 参数（如果是非法字符串会抛出 400 错误）
      const validatedTargetUserId = parseOptionalUUID(targetUserId, 'userId');

      const data = await this.lexiconService.getAll(
        currentUserId,
        category,
        type,
        product_id,
        validatedTargetUserId,
        page,
        pageSize,
        search,
        viewAll === 'true',
      );
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Get(':id')
  async getById(@Request() req, @Param('id') id: string) {
    try {
      // 游客模式返回空数据
      if (!req.user) {
        return { code: 200, msg: 'success', data: null };
      }

      const currentUserId = req.user.sub;
      const data = await this.lexiconService.getById(currentUserId, id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Post()
  @UseGuards(ActiveUserGuard)
  async create(
    @Request() req,
    @Body() body: { title: string; content: string; category: string; type?: string; product_id?: string; tags?: string[] },
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.create(userId, body);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Put(':id')
  @UseGuards(ActiveUserGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string; category?: string; product_id?: string; tags?: string[] },
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.update(userId, id, body);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Delete(':id')
  @UseGuards(ActiveUserGuard)
  async delete(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.delete(userId, id);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Post('upload-file')
  @UseGuards(ActiveUserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.uploadFile(userId, file);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Post('speech-to-text')
  @UseGuards(ActiveUserGuard)
  async speechToText(@Request() req, @Body() body: { audioUrl: string }) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.speechToText(userId, body.audioUrl);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Post('correct-text')
  async correctText(@Request() req, @Body() body: { text: string }) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.correctText(userId, body.text);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Post('generate-profile')
  async generateProfile(@Request() req, @Body() body: { type: 'enterprise' | 'personal' }) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.generateProfile(userId, body.type);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  @Post('optimize')
  async optimize(@Request() req, @Body() body: { inputText: string; lexiconIds: string[] }) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.optimize(userId, body.inputText, body.lexiconIds);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 共享语料库
   */
  @Post(':id/share')
  async shareLexicon(@Request() req, @Param('id') id: string, @Body() body: { shareScope: 'custom' | 'all' | 'department'; sharedWithUsers?: string[] }) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.shareLexicon(
        userId,
        id,
        body.shareScope,
        body.sharedWithUsers
      );
      return { code: 200, msg: '共享成功', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 取消共享语料库
   */
  @Delete(':id/share')
  async unshareLexicon(@Request() req, @Param('id') id: string) {
    try {
      const userId = req.user.sub;
      await this.lexiconService.unshareLexicon(userId, id);
      return { code: 200, msg: '取消共享成功', data: null };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 获取共享给我的语料库
   */
  @Get('shared/me')
  async getSharedWithMe(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.getSharedWithMe(userId, page, pageSize);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 获取我共享的语料库
   */
  @Get('shared/my')
  async getMySharedLexicons(
    @Request() req,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.getMySharedLexicons(userId, page, pageSize);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }

  /**
   * 获取共享历史记录（管理员）
   */
  @UseGuards(AdminGuard)
  @Get('share-history')
  async getShareHistory(
    @Request() req,
    @Query('lexiconId') lexiconId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    try {
      const userId = req.user.sub;
      const data = await this.lexiconService.getShareHistory(userId, lexiconId, page, pageSize);
      return { code: 200, msg: 'success', data };
    } catch (error: any) {
      const statusCode = error.status || 500;
      return { code: statusCode, msg: error.message, data: null };
    }
  }
}
