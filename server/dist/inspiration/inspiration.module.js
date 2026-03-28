"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspirationModule = void 0;
const common_1 = require("@nestjs/common");
const inspiration_controller_1 = require("./inspiration.controller");
const inspiration_service_1 = require("./inspiration.service");
let InspirationModule = class InspirationModule {
};
exports.InspirationModule = InspirationModule;
exports.InspirationModule = InspirationModule = __decorate([
    (0, common_1.Module)({
        controllers: [inspiration_controller_1.InspirationController],
        providers: [inspiration_service_1.InspirationService],
        exports: [inspiration_service_1.InspirationService],
    })
], InspirationModule);
//# sourceMappingURL=inspiration.module.js.map