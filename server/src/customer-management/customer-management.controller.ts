import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { CustomerManagementService } from './customer-management.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { CreateCustomerDto, UpdateCustomerDto, CreateFollowUpDto, CustomerQueryDto } from './customer-management.dto';

@Controller('customers')
@UseGuards(OptionalAuthGuard)
export class CustomerManagementController {
  constructor(private readonly customerService: CustomerManagementService) {}

  // ========== 客户CRUD接口 ==========

  @Get()
  async getCustomers(
    @Request() req,
    @Query() query: CustomerQueryDto
  ) {
    console.log('[CustomerController] Get customers, query:', JSON.stringify(query));
    
    // 游客模式返回空数据
    if (!req.user) {
      return { 
        code: 200, 
        msg: 'success', 
        data: {
          data: [],
          total: 0,
          page: query.page || 1,
          pageSize: query.pageSize || 10,
          totalPages: 0
        }
      };
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const result = await this.customerService.getCustomers(userId, isAdmin, query);
    console.log('[CustomerController] Get customers result:', { count: result.data.length, total: result.total });
    return { code: 200, msg: 'success', data: result };
  }

  @Get(':id')
  async getCustomerDetail(@Param('id') id: string, @Request() req) {
    console.log('[CustomerController] Get customer detail:', id);
    
    // 游客模式返回空数据
    if (!req.user) {
      return { code: 200, msg: 'success', data: null };
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const customer = await this.customerService.getCustomerDetail(id, userId, isAdmin);
    console.log('[CustomerController] Get customer detail success:', id);
    return { code: 200, msg: 'success', data: customer };
  }

  @Post()
  @UseGuards(ActiveUserGuard)
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @Request() req
  ) {
    try {
      console.log('[CustomerController] Create customer, dto:', JSON.stringify(dto));
      const userId = req.user?.id;
      const customer = await this.customerService.createCustomer(dto, userId);
      console.log('[CustomerController] Create customer success:', customer.id);
      return { code: 200, msg: 'success', data: customer };
    } catch (error) {
      console.error('[CustomerController] Create customer error:', error);
      return { code: 500, msg: error.message || '创建客户失败', data: null };
    }
  }

  @Put(':id')
  @UseGuards(ActiveUserGuard)
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Request() req
  ) {
    try {
      console.log('[CustomerController] Update customer:', id, 'dto:', JSON.stringify(dto));
      const userId = req.user?.id;
      const isAdmin = req.user?.role === 'admin';
      const customer = await this.customerService.updateCustomer(id, dto, userId, isAdmin);
      console.log('[CustomerController] Update customer success:', id);
      return { code: 200, msg: 'success', data: customer };
    } catch (error) {
      console.error('[CustomerController] Update customer error:', error);
      return { code: 500, msg: error.message || '更新客户失败', data: null };
    }
  }

  @Delete(':id')
  @UseGuards(ActiveUserGuard)
  async deleteCustomer(@Param('id') id: string, @Request() req) {
    console.log('[CustomerController] Delete customer:', id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    await this.customerService.deleteCustomer(id, userId, isAdmin);
    console.log('[CustomerController] Delete customer success:', id);
    return { code: 200, msg: 'success' };
  }

  // ========== 跟进记录接口 ==========

  @Post(':id/follow-ups')
  @UseGuards(ActiveUserGuard)
  async createFollowUp(
    @Param('id') customerId: string,
    @Body() dto: CreateFollowUpDto,
    @Request() req
  ) {
    console.log('[CustomerController] Create follow-up for customer:', customerId);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const followUp = await this.customerService.createFollowUp(customerId, dto, userId, isAdmin);
    console.log('[CustomerController] Create follow-up success');
    return { code: 200, msg: 'success', data: followUp };
  }

  @Get(':id/follow-ups')
  async getFollowUps(@Param('id') customerId: string, @Request() req) {
    console.log('[CustomerController] Get follow-ups for customer:', customerId);
    
    // 游客模式返回空数据
    if (!req.user) {
      return { code: 200, msg: 'success', data: [] };
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const followUps = await this.customerService.getFollowUps(customerId, userId, isAdmin);
    console.log('[CustomerController] Get follow-ups count:', followUps.length);
    return { code: 200, msg: 'success', data: followUps };
  }

  // ========== 统计接口 ==========

  @Get('statistics/overview')
  async getStatistics(@Request() req) {
    console.log('[CustomerController] Get statistics');
    
    // 游客模式返回示例数据
    if (!req.user) {
      return { 
        code: 200, 
        msg: 'success', 
        data: {
          total: 0,
          todayNew: 0,
          pendingFollowUp: 0,
          statusDistribution: { normal: 0, atRisk: 0, lost: 0 },
          orderDistribution: { inProgress: 0, completed: 0 },
          totalEstimatedAmount: 0,
          conversionRate: '0'
        }
      };
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const stats = await this.customerService.getStatistics(userId, isAdmin);
    console.log('[CustomerController] Get statistics success');
    return { code: 200, msg: 'success', data: stats };
  }

  @Get('statistics/weekly')
  async getWeeklyStatistics(@Request() req) {
    console.log('[CustomerController] Get weekly statistics');
    
    // 游客模式返回空数据
    if (!req.user) {
      return { code: 200, msg: 'success', data: [] };
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const stats = await this.customerService.getWeeklyStatistics(userId, isAdmin);
    console.log('[CustomerController] Get weekly statistics success');
    return { code: 200, msg: 'success', data: stats };
  }

  @Get('statistics/monthly')
  async getMonthlyStatistics(@Request() req) {
    console.log('[CustomerController] Get monthly statistics');
    
    // 游客模式返回空数据
    if (!req.user) {
      return { code: 200, msg: 'success', data: [] };
    }
    
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const stats = await this.customerService.getMonthlyStatistics(userId, isAdmin);
    console.log('[CustomerController] Get monthly statistics success');
    return { code: 200, msg: 'success', data: stats };
  }

  @Get('statistics/by-sales')
  @UseGuards(AdminGuard)
  async getStatisticsBySales(@Request() req) {
    console.log('[CustomerController] Get statistics by sales (admin only)');
    const stats = await this.customerService.getStatisticsBySales();
    console.log('[CustomerController] Get statistics by sales success');
    return { code: 200, msg: 'success', data: stats };
  }
}
