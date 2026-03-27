import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 检查用户是否已登录
    if (!user || !user.sub) {
      throw new UnauthorizedException('未授权，请先登录');
    }

    // 检查用户状态是否为活跃
    if (user.status && user.status !== 'active') {
      throw new ForbiddenException('用户已被禁用或待审核');
    }

    // 验证用户是否是管理员
    try {
      const isAdmin = await this.userService.isAdmin(user.sub);
      if (!isAdmin) {
        throw new ForbiddenException('需要管理员权限才能访问');
      }
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('权限验证失败');
    }
  }
}
