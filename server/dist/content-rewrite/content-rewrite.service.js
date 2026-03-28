"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRewriteService = void 0;
const common_1 = require("@nestjs/common");
let ContentRewriteService = class ContentRewriteService {
    async rewriteContent(originalContent, prompt) {
        const rewrittenContent = this.simulateRewrite(originalContent, prompt);
        return rewrittenContent;
    }
    simulateRewrite(content, prompt) {
        let rewritten = content;
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('专业') || lowerPrompt.includes('正式')) {
            rewritten = this.makeProfessional(content);
        }
        else if (lowerPrompt.includes('轻松') || lowerPrompt.includes('口语')) {
            rewritten = this.makeCasual(content);
        }
        else if (lowerPrompt.includes('幽默') || lowerPrompt.includes('有趣')) {
            rewritten = this.makeHumorous(content);
        }
        else if (lowerPrompt.includes('精简') || lowerPrompt.includes('简洁')) {
            rewritten = this.makeConcise(content);
        }
        else if (lowerPrompt.includes('长') || lowerPrompt.includes('扩展')) {
            rewritten = this.makeLonger(content);
        }
        else {
            rewritten = this.makeDefault(content, prompt);
        }
        return rewritten;
    }
    makeProfessional(content) {
        return `【专业版】\n\n${content}\n\n💡 专业提示：建议在实际应用中，结合行业标准和最佳实践进行优化。`;
    }
    makeCasual(content) {
        return `【轻松版】\n\n${content}\n\n🎉 轻松提示：保持亲和力，让内容更易理解和接受！`;
    }
    makeHumorous(content) {
        return `【幽默版】\n\n${content}\n\n😄 幽默提示：适度的幽默可以增加内容的趣味性和传播力！`;
    }
    makeConcise(content) {
        const simplified = content
            .replace(/【.*?】/g, '')
            .replace(/🎯|📝|💡|🔥|💪|✅|❓|📖|🎭|✨|🎯|💎|🏆/g, '')
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .slice(0, Math.ceil(content.split('\n').length / 2))
            .join('\n');
        return `【精简版】\n\n${simplified}`;
    }
    makeLonger(content) {
        return `${content}\n\n💡 额外补充：在实际应用中，可以根据具体情况进行调整和优化，增加更多的细节说明和案例展示。`;
    }
    makeDefault(content, prompt) {
        return `【根据您的需求改写】\n\n${content}\n\n💡 提示：您的改写需求是"${prompt}"，已根据您的需求进行了优化调整。`;
    }
};
exports.ContentRewriteService = ContentRewriteService;
exports.ContentRewriteService = ContentRewriteService = __decorate([
    (0, common_1.Injectable)()
], ContentRewriteService);
//# sourceMappingURL=content-rewrite.service.js.map