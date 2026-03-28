"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreestyleGenerationModule = void 0;
const common_1 = require("@nestjs/common");
const freestyle_generation_controller_1 = require("./freestyle-generation.controller");
const freestyle_generation_service_1 = require("./freestyle-generation.service");
let FreestyleGenerationModule = class FreestyleGenerationModule {
};
exports.FreestyleGenerationModule = FreestyleGenerationModule;
exports.FreestyleGenerationModule = FreestyleGenerationModule = __decorate([
    (0, common_1.Module)({
        controllers: [freestyle_generation_controller_1.FreestyleGenerationController],
        providers: [freestyle_generation_service_1.FreestyleGenerationService],
        exports: [freestyle_generation_service_1.FreestyleGenerationService],
    })
], FreestyleGenerationModule);
//# sourceMappingURL=freestyle-generation.module.js.map