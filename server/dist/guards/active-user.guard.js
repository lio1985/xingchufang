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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveUserGuard = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
let ActiveUserGuard = class ActiveUserGuard {
    constructor(userService) {
        this.userService = userService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.ForbiddenException('未授权');
        }
        const token = authHeader.substring(7);
        const payload = await this.userService.validateToken(token);
        if (!payload) {
            throw new common_1.ForbiddenException('无效的登录凭证');
        }
        if (payload.status !== 'active') {
            throw new common_1.ForbiddenException('用户已被禁用');
        }
        request.user = {
            id: payload.sub,
            sub: payload.sub,
            openid: payload.openid,
            role: payload.role,
            status: payload.status,
        };
        return true;
    }
};
exports.ActiveUserGuard = ActiveUserGuard;
exports.ActiveUserGuard = ActiveUserGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], ActiveUserGuard);
//# sourceMappingURL=active-user.guard.js.map