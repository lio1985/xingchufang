"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const equipment_orders_controller_1 = require("./equipment-orders.controller");
const equipment_orders_service_1 = require("./equipment-orders.service");
const notification_module_1 = require("../notification/notification.module");
const user_module_1 = require("../user/user.module");
let EquipmentOrdersModule = class EquipmentOrdersModule {
};
exports.EquipmentOrdersModule = EquipmentOrdersModule;
exports.EquipmentOrdersModule = EquipmentOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [notification_module_1.NotificationModule, user_module_1.UserModule],
        controllers: [equipment_orders_controller_1.EquipmentOrdersController],
        providers: [equipment_orders_service_1.EquipmentOrdersService],
        exports: [equipment_orders_service_1.EquipmentOrdersService],
    })
], EquipmentOrdersModule);
//# sourceMappingURL=equipment-orders.module.js.map