import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  CourseService,
  CreateCourseDto,
  UpdateCourseDto,
  UpdateLearningDto,
  ContentType,
  Difficulty,
  CourseStatus,
} from './course.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('course')
@UseGuards(ActiveUserGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /**
   * 获取课程分类列表
   */
  @Get('categories')
  async getCategories() {
    const result = await this.courseService.getCategories();
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 获取课程列表
   */
  @Get()
  async getList(
    @Query('categoryId') categoryId?: string,
    @Query('contentType') contentType?: ContentType,
    @Query('status') status?: CourseStatus,
    @Query('keyword') keyword?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req?: any,
  ) {
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    const result = await this.courseService.getCourses({
      categoryId,
      contentType,
      status,
      keyword,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      userId: req.user?.id,
      isAdmin,
    });
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 获取课程详情
   */
  @Get(':id')
  async getDetail(@Param('id') id: string, @Req() req: any) {
    const result = await this.courseService.getCourseDetail(id, req.user?.id);
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 创建课程（管理员）
   */
  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() dto: CreateCourseDto, @Req() req: any) {
    const result = await this.courseService.createCourse(dto, req.user.id);
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 更新课程（管理员）
   */
  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Req() req: any,
  ) {
    const result = await this.courseService.updateCourse(id, dto, req.user.id);
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 删除课程（管理员）
   */
  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    await this.courseService.deleteCourse(id);
    return { code: 200, msg: '删除成功', data: null };
  }

  /**
   * 发布课程（管理员）
   */
  @Post(':id/publish')
  @UseGuards(AdminGuard)
  async publish(@Param('id') id: string) {
    await this.courseService.publishCourse(id);
    return { code: 200, msg: '发布成功', data: null };
  }

  /**
   * 归档课程（管理员）
   */
  @Post(':id/archive')
  @UseGuards(AdminGuard)
  async archive(@Param('id') id: string) {
    await this.courseService.archiveCourse(id);
    return { code: 200, msg: '归档成功', data: null };
  }

  /**
   * 上传课程文件（管理员）
   * 支持 PDF、PPT、图片等格式
   */
  @Post('upload')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  @HttpCode(HttpStatus.OK)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('上传课程文件：', file?.originalname);
    console.log('文件类型：', file?.mimetype);
    console.log('文件大小：', file?.size);

    if (!file) {
      return { code: 400, msg: '请上传文件', data: null };
    }

    // 判断文件类型
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return { code: 400, msg: '不支持的文件类型，仅支持 PDF、PPT、Word、图片', data: null };
    }

    // 根据文件类型确定 content_type
    let contentType = ContentType.OTHER;
    if (file.mimetype === 'application/pdf') {
      contentType = ContentType.PDF;
    } else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) {
      contentType = ContentType.PPT;
    } else if (file.mimetype.startsWith('image/')) {
      contentType = ContentType.IMAGE_TEXT;
    }

    // TODO: 实际上传到对象存储
    // 目前返回模拟 URL
    const mockUrl = `https://example.com/courses/${Date.now()}_${file.originalname}`;

    return {
      code: 200,
      msg: 'success',
      data: {
        url: mockUrl,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        contentType,
      },
    };
  }

  /**
   * 更新学习进度
   */
  @Post(':id/learning')
  async updateLearning(
    @Param('id') id: string,
    @Body() dto: UpdateLearningDto,
    @Req() req: any,
  ) {
    const result = await this.courseService.updateLearning(id, req.user.id, dto);
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 收藏/取消收藏
   */
  @Post(':id/favorite')
  async toggleFavorite(@Param('id') id: string, @Req() req: any) {
    const result = await this.courseService.toggleFavorite(id, req.user.id);
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 获取收藏的课程
   */
  @Get('user/favorites')
  async getFavorites(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req: any,
  ) {
    const result = await this.courseService.getFavoriteCourses(
      req.user.id,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 获取学习记录
   */
  @Get('user/learnings')
  async getLearnings(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Req() req: any,
  ) {
    const result = await this.courseService.getLearningHistory(
      req.user.id,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 获取统计数据
   */
  @Get('stats/overview')
  async getStatistics(@Req() req: any) {
    const result = await this.courseService.getStatistics(req.user?.id);
    return { code: 200, msg: 'success', data: result.data };
  }

  /**
   * 获取推荐课程
   */
  @Get('recommend/list')
  async getRecommended(
    @Query('limit') limit = '5',
    @Req() req: any,
  ) {
    const result = await this.courseService.getRecommendedCourses(req.user?.id, parseInt(limit) || 5);
    return { code: 200, msg: 'success', data: result.data };
  }
}
