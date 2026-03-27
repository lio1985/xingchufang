import { Injectable, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';

@Injectable()
export class FileParserService {
  /**
   * 根据文件类型解析文件内容
   */
  async parseFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    switch (fileExtension) {
      case '.pdf':
        return this.parsePdf(file.buffer);
      case '.doc':
      case '.docx':
        return this.parseWord(file.buffer);
      case '.txt':
        return this.parseText(file.buffer);
      default:
        throw new BadRequestException(`不支持的文件类型: ${fileExtension}`);
    }
  }

  /**
   * 解析 PDF 文件
   */
  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      // 动态导入 pdf-parse (ES Module)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      let text = data.text;

      // 清理文本
      text = this.cleanText(text);

      if (!text.trim()) {
        throw new BadRequestException('PDF 文件内容为空或无法提取文本');
      }

      return text;
    } catch (error) {
      console.error('[FileParser] PDF 解析失败:', error);
      throw new BadRequestException(`PDF 解析失败: ${error.message}`);
    }
  }

  /**
   * 解析 Word 文件 (.doc, .docx)
   */
  private async parseWord(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      let text = result.value;

      // 清理文本
      text = this.cleanText(text);

      if (!text.trim()) {
        throw new BadRequestException('Word 文件内容为空');
      }

      return text;
    } catch (error) {
      console.error('[FileParser] Word 解析失败:', error);
      throw new BadRequestException(`Word 解析失败: ${error.message}`);
    }
  }

  /**
   * 解析纯文本文件
   */
  private parseText(buffer: Buffer): string {
    try {
      const text = buffer.toString('utf-8');
      return this.cleanText(text);
    } catch (error) {
      console.error('[FileParser] 文本解析失败:', error);
      throw new BadRequestException(`文本解析失败: ${error.message}`);
    }
  }

  /**
   * 清理和格式化文本
   */
  private cleanText(text: string): string {
    // 移除多余的空白字符
    let cleaned = text
      .replace(/\r\n/g, '\n') // 统一换行符
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // 最多保留两个连续换行
      .replace(/[ \t]+/g, ' ') // 合并多个空格为一个
      .trim();

    // 限制文本长度（最多 50000 字符）
    if (cleaned.length > 50000) {
      cleaned = cleaned.substring(0, 50000) + '...[内容已截断]';
    }

    return cleaned;
  }
}
