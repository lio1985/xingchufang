import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ContentWritingService,
  GenerateOutlineDto,
  ExpandContentDto,
  PolishContentDto,
  GenerateFullContentDto,
  SuggestInspirationDto,
} from './content-writing.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('content-writing')
@UseGuards(JwtAuthGuard)
export class ContentWritingController {
  constructor(private readonly contentWritingService: ContentWritingService) {}

  /**
   * 生成内容大纲
   */
  @Post('outline')
  async generateOutline(@Req() req: any, @Body() dto: GenerateOutlineDto) {
    console.log('=== 生成内容大纲 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题:', dto.title);

    const result = await this.contentWritingService.generateOutline(dto);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * 扩写内容段落
   */
  @Post('expand')
  async expandContent(@Req() req: any, @Body() dto: ExpandContentDto) {
    console.log('=== 扩写内容 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题:', dto.title);

    const result = await this.contentWritingService.expandContent(dto);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * 润色优化内容
   */
  @Post('polish')
  async polishContent(@Req() req: any, @Body() dto: PolishContentDto) {
    console.log('=== 润色内容 ===');
    console.log('用户ID:', req.user.id);
    console.log('润色类型:', dto.polishType);

    const result = await this.contentWritingService.polishContent(dto);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * 生成完整内容
   */
  @Post('generate')
  async generateFullContent(@Req() req: any, @Body() dto: GenerateFullContentDto) {
    console.log('=== 生成完整内容 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题:', dto.title);

    const result = await this.contentWritingService.generateFullContent(dto);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }

  /**
   * 获取创作灵感
   */
  @Post('inspiration')
  async suggestInspiration(@Req() req: any, @Body() dto: SuggestInspirationDto) {
    console.log('=== 获取创作灵感 ===');
    console.log('用户ID:', req.user.id);
    console.log('选题:', dto.title);

    const result = await this.contentWritingService.suggestInspiration(dto);

    return {
      code: 200,
      msg: 'success',
      data: result,
    };
  }
}
