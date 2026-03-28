"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagGenerationModule = void 0;
const common_1 = require("@nestjs/common");
const tag_generation_controller_1 = require("./tag-generation.controller");
const tag_generation_service_1 = require("./tag-generation.service");
let TagGenerationModule = class TagGenerationModule {
};
exports.TagGenerationModule = TagGenerationModule;
exports.TagGenerationModule = TagGenerationModule = __decorate([
    (0, common_1.Module)({
        controllers: [tag_generation_controller_1.TagGenerationController],
        providers: [tag_generation_service_1.TagGenerationService],
        exports: [tag_generation_service_1.TagGenerationService]
    })
], TagGenerationModule);
//# sourceMappingURL=tag-generation.module.js.map