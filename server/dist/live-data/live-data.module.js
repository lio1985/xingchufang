"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveDataModule = void 0;
const common_1 = require("@nestjs/common");
const live_data_controller_1 = require("./live-data.controller");
const live_data_service_1 = require("./live-data.service");
const user_module_1 = require("../user/user.module");
const active_user_guard_1 = require("../guards/active-user.guard");
let LiveDataModule = class LiveDataModule {
};
exports.LiveDataModule = LiveDataModule;
exports.LiveDataModule = LiveDataModule = __decorate([
    (0, common_1.Module)({
        imports: [user_module_1.UserModule],
        controllers: [live_data_controller_1.LiveDataController],
        providers: [live_data_service_1.LiveDataService, active_user_guard_1.ActiveUserGuard],
        exports: [live_data_service_1.LiveDataService],
    })
], LiveDataModule);
//# sourceMappingURL=live-data.module.js.map