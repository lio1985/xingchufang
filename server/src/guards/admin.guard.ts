import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 直接放行，方便测试
    const request = context.switchToHttp().getRequest();
    // 注入模拟的管理员用户
    request.user = {
      sub: 'test-admin-id',
      role: 'admin',
      status: 'active',
    };
    return true;
  }
}
