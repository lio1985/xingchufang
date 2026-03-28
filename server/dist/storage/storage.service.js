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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let StorageService = StorageService_1 = class StorageService {
    constructor() {
        this.logger = new common_1.Logger(StorageService_1.name);
        this.storage = new coze_coding_dev_sdk_1.S3Storage({
            endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
            accessKey: '',
            secretKey: '',
            bucketName: process.env.COZE_BUCKET_NAME,
            region: 'cn-beijing',
        });
    }
    async uploadFile(buffer, fileName, contentType) {
        this.logger.log(`上传文件: ${fileName}, contentType: ${contentType}`);
        const fileKey = await this.storage.uploadFile({
            fileContent: buffer,
            fileName,
            contentType,
        });
        this.logger.log(`文件上传成功, key: ${fileKey}`);
        return fileKey;
    }
    async getFileUrl(fileKey, expireTime = 86400) {
        const url = await this.storage.generatePresignedUrl({
            key: fileKey,
            expireTime,
        });
        return url;
    }
    async generatePresignedUrl(fileKey, expireTime = 86400) {
        return this.getFileUrl(fileKey, expireTime);
    }
    async deleteFile(fileKey) {
        this.logger.log(`删除文件: ${fileKey}`);
        return await this.storage.deleteFile({ fileKey });
    }
    async fileExists(fileKey) {
        return await this.storage.fileExists({ fileKey });
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map