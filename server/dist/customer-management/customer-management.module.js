"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerManagementModule = void 0;
const common_1 = require("@nestjs/common");
const customer_management_controller_1 = require("./customer-management.controller");
const customer_management_service_1 = require("./customer-management.service");
const churn_warning_controller_1 = require("./churn-warning.controller");
const churn_warning_service_1 = require("./churn-warning.service");
const sales_target_controller_1 = require("../modules/customer/sales-target.controller");
const sales_target_service_1 = require("../modules/customer/sales-target.service");
const database_module_1 = require("../database/database.module");
const user_module_1 = require("../user/user.module");
let CustomerManagementModule = class CustomerManagementModule {
};
exports.CustomerManagementModule = CustomerManagementModule;
exports.CustomerManagementModule = CustomerManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, user_module_1.UserModule],
        controllers: [customer_management_controller_1.CustomerManagementController, churn_warning_controller_1.ChurnWarningController, sales_target_controller_1.SalesTargetController],
        providers: [customer_management_service_1.CustomerManagementService, churn_warning_service_1.ChurnWarningService, sales_target_service_1.SalesTargetService],
        exports: [customer_management_service_1.CustomerManagementService, churn_warning_service_1.ChurnWarningService, sales_target_service_1.SalesTargetService]
    })
], CustomerManagementModule);
//# sourceMappingURL=customer-management.module.js.map