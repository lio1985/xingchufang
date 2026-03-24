import { Controller, Post, Body } from '@nestjs/common';
import { TagGenerationService } from './tag-generation.service';

@Controller('quick-note')
export class TagGenerationController {
  constructor(private readonly tagGenerationService: TagGenerationService) {}

  @Post('generate-tags')
  async generateTags(@Body() body: { content: string }) {
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return {
        code: 400,
        msg: '内容不能为空',
        data: null
      };
    }

    try {
      const tags = await this.tagGenerationService.generateTags(content);

      return {
        code: 200,
        msg: 'success',
        data: { tags }
      };
    } catch (error) {
      console.error('生成标签失败:', error);
      return {
        code: 500,
        msg: '生成标签失败',
        data: null
      };
    }
  }

  @Post('generate-title')
  async generateTitle(@Body() body: { content: string }) {
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return {
        code: 400,
        msg: '内容不能为空',
        data: null
      };
    }

    try {
      const title = await this.tagGenerationService.generateTitle(content);

      return {
        code: 200,
        msg: 'success',
        data: { title }
      };
    } catch (error) {
      console.error('生成标题失败:', error);
      return {
        code: 500,
        msg: '生成标题失败',
        data: null
      };
    }
  }
}
