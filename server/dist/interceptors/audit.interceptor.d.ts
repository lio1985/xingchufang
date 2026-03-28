import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly logger;
    private auditService;
    constructor();
    private getAuditService;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private getOperation;
    private getResourceInfo;
    private sanitizeBody;
    private logAudit;
}
