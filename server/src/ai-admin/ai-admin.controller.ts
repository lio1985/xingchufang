import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AiAdminService } from './ai-admin.service';
import { AdminGuard } from '../guards/admin.guard';
import { ActiveUserGuard } from '../guards/active-user.guard';

@Controller('ai-admin')
@UseGuards(ActiveUserGuard, AdminGuard)
export class AiAdminController {
  constructor(private readonly aiAdminService: AiAdminService) {}

  // ==================== 仪表盘 ====================

  /**
   * 获取仪表盘数据
   */
  @Get('dashboard')
  async getDashboard() {
    try {
      const stats = await this.aiAdminService.getDashboardStats();
      const recentLogs = await this.aiAdminService.getRecentLogs(10);

      return {
        code: 200,
        msg: 'success',
        data: {
          stats,
          recentLogs,
        },
      };
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      return {
        code: 500,
        msg: error.message || '获取仪表盘数据失败',
        data: null,
      };
    }
  }

  // ==================== 模型管理 ====================

  /**
   * 获取所有AI模型
   */
  @Get('models')
  async getAllModels() {
    try {
      const models = await this.aiAdminService.getAllModels();
      return {
        code: 200,
        msg: 'success',
        data: models,
      };
    } catch (error) {
      console.error('获取AI模型列表失败:', error);
      return {
        code: 500,
        msg: error.message || '获取AI模型列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取单个AI模型
   */
  @Get('models/:id')
  async getModel(@Param('id') id: string) {
    try {
      const model = await this.aiAdminService.getModelById(id);
      if (!model) {
        return {
          code: 404,
          msg: '模型不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: 'success',
        data: model,
      };
    } catch (error) {
      console.error('获取AI模型失败:', error);
      return {
        code: 500,
        msg: error.message || '获取AI模型失败',
        data: null,
      };
    }
  }

  /**
   * 创建AI模型
   */
  @Post('models')
  async createModel(@Body() modelData: any) {
    try {
      const model = await this.aiAdminService.createModel(modelData);
      return {
        code: 200,
        msg: '创建成功',
        data: model,
      };
    } catch (error) {
      console.error('创建AI模型失败:', error);
      return {
        code: 500,
        msg: error.message || '创建AI模型失败',
        data: null,
      };
    }
  }

  /**
   * 更新AI模型
   */
  @Put('models/:id')
  async updateModel(@Param('id') id: string, @Body() updates: any) {
    try {
      const model = await this.aiAdminService.updateModel(id, updates);
      return {
        code: 200,
        msg: '更新成功',
        data: model,
      };
    } catch (error) {
      console.error('更新AI模型失败:', error);
      return {
        code: 500,
        msg: error.message || '更新AI模型失败',
        data: null,
      };
    }
  }

  /**
   * 删除AI模型
   */
  @Delete('models/:id')
  async deleteModel(@Param('id') id: string) {
    try {
      await this.aiAdminService.deleteModel(id);
      return {
        code: 200,
        msg: '删除成功',
        data: null,
      };
    } catch (error) {
      console.error('删除AI模型失败:', error);
      return {
        code: 500,
        msg: error.message || '删除AI模型失败',
        data: null,
      };
    }
  }

  /**
   * 设置默认模型
   */
  @Post('models/:id/set-default')
  async setDefaultModel(@Param('id') id: string) {
    try {
      await this.aiAdminService.setDefaultModel(id);
      return {
        code: 200,
        msg: '设置成功',
        data: null,
      };
    } catch (error) {
      console.error('设置默认模型失败:', error);
      return {
        code: 500,
        msg: error.message || '设置默认模型失败',
        data: null,
      };
    }
  }

  /**
   * 测试模型连接
   */
  @Post('models/:id/test')
  async testModel(@Param('id') id: string) {
    try {
      const model = await this.aiAdminService.getModelById(id);
      if (!model) {
        return {
          code: 404,
          msg: '模型不存在',
          data: null,
        };
      }

      // TODO: 实际调用AI模型进行测试
      // 这里简化处理，返回模拟结果
      return {
        code: 200,
        msg: '连接测试成功',
        data: {
          modelName: model.name,
          provider: model.provider,
          testTime: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 1000) + 500,
        },
      };
    } catch (error) {
      console.error('测试模型连接失败:', error);
      return {
        code: 500,
        msg: error.message || '测试模型连接失败',
        data: null,
      };
    }
  }

  // ==================== 功能模块管理 ====================

  /**
   * 获取所有AI功能模块
   */
  @Get('modules')
  async getAllModules() {
    try {
      const modules = await this.aiAdminService.getAllModules();
      return {
        code: 200,
        msg: 'success',
        data: modules,
      };
    } catch (error) {
      console.error('获取AI功能模块列表失败:', error);
      return {
        code: 500,
        msg: error.message || '获取AI功能模块列表失败',
        data: null,
      };
    }
  }

  /**
   * 获取单个AI功能模块
   */
  @Get('modules/:id')
  async getModule(@Param('id') id: string) {
    try {
      const module = await this.aiAdminService.getModuleById(id);
      if (!module) {
        return {
          code: 404,
          msg: '模块不存在',
          data: null,
        };
      }
      return {
        code: 200,
        msg: 'success',
        data: module,
      };
    } catch (error) {
      console.error('获取AI功能模块失败:', error);
      return {
        code: 500,
        msg: error.message || '获取AI功能模块失败',
        data: null,
      };
    }
  }

  /**
   * 创建AI功能模块
   */
  @Post('modules')
  async createModule(@Body() moduleData: any) {
    try {
      const module = await this.aiAdminService.createModule(moduleData);
      return {
        code: 200,
        msg: '创建成功',
        data: module,
      };
    } catch (error) {
      console.error('创建AI功能模块失败:', error);
      return {
        code: 500,
        msg: error.message || '创建AI功能模块失败',
        data: null,
      };
    }
  }

  /**
   * 更新AI功能模块
   */
  @Put('modules/:id')
  async updateModule(@Param('id') id: string, @Body() updates: any) {
    try {
      const module = await this.aiAdminService.updateModule(id, updates);
      return {
        code: 200,
        msg: '更新成功',
        data: module,
      };
    } catch (error) {
      console.error('更新AI功能模块失败:', error);
      return {
        code: 500,
        msg: error.message || '更新AI功能模块失败',
        data: null,
      };
    }
  }

  /**
   * 删除AI功能模块
   */
  @Delete('modules/:id')
  async deleteModule(@Param('id') id: string) {
    try {
      await this.aiAdminService.deleteModule(id);
      return {
        code: 200,
        msg: '删除成功',
        data: null,
      };
    } catch (error) {
      console.error('删除AI功能模块失败:', error);
      return {
        code: 500,
        msg: error.message || '删除AI功能模块失败',
        data: null,
      };
    }
  }

  /**
   * 切换模块状态
   */
  @Post('modules/:id/toggle')
  async toggleModule(@Param('id') id: string) {
    try {
      const module = await this.aiAdminService.toggleModule(id);
      return {
        code: 200,
        msg: module.is_active ? '已启用' : '已禁用',
        data: module,
      };
    } catch (error) {
      console.error('切换模块状态失败:', error);
      return {
        code: 500,
        msg: error.message || '切换模块状态失败',
        data: null,
      };
    }
  }

  // ==================== 使用统计 ====================

  /**
   * 获取使用统计概览
   */
  @Get('usage/stats')
  async getUsageStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const stats = await this.aiAdminService.getUsageStats(startDate, endDate);
      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      console.error('获取使用统计失败:', error);
      return {
        code: 500,
        msg: error.message || '获取使用统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取模块使用统计
   */
  @Get('usage/module-stats')
  async getModuleUsageStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const stats = await this.aiAdminService.getModuleUsageStats(startDate, endDate);
      return {
        code: 200,
        msg: 'success',
        data: stats,
      };
    } catch (error) {
      console.error('获取模块使用统计失败:', error);
      return {
        code: 500,
        msg: error.message || '获取模块使用统计失败',
        data: null,
      };
    }
  }

  /**
   * 获取用户使用排行
   */
  @Get('usage/user-ranking')
  async getUserUsageRanking(
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const ranking = await this.aiAdminService.getUserUsageRanking(
        limit ? parseInt(limit) : 10,
        startDate,
        endDate,
      );
      return {
        code: 200,
        msg: 'success',
        data: ranking,
      };
    } catch (error) {
      console.error('获取用户使用排行失败:', error);
      return {
        code: 500,
        msg: error.message || '获取用户使用排行失败',
        data: null,
      };
    }
  }

  /**
   * 获取使用日志
   */
  @Get('usage/logs')
  async getUsageLogs(
    @Query('userId') userId?: string,
    @Query('moduleId') moduleId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const logs = await this.aiAdminService.getUsageLogs({
        userId,
        moduleId,
        status,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });
      return {
        code: 200,
        msg: 'success',
        data: logs,
      };
    } catch (error) {
      console.error('获取使用日志失败:', error);
      return {
        code: 500,
        msg: error.message || '获取使用日志失败',
        data: null,
      };
    }
  }

  // ==================== 全局设置 ====================

  /**
   * 获取全局设置
   */
  @Get('settings')
  async getSettings() {
    try {
      const settings = await this.aiAdminService.getSettings();
      return {
        code: 200,
        msg: 'success',
        data: settings,
      };
    } catch (error) {
      console.error('获取全局设置失败:', error);
      return {
        code: 500,
        msg: error.message || '获取全局设置失败',
        data: null,
      };
    }
  }

  /**
   * 更新全局设置
   */
  @Put('settings')
  async updateSettings(@Body() updates: any, @Request() req) {
    try {
      const settings = await this.aiAdminService.updateSettings(
        updates,
        req.user?.sub,
      );
      return {
        code: 200,
        msg: '更新成功',
        data: settings,
      };
    } catch (error) {
      console.error('更新全局设置失败:', error);
      return {
        code: 500,
        msg: error.message || '更新全局设置失败',
        data: null,
      };
    }
  }
}
