import { Controller, Post, Body } from '@nestjs/common';
import { FreestyleGenerationService, FreestyleInput, GeneratedContent } from './freestyle-generation.service';

@Controller('freestyle-generation')
export class FreestyleGenerationController {
  constructor(private readonly freestyleGenerationService: FreestyleGenerationService) {}

  @Post('generate')
  async generateFreestyle(@Body() body: FreestyleInput): Promise<{ code: number; msg: string; data: GeneratedContent }> {
    const result = await this.freestyleGenerationService.generateFreestyle(body);
    return { code: 200, msg: 'success', data: result };
  }
}
