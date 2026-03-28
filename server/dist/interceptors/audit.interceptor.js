"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    constructor() {
        this.logger = new common_1.Logger(AuditInterceptor_1.name);
    }
    getAuditService() {
        if (!this.auditService) {
            const moduleRef = require('./audit.module');
            this.auditService = moduleRef;
        }
        return this.auditService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        if (!request.user) {
            return next.handle();
        }
        const operation = this.getOperation(context);
        const resourceInfo = this.getResourceInfo(context, request);
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)(() => {
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
        }), (0, operators_1.catchError)((error) => {
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
        }));
    }
    getOperation(context) {
        const request = context.switchToHttp().getRequest();
        const method = request.method.toLowerCase();
        const path = request.route?.path || request.path;
        const operations = {
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
        for (const [resourcePath, ops] of Object.entries(operations)) {
            if (path.includes(resourcePath)) {
                if (typeof ops === 'string') {
                    return ops;
                }
                return ops[method] || `${method}_${resourcePath}`;
            }
        }
        return `${method}_request`;
    }
    getResourceInfo(context, request) {
        const path = request.route?.path || request.path;
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
                const idKey = `${type.replace(/-/g, '_').slice(0, -1)}Id`;
                if (request.params[idKey]) {
                    return { type, id: request.params[idKey] };
                }
                return { type };
            }
        }
        return { type: 'unknown' };
    }
    sanitizeBody(body) {
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
    async logAudit(options) {
        try {
            this.logger.debug(`Audit log: ${options.operation} by user ${options.userId} - ${options.status}`);
        }
        catch (error) {
            this.logger.error('Failed to log audit:', error);
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map