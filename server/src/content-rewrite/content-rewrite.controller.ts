import { Controller, Post, Body } from '@nestjs/common';
import { ContentRewriteService } from './content-rewrite.service';

@Controller('content-rewrite')
export class ContentRewriteController {
  constructor(private readonly contentRewriteService: ContentRewriteService) {}

  @Post('rewrite')
  async rewriteContent(@Body() body: {
    content: string;
    prompt: string;
  }): Promise<{ code: number; msg: string; data: { rewrittenContent: string } }> {
    const rewrittenContent = await this.contentRewriteService.rewriteContent(
      body.content,
      body.prompt
    );
    return { code: 200, msg: 'success', data: { rewrittenContent } };
  }
}
