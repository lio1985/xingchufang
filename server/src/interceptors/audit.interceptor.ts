import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);
  private auditService: AuditService;

  constructor() {
    // 延迟初始化，避免循环依赖
  }

  private getAuditService(): AuditService {
    if (!this.auditService) {
      // 动态获取 AuditService
      const moduleRef = require('./audit.module');
      this.auditService = moduleRef;
    }
    return this.auditService;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // 如果没有用户信息，跳过审计
    if (!request.user) {
      return next.handle();
    }

    // 获取操作类型和资源信息
    const operation = this.getOperation(context);
    const resourceInfo = this.getResourceInfo(context, request);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        // 请求成功，记录审计日志
        this.logAudit({
          userId: request.user.sub,
          operation,
          resourceType: resourceInfo.type,
          resourceId: resourceInfo.id,
          details: {
            method: request.method,
            url: request.url,
            body: this.sanitizeBody(request.body),
            query: request.query,
            params: request.params,
            duration: Date.now() - startTime,
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          status: 'success',
        });
      }),
      catchError((error) => {
        // 请求失败，记录错误日志
        this.logAudit({
          userId: request.user.sub,
          operation,
          resourceType: resourceInfo.type,
          resourceId: resourceInfo.id,
          details: {
            method: request.method,
            url: request.url,
            body: this.sanitizeBody(request.body),
            query: request.query,
            params: request.params,
            duration: Date.now() - startTime,
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          status: 'failed',
          errorMessage: error.message,
        });
        throw error;
      }),
    );
  }

  /**
   * 获取操作类型
   */
  private getOperation(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method.toLowerCase();
    const path = request.route?.path || request.path;

    // 根据路径和方法推断操作类型
    const operations: Record<string, Record<string, string>> = {
      login: { POST: 'login' },
      logout: { POST: 'logout' },
      lexicons: {
        POST: 'create_lexicon',
        PUT: 'update_lexicon',
        DELETE: 'delete_lexicon',
      },
      multimedia: {
        POST: 'upload_file',
        DELETE: 'delete_file',
      },
      'ai-conversations': {
        POST: 'create_conversation',
        DELETE: 'delete_conversation',
      },
      'scheduled-tasks': {
        POST: 'create_task',
        PUT: 'update_task',
        DELETE: 'delete_task',
      },
      'work-plans': {
        POST: 'create_plan',
        PUT: 'update_plan',
        DELETE: 'delete_plan',
      },
    };

    // 匹配路径和操作
    for (const [resourcePath, ops] of Object.entries(operations)) {
      if (path.includes(resourcePath)) {
        if (typeof ops === 'string') {
          return ops;
        }
        return ops[method] || `${method}_${resourcePath}`;
      }
    }

    // 默认操作类型
    return `${method}_request`;
  }

  /**
   * 获取资源信息
   */
  private getResourceInfo(context: ExecutionContext, request: any): {
    type: string;
    id?: string;
  } {
    const path = request.route?.path || request.path;

    // 从路径中提取资源类型和ID
    const resourceTypes = [
      'lexicons',
      'multimedia-resources',
      'ai-conversations',
      'scheduled-tasks',
      'work-plans',
      'users',
      'user-profiles',
    ];

    for (const type of resourceTypes) {
      if (path.includes(type)) {
        // 尝试从 params 中提取 ID
        const idKey = `${type.replace(/-/g, '_').slice(0, -1)}Id`;
        if (request.params[idKey]) {
          return { type, id: request.params[idKey] };
        }
        return { type };
      }
    }

    return { type: 'unknown' };
  }

  /**
   * 清理请求体，移除敏感信息
   */
  private sanitizeBody(body: any): any {
    if (!body) {
      return {};
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'code'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }

  /**
   * 记录审计日志（异步）
   */
  private async logAudit(options: {
    userId: string;
    operation: string;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failed';
    errorMessage?: string;
  }): Promise<void> {
    try {
      // 注意：这里需要通过依赖注入获取 AuditService
      // 由于循环依赖问题，这里暂时不直接调用
      // 实际使用时需要在模块中正确配置
      this.logger.debug(
        `Audit log: ${options.operation} by user ${options.userId} - ${options.status}`,
      );
    } catch (error) {
      // 审计日志记录失败不应影响业务逻辑
      this.logger.error('Failed to log audit:', error);
    }
  }
}
