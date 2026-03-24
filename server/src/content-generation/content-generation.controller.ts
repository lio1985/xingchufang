import { Controller, Post, Body } from '@nestjs/common';
import { ContentGenerationService, GeneratedContent } from './content-generation.service';

@Controller('content-generation')
export class ContentGenerationController {
  constructor(private readonly contentGenerationService: ContentGenerationService) {}

  @Post('generate')
  async generateContent(@Body() body: {
    topics: string[];
    platform?: string;
    style?: string;
    length?: 'short' | 'medium' | 'long';
  }): Promise<{ code: number; msg: string; data: GeneratedContent[] }> {
    const result = await this.contentGenerationService.generateContent(
      body.topics,
      {
        platform: body.platform,
        style: body.style,
        length: body.length
      }
    );
    return { code: 200, msg: 'success', data: result };
  }
}
