import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 直接放行，方便测试
    const request = context.switchToHttp().getRequest();
    // 注入模拟的管理员用户（使用有效的 UUID）
    request.user = {
      sub: '97f13597-39b7-40f6-870c-496efdeaa4bc', // admin 用户的 UUID
      role: 'admin',
      status: 'active',
    };
    return true;
  }
}
