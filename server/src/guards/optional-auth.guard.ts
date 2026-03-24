import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from '../user/user.service';

/**
 * 可选认证守卫 - 支持游客模式
 * 如果提供了有效的 token，则解析用户信息
 * 如果没有 token 或 token 无效，也允许访问，但 user 为 null
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // 如果没有提供认证头，设置为游客模式
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);
    
    try {
      const payload = await this.userService.validateToken(token);

      if (!payload || payload.status !== 'active') {
        // Token 无效或用户被禁用，设置为游客模式
        request.user = null;
        return true;
      }

      // 将用户信息注入到 request 中
      request.user = {
        id: payload.sub,
        sub: payload.sub,
        openid: payload.openid,
        role: payload.role,
        status: payload.status,
      };
    } catch (error) {
      // Token 验证失败，设置为游客模式
      request.user = null;
    }

    return true;
  }
}
