"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const storage_module_1 = require("../storage/storage.module");
const notification_module_1 = require("../notification/notification.module");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const active_user_guard_1 = require("../guards/active-user.guard");
const admin_guard_1 = require("../guards/admin.guard");
const optional_auth_guard_1 = require("../guards/optional-auth.guard");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [storage_module_1.StorageModule, (0, common_1.forwardRef)(() => notification_module_1.NotificationModule)],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService, jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard, optional_auth_guard_1.OptionalAuthGuard],
        exports: [user_service_1.UserService, jwt_auth_guard_1.JwtAuthGuard, active_user_guard_1.ActiveUserGuard, admin_guard_1.AdminGuard, optional_auth_guard_1.OptionalAuthGuard],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map