"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParserService = void 0;
const common_1 = require("@nestjs/common");
const mammoth = require("mammoth");
let FileParserService = class FileParserService {
    async parseFile(file) {
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        switch (fileExtension) {
            case '.pdf':
                return this.parsePdf(file.buffer);
            case '.doc':
            case '.docx':
                return this.parseWord(file.buffer);
            case '.txt':
                return this.parseText(file.buffer);
            default:
                throw new common_1.BadRequestException(`不支持的文件类型: ${fileExtension}`);
        }
    }
    async parsePdf(buffer) {
        try {
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            let text = data.text;
            text = this.cleanText(text);
            if (!text.trim()) {
                throw new common_1.BadRequestException('PDF 文件内容为空或无法提取文本');
            }
            return text;
        }
        catch (error) {
            console.error('[FileParser] PDF 解析失败:', error);
            throw new common_1.BadRequestException(`PDF 解析失败: ${error.message}`);
        }
    }
    async parseWord(buffer) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            let text = result.value;
            text = this.cleanText(text);
            if (!text.trim()) {
                throw new common_1.BadRequestException('Word 文件内容为空');
            }
            return text;
        }
        catch (error) {
            console.error('[FileParser] Word 解析失败:', error);
            throw new common_1.BadRequestException(`Word 解析失败: ${error.message}`);
        }
    }
    parseText(buffer) {
        try {
            const text = buffer.toString('utf-8');
            return this.cleanText(text);
        }
        catch (error) {
            console.error('[FileParser] 文本解析失败:', error);
            throw new common_1.BadRequestException(`文本解析失败: ${error.message}`);
        }
    }
    cleanText(text) {
        let cleaned = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
        if (cleaned.length > 50000) {
            cleaned = cleaned.substring(0, 50000) + '...[内容已截断]';
        }
        return cleaned;
    }
};
exports.FileParserService = FileParserService;
exports.FileParserService = FileParserService = __decorate([
    (0, common_1.Injectable)()
], FileParserService);
//# sourceMappingURL=file-parser.service.js.map