"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const file_parser_service_1 = require("./file-parser.service");
let FileParserController = class FileParserController {
    constructor(fileParserService) {
        this.fileParserService = fileParserService;
    }
    async parseFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('请上传文件');
        }
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
            throw new common_1.BadRequestException('不支持的文件类型，仅支持 PDF、Word 和 TXT 文件');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('文件大小不能超过 10MB');
        }
        try {
            const content = await this.fileParserService.parseFile(file);
            return {
                code: 200,
                msg: '解析成功',
                data: {
                    filename: file.originalname,
                    size: file.size,
                    content,
                    mimeType: file.mimetype,
                },
            };
        }
        catch (error) {
            console.error('[FileParser] 解析失败:', error);
            throw new common_1.BadRequestException(`文件解析失败: ${error.message}`);
        }
    }
};
exports.FileParserController = FileParserController;
__decorate([
    (0, common_1.Post)('parse'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileParserController.prototype, "parseFile", null);
exports.FileParserController = FileParserController = __decorate([
    (0, common_1.Controller)('file-parser'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_parser_service_1.FileParserService])
], FileParserController);
//# sourceMappingURL=file-parser.controller.js.map