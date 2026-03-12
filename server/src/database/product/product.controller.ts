import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    const data = await this.productService.findAll()
    return { code: 200, msg: 'success', data }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.productService.findOne(id)
    if (!data) {
      return { code: 404, msg: '产品不存在', data: null }
    }
    return { code: 200, msg: 'success', data }
  }

  @Post()
  async create(@Body() body: { name: string; category?: string; description?: string }) {
    const { name, category, description } = body

    if (!name || !name.trim()) {
      return { code: 400, msg: '产品名称不能为空', data: null }
    }

    const data = await this.productService.create({
      name: name.trim(),
      category: category?.trim(),
      description: description?.trim()
    })

    return { code: 200, msg: '创建成功', data }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; category?: string; description?: string }
  ) {
    const data = await this.productService.update(id, {
      name: body.name?.trim(),
      category: body.category?.trim(),
      description: body.description?.trim()
    })
    return { code: 200, msg: '更新成功', data }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.productService.delete(id)
    return { code: 200, msg: '删除成功', data: null }
  }
}
