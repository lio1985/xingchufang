import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { CustomerManagementService } from './customer-management.service';
import { ActiveUserGuard } from '../guards/active-user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { CreateCustomerDto, UpdateCustomerDto, CreateFollowUpDto, CustomerQueryDto } from './customer-management.dto';

@Controller('customers')
@UseGuards(ActiveUserGuard)
export class CustomerManagementController {
  constructor(private readonly customerService: CustomerManagementService) {}

  // ========== 客户CRUD接口 ==========

  @Get()
  async getCustomers(
    @Request() req,
    @Query() query: CustomerQueryDto
  ) {
    console.log('[CustomerController] Get customers, query:', JSON.stringify(query));
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const result = await this.customerService.getCustomers(userId, isAdmin, query);
    console.log('[CustomerController] Get customers result:', { count: result.data.length, total: result.total });
    return { code: 200, msg: 'success', data: result };
  }

  @Get(':id')
  async getCustomerDetail(@Param('id') id: string, @Request() req) {
    console.log('[CustomerController] Get customer detail:', id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const customer = await this.customerService.getCustomerDetail(id, userId, isAdmin);
    console.log('[CustomerController] Get customer detail success:', id);
    return { code: 200, msg: 'success', data: customer };
  }

  @Post()
  async createCustomer(
    @Body() dto: CreateCustomerDto,
    @Request() req
  ) {
    console.log('[CustomerController] Create customer, name:', dto.name);
    const userId = req.user?.id;
    const customer = await this.customerService.createCustomer(dto, userId);
    console.log('[CustomerController] Create customer success:', customer.id);
    return { code: 200, msg: 'success', data: customer };
  }

  @Put(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Request() req
  ) {
    console.log('[CustomerController] Update customer:', id);
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const customer = await this.customerService.updateCustomer(id, dto, userId, isAdmin);
    console.log('[CustomerController] Update customer success:', id);
    return { code: 200, msg: 'success', data: customer };
  }

  @Delete(':id')
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
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const stats = await this.customerService.getStatistics(userId, isAdmin);
    console.log('[CustomerController] Get statistics success');
    return { code: 200, msg: 'success', data: stats };
  }

  @Get('statistics/weekly')
  async getWeeklyStatistics(@Request() req) {
    console.log('[CustomerController] Get weekly statistics');
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const stats = await this.customerService.getWeeklyStatistics(userId, isAdmin);
    console.log('[CustomerController] Get weekly statistics success');
    return { code: 200, msg: 'success', data: stats };
  }

  @Get('statistics/monthly')
  async getMonthlyStatistics(@Request() req) {
    console.log('[CustomerController] Get monthly statistics');
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
