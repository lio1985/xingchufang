import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('未授权');
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      throw new ForbiddenException('无效的登录凭证');
    }

    if (payload.status !== 'active') {
      throw new ForbiddenException('用户已被禁用');
    }

    // 将用户信息注入到 request 中
    request.user = {
      id: payload.sub,
      sub: payload.sub,
      openid: payload.openid,
      role: payload.role,
      status: payload.status,
    };

    return true;
  }
}
