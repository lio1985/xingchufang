"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecycleManagementModule = void 0;
const common_1 = require("@nestjs/common");
const recycle_management_controller_1 = require("./recycle-management.controller");
const recycle_management_service_1 = require("./recycle-management.service");
const database_module_1 = require("../database/database.module");
const user_module_1 = require("../user/user.module");
let RecycleManagementModule = class RecycleManagementModule {
};
exports.RecycleManagementModule = RecycleManagementModule;
exports.RecycleManagementModule = RecycleManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, user_module_1.UserModule],
        controllers: [recycle_management_controller_1.RecycleManagementController],
        providers: [recycle_management_service_1.RecycleManagementService],
        exports: [recycle_management_service_1.RecycleManagementService],
    })
], RecycleManagementModule);
//# sourceMappingURL=recycle-management.module.js.map