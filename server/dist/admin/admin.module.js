"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const admin_controller_1 = require("./admin.controller");
const database_module_1 = require("../database/database.module");
const user_module_1 = require("../user/user.module");
const lexicon_module_1 = require("../database/lexicon/lexicon.module");
const data_export_module_1 = require("../data-export/data-export.module");
const statistics_module_1 = require("../statistics/statistics.module");
const admin_knowledge_share_controller_1 = require("./admin-knowledge-share.controller");
const admin_knowledge_share_service_1 = require("./admin-knowledge-share.service");
const admin_customer_controller_1 = require("./admin-customer.controller");
const customer_management_module_1 = require("../customer-management/customer-management.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            user_module_1.UserModule,
            lexicon_module_1.LexiconModule,
            data_export_module_1.DataExportModule,
            customer_management_module_1.CustomerManagementModule,
            statistics_module_1.StatisticsModule,
        ],
        controllers: [admin_controller_1.AdminController, admin_knowledge_share_controller_1.AdminKnowledgeShareController, admin_customer_controller_1.AdminCustomerController],
        providers: [admin_service_1.AdminService, admin_knowledge_share_service_1.AdminKnowledgeShareService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map