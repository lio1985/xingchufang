import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { LiveScriptService } from './live-script.service'

@Controller('live-scripts')
export class LiveScriptController {
  constructor(private readonly liveScriptService: LiveScriptService) {}

  @Get()
  async findAll() {
    try {
      const data = await this.liveScriptService.findAll()
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.liveScriptService.findOne(id)
      return { code: 200, msg: 'success', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Post()
  async create(@Body() body: { title: string; date?: string; content: string; duration?: string; viewer_count?: string }) {
    try {
      if (!body.title || !body.title.trim()) {
        return { code: 400, msg: '标题不能为空', data: null }
      }
      if (!body.content || !body.content.trim()) {
        return { code: 400, msg: '内容不能为空', data: null }
      }

      const data = await this.liveScriptService.create({
        title: body.title.trim(),
        date: body.date?.trim(),
        content: body.content.trim(),
        duration: body.duration?.trim(),
        viewer_count: body.viewer_count?.trim()
      })

      return { code: 200, msg: '创建成功', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; date?: string; content?: string; duration?: string; viewer_count?: string; analysis?: any }
  ) {
    try {
      const data = await this.liveScriptService.update(id, body)
      return { code: 200, msg: '更新成功', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.liveScriptService.delete(id)
      return { code: 200, msg: '删除成功', data: null }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }

  @Post(':id/analyze')
  async analyze(@Param('id') id: string) {
    try {
      const data = await this.liveScriptService.analyze(id)
      return { code: 200, msg: '分析成功', data }
    } catch (error) {
      return { code: 500, msg: error.message, data: null }
    }
  }
}
