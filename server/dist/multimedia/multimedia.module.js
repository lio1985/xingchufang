"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultimediaModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const multimedia_service_1 = require("./multimedia.service");
const multimedia_controller_1 = require("./multimedia.controller");
const user_module_1 = require("../user/user.module");
let MultimediaModule = class MultimediaModule {
};
exports.MultimediaModule = MultimediaModule;
exports.MultimediaModule = MultimediaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.memoryStorage)(),
                limits: {
                    fileSize: 100 * 1024 * 1024,
                },
            }),
            user_module_1.UserModule,
        ],
        controllers: [multimedia_controller_1.MultimediaController],
        providers: [multimedia_service_1.MultimediaService],
        exports: [multimedia_service_1.MultimediaService],
    })
], MultimediaModule);
//# sourceMappingURL=multimedia.module.js.map