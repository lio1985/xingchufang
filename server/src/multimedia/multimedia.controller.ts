import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, BadRequestException, Query, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MultimediaService } from './multimedia.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { parseOptionalUUID } from '../utils/uuid.util';

@Controller('multimedia')
export class MultimediaController {
  constructor(private readonly multimediaService: MultimediaService) {}

  /**
   * 上传文件
   */
  @Post('upload')
  @UseGuards(ActiveUserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body('transcribeAudio') transcribeAudio?: string,
  ) {
    try {
      console.log('=== Controller: 上传文件请求 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('FileName:', file?.originalname);
      console.log('Transcribe Audio:', transcribeAudio);

      if (!file) {
        throw new BadRequestException('请选择要上传的文件');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('用户ID不能为空');
      }

      const result = await this.multimediaService.uploadFile(userId, file, {
        transcribeAudio: transcribeAudio === 'true',
      });

      console.log('=== Controller: 文件上传成功 ===');
      console.log('ResourceId:', result.id);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      console.error('Controller: 上传文件失败:', error);
      throw new BadRequestException(error.message || '上传文件失败');
    }
  }

  /**
   * 获取用户的多媒体资源列表
   */
  @Get('list')
  @UseGuards(ActiveUserGuard)
  async getUserResources(
    @Req() req: any,
    @Query('userId') targetUserId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      console.log('=== Controller: 获取资源列表 ===');
      console.log('当前用户ID:', req.user?.id);
      console.log('目标用户ID:', targetUserId);
      console.log('Type:', type);

      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new BadRequestException('用户ID不能为空');
      }

      // 验证 targetUserId 参数
      const validatedTargetUserId = parseOptionalUUID(targetUserId);

      const result = await this.multimediaService.getUserResources(
        currentUserId,
        validatedTargetUserId,
        type,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );

      console.log('=== Controller: 返回资源列表 ===');
      console.log('Total:', result.total);

      return {
        code: 200,
        msg: 'success',
        data: result,
      };
    } catch (error: any) {
      console.error('Controller: 获取资源列表失败:', error);
      throw new BadRequestException(error.message || '获取资源列表失败');
    }
  }

  /**
   * 获取资源详情
   */
  @Get(':resourceId')
  @UseGuards(ActiveUserGuard)
  async getResourceById(
    @Param('resourceId') resourceId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 获取资源详情 ===');
      console.log('ResourceId:', resourceId);
      console.log('当前用户ID:', req.user?.id);

      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('用户ID不能为空');
      }

      const resource = await this.multimediaService.getResourceById(resourceId, userId);

      console.log('=== Controller: 返回资源详情 ===');

      return {
        code: 200,
        msg: 'success',
        data: resource,
      };
    } catch (error: any) {
      console.error('Controller: 获取资源详情失败:', error);
      throw new BadRequestException(error.message || '获取资源详情失败');
    }
  }

  /**
   * 删除资源
   */
  @Delete(':resourceId')
  @UseGuards(ActiveUserGuard)
  async deleteResource(
    @Param('resourceId') resourceId: string,
    @Req() req: any,
  ) {
    try {
      console.log('=== Controller: 删除资源 ===');
      console.log('ResourceId:', resourceId);
      console.log('当前用户ID:', req.user?.id);

      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('用户ID不能为空');
      }

      await this.multimediaService.deleteResource(resourceId, userId);

      console.log('=== Controller: 资源已删除 ===');

      return {
        code: 200,
        msg: 'success',
        data: {
          message: '资源已删除',
        },
      };
    } catch (error: any) {
      console.error('Controller: 删除资源失败:', error);
      throw new BadRequestException(error.message || '删除资源失败');
    }
  }

  /**
   * 语音识别（对已上传的音频进行识别）
   */
  @Post('transcribe')
  @UseGuards(ActiveUserGuard)
  async transcribeAudio(@Body('audioUrl') audioUrl: string) {
    try {
      console.log('=== Controller: 语音识别请求 ===');
      console.log('AudioUrl:', audioUrl);

      if (!audioUrl) {
        throw new BadRequestException('音频URL不能为空');
      }

      const text = await this.multimediaService.transcribeAudio(audioUrl);

      console.log('=== Controller: 语音识别完成 ===');

      return {
        code: 200,
        msg: 'success',
        data: {
          text,
        },
      };
    } catch (error: any) {
      console.error('Controller: 语音识别失败:', error);
      throw new BadRequestException(error.message || '语音识别失败');
    }
  }
}
