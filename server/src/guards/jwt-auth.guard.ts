import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

/**
 * JWT 认证守卫
 * 验证 JWT token 并将用户信息注入到 request 中
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未授权');
    }

    const token = authHeader.substring(7);
    const payload = await this.userService.validateToken(token);

    if (!payload) {
      throw new UnauthorizedException('无效的登录凭证');
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
