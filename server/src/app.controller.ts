import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from '@/app.service';
import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApiInfo(): { service: string; version: string; status: string; docs: string } {
    return {
      service: '智能赋能系统 API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/hello',
    };
  }

  @Get('hello')
  getHello(): { status: string; data: string } {
    return {
      status: 'success',
      data: this.appService.getHello()
    };
  }

  @Get('health')
  getHealth(): { status: string; data: string } {
    return {
      status: 'success',
      data: new Date().toISOString(),
    };
  }

  // SPA 回退：所有非 API 路由返回 index.html
  @Get('*')
  serveSPA(@Req() req: Request, @Res() res: Response): void {
    // 排除 API 路径和静态资源
    if (req.path.startsWith('/api/') || req.path.startsWith('/js/') || req.path.startsWith('/static/')) {
      res.status(404).json({ message: 'Not Found' });
      return;
    }
    
    const indexPath = join('/workspace/projects/dist-web', 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: 'index.html not found' });
    }
  }
}
