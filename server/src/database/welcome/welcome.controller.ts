import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { WelcomeService } from './welcome.service';

@Controller('welcome')
export class WelcomeController {
  constructor(private readonly welcomeService: WelcomeService) {}

  @Get()
  async getAll() {
    try {
      const data = await this.welcomeService.getAll();
      return { code: 200, msg: 'success', data };
    } catch (error) {
      return { code: 500, msg: error.message, data: null };
    }
  }

  @Post()
  async create(@Body() body: { title: string; content: string; imageUrl?: string; order: string }) {
    try {
      const data = await this.welcomeService.create(body);
      return { code: 200, msg: 'success', data };
    } catch (error) {
      return { code: 500, msg: error.message, data: null };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { title?: string; content?: string; imageUrl?: string; order?: string; isActive?: string }) {
    try {
      const data = await this.welcomeService.update(id, body);
      return { code: 200, msg: 'success', data };
    } catch (error) {
      return { code: 500, msg: error.message, data: null };
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const data = await this.welcomeService.delete(id);
      return { code: 200, msg: 'success', data };
    } catch (error) {
      return { code: 500, msg: error.message, data: null };
    }
  }
}
