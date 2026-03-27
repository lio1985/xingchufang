import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileParserService } from './file-parser.service';

@Controller('file-parser')
@UseGuards(JwtAuthGuard)
export class FileParserController {
  constructor(private readonly fileParserService: FileParserService) {}

  /**
   * 解析上传的文件内容
   * 支持 Word (.doc, .docx) 和 PDF 文件
   */
  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parseFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    // 检查文件类型
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('不支持的文件类型，仅支持 PDF、Word 和 TXT 文件');
    }

    // 检查文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    try {
      const content = await this.fileParserService.parseFile(file);

      return {
        code: 200,
        msg: '解析成功',
        data: {
          filename: file.originalname,
          size: file.size,
          content,
          mimeType: file.mimetype,
        },
      };
    } catch (error) {
      console.error('[FileParser] 解析失败:', error);
      throw new BadRequestException(`文件解析失败: ${error.message}`);
    }
  }
}
