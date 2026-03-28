"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataExportModule = void 0;
const common_1 = require("@nestjs/common");
const data_export_service_1 = require("./data-export.service");
const data_export_controller_1 = require("./data-export.controller");
const database_module_1 = require("../database/database.module");
const user_module_1 = require("../user/user.module");
let DataExportModule = class DataExportModule {
};
exports.DataExportModule = DataExportModule;
exports.DataExportModule = DataExportModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, user_module_1.UserModule],
        controllers: [data_export_controller_1.DataExportController],
        providers: [data_export_service_1.DataExportService],
        exports: [data_export_service_1.DataExportService],
    })
], DataExportModule);
//# sourceMappingURL=data-export.module.js.map