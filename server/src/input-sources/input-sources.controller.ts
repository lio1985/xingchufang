import { Controller, Get, Post, Body } from '@nestjs/common';
import { InputSourceConfig, InputSourcesResponse } from '@/types/input-sources.types';

@Controller('input-sources')
export class InputSourcesController {

  private config: InputSourceConfig | null = null;

  @Get()
  async getInputSources(): Promise<InputSourcesResponse> {
    return {
      code: 200,
      msg: 'success',
      data: this.config
    };
  }

  @Post()
  async saveInputSources(@Body() body: InputSourceConfig): Promise<InputSourcesResponse> {
    this.config = body;
    return {
      code: 200,
      msg: '保存成功',
      data: body
    };
  }
}
