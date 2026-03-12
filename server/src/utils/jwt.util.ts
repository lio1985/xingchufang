import { sign, verify, JwtPayload, SignOptions } from 'jsonwebtoken';
import config from '../config/env.config';

/**
 * JWT Token载荷
 */
export interface TokenPayload {
  sub: string;
  userId: string;
  openid: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled' | 'deleted' | 'pending';
}

/**
 * JWT工具类
 */
export class JwtUtil {
  /**
   * 生成Token
   */
  static generateToken(payload: Omit<TokenPayload, 'sub'>): string {
    const tokenPayload: TokenPayload = {
      ...payload,
      sub: payload.userId,
    };
    const options: SignOptions = {
      expiresIn: config.jwt.expiresIn as any,
    };
    return sign(tokenPayload, config.jwt.secret, options);
  }

  /**
   * 验证Token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = verify(token, config.jwt.secret) as JwtPayload;
      return {
        sub: decoded.userId,
        userId: decoded.userId,
        openid: decoded.openid,
        role: decoded.role,
        status: decoded.status || 'active',
      };
    } catch (error) {
      throw new Error('Token无效或已过期');
    }
  }

  /**
   * 从Token中提取用户ID
   */
  static extractUserId(token: string): string {
    const payload = this.verifyToken(token);
    return payload.userId;
  }

  /**
   * 从Token中提取openid
   */
  static extractOpenid(token: string): string {
    const payload = this.verifyToken(token);
    return payload.openid;
  }

  /**
   * 从Token中提取角色
   */
  static extractRole(token: string): 'user' | 'admin' {
    const payload = this.verifyToken(token);
    return payload.role;
  }
}
