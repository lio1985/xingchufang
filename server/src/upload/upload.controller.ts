import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  // 上传图片
  @Post('image')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  @HttpCode(HttpStatus.OK)
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('上传图片，文件名：', file?.originalname);
    console.log('文件类型：', file?.mimetype);
    console.log('文件大小：', file?.size);

    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('请上传图片文件');
    }

    // 模拟上传成功，返回图片URL
    // 生产环境应该上传到对象存储（如OSS、S3）
    const mockUrl = `https://example.com/images/${Date.now()}_${file.originalname}`;

    console.log('图片上传成功：', mockUrl);

    return {
      code: 200,
      msg: 'success',
      data: {
        url: mockUrl,
        filename: file.originalname,
        size: file.size
      }
    };
  }

  // 上传音频
  @Post('audio')
  @UseInterceptors(FileInterceptor('audio', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }))
  @HttpCode(HttpStatus.OK)
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    console.log('上传音频，文件名：', file?.originalname);
    console.log('文件类型：', file?.mimetype);
    console.log('文件大小：', file?.size);

    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    if (!file.mimetype.startsWith('audio/')) {
      throw new BadRequestException('请上传音频文件');
    }

    // 模拟语音转文字
    // 生产环境应该调用真实的ASR服务（如百度语音、腾讯云语音等）
    const mockTranscript = '这是模拟的语音转文字结果。在实际应用中，应该调用真实的ASR服务。';

    console.log('音频上传成功，转文字结果：', mockTranscript);

    return {
      code: 200,
      msg: 'success',
      data: {
        transcript: mockTranscript,
        filename: file.originalname,
        duration: 30 // 模拟音频时长（秒）
      }
    };
  }
}
