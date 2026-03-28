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
var ContentGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGenerationService = void 0;
const common_1 = require("@nestjs/common");
const coze_coding_dev_sdk_1 = require("coze-coding-dev-sdk");
let ContentGenerationService = ContentGenerationService_1 = class ContentGenerationService {
    constructor() {
        this.logger = new common_1.Logger(ContentGenerationService_1.name);
        this.isLLMAvailable = false;
        this.contentCache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000;
        try {
            const config = new coze_coding_dev_sdk_1.Config();
            this.llmClient = new coze_coding_dev_sdk_1.LLMClient(config);
            this.isLLMAvailable = true;
            this.logger.log('LLM服务初始化成功');
        }
        catch (error) {
            this.logger.warn('LLM服务初始化失败，将使用模板生成', error);
            this.isLLMAvailable = false;
        }
    }
    getCacheKey(topic, variant, options) {
        const platform = options?.platform || '通用';
        const style = options?.style || '标准版';
        return `${topic}-${variant}-${platform}-${style}`;
    }
    getFromCache(key) {
        const cached = this.contentCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            this.logger.log(`命中缓存: ${key}`);
            return cached.content;
        }
        return null;
    }
    setCache(key, content) {
        this.contentCache.set(key, {
            content,
            timestamp: Date.now()
        });
    }
    async generateContent(topics, options) {
        const promises = [];
        for (const topic of topics) {
            promises.push(this.generateSingleContent(topic, options, 'A'));
            promises.push(this.generateSingleContent(topic, options, 'B'));
        }
        return Promise.all(promises);
    }
    async generateSingleContent(topic, options, variant) {
        const content = await this.generateScript(topic, options, variant);
        return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            topic,
            title: await this.generateTitle(topic, variant),
            content,
            platform: options?.platform || '通用',
            version: options?.style || '标准版',
            variant: variant || 'A',
            createdAt: new Date()
        };
    }
    async generateScript(topic, options, variant) {
        const cacheKey = this.getCacheKey(topic, variant || 'A', options);
        const cachedContent = this.getFromCache(cacheKey);
        if (cachedContent) {
            return cachedContent;
        }
        if (this.isLLMAvailable) {
            try {
                const startTime = Date.now();
                const content = await this.generateScriptWithLLM(topic, options, variant);
                const duration = Date.now() - startTime;
                this.logger.log(`LLM生成脚本耗时: ${duration}ms, 话题: ${topic}, 变体: ${variant}`);
                this.setCache(cacheKey, content);
                return content;
            }
            catch (error) {
                this.logger.error('LLM生成失败，降级使用模板', error);
            }
        }
        const templates = this.getScriptTemplates(topic, variant);
        const template = templates[Math.floor(Math.random() * templates.length)];
        return template;
    }
    async generateScriptWithLLM(topic, options, variant) {
        this.logger.log(`使用LLM生成脚本，话题: ${topic}, 变体: ${variant}`);
        const prompt = this.buildPrompt(topic, variant, options);
        const messages = [
            { role: 'user', content: prompt }
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.6,
        });
        const content = response.content || '';
        this.logger.log(`LLM生成成功，内容长度: ${content.length}`);
        return content;
    }
    buildPrompt(topic, variant, options) {
        const platform = options?.platform || '通用平台';
        const style = options?.style || '标准版';
        if (variant === 'A') {
            return `你是一个专业的视频脚本创作者。请为话题"${topic}"生成一个详细的视频脚本。

要求：
1. 平台：${platform}
2. 风格：${style}
3. 结构：采用五段式结构（开场、第一点、第二点、第三点、结尾）
4. 时长：60-90秒
5. 语言：通俗易懂，富有感染力

请直接输出脚本内容，不要包含任何说明文字。`;
        }
        else {
            return `你是一个创意视频脚本创作者。请为话题"${topic}"生成一个轻松有趣的视频脚本。

要求：
1. 平台：${platform}
2. 风格：轻松幽默、故事性强
3. 结构：采用故事式或对比式结构
4. 时长：45-75秒
5. 语言：口语化、有互动感

请直接输出脚本内容，不要包含任何说明文字。`;
        }
    }
    async generateTitle(topic, variant) {
        return this.getTitleTemplate(topic, variant);
    }
    async generateTitlesWithLLM(topic) {
        this.logger.log('使用LLM生成标题');
        const prompt = `请根据以下话题，生成5个吸引人的视频标题：

话题：${topic}

要求：
1. 标题要简洁有力，15字以内
2. 包含数字或疑问句，提高点击率
3. 突出视频的核心价值
4. 直接输出5个标题，每行一个，不要包含编号和说明文字`;
        const messages = [
            { role: 'user', content: prompt }
        ];
        const response = await this.llmClient.invoke(messages, {
            temperature: 0.8,
        });
        const content = response.content || '';
        const titles = content
            .split('\n')
            .map(t => t.trim())
            .filter(t => t.length > 0 && t.length <= 15);
        this.logger.log(`LLM生成标题成功，数量: ${titles.length}`);
        return titles.length > 0 ? titles : this.getTitleTemplates();
    }
    getTitleTemplate(topic, variant) {
        const prefixesA = [
            '必看', '深度解析', '实战指南', '超详细', '全方位', '新手必看'
        ];
        const prefixesB = [
            '避坑指南', '快速入门', '终极指南', '详细解读', '通俗易懂', '精简版'
        ];
        const prefixes = variant === 'B' ? prefixesB : prefixesA;
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return `${prefix}：${topic}`;
    }
    getScriptTemplates(topic, variant) {
        if (variant === 'B') {
            return [
                this.generateStoryScript(topic),
                this.generateComparisonScript(topic),
                this.generateTipsScript(topic)
            ];
        }
        return [
            this.generateFiveParagraphScript(topic),
            this.generateListScript(topic),
            this.generateQAScript(topic)
        ];
    }
    generateFiveParagraphScript(topic) {
        return `【${topic}】完整指南

🎯 开场（5秒）
"大家好，今天我们来聊聊${topic}，这可是很多人都关心的问题，看完这个视频你就懂了！"

📝 第一点：基础知识（15秒）
"首先，我们要了解${topic}的核心要点，很多人容易忽略的就是这一点..."

💡 第二点：关键技巧（20秒）
"接下来是关键技巧，这是我总结的三个方法：1️⃣ 方法一 2️⃣ 方法二 3️⃣ 方法三，每个都很实用！"

🔥 第三点：实战案例（15秒）
"举个实际的例子，小明按照这些方法操作，结果效果立竿见影..."

💪 结尾（5秒）
"好了，今天的分享就到这里，觉得有用的朋友别忘了点赞关注，下期见！"`;
    }
    generateListScript(topic) {
        return `【${topic}】清单版

✅ 清单一：准备工作
1. 提前了解${topic}的基本概念
2. 准备必要的工具和材料
3. 制定详细的计划

✅ 清单二：执行步骤
1. 第一步：建立基础框架
2. 第二步：填充核心内容
3. 第三步：完善细节

✅ 清单三：注意事项
• 避免常见的误区
• 及时调整优化
• 持续跟踪效果

最后总结：按照这个清单来，轻松搞定${topic}！`;
    }
    generateQAScript(topic) {
        return `【${topic}】问答版

❓ 问题一：${topic}是什么？
答：简单来说，${topic}就是...（用通俗易懂的语言解释）

❓ 问题二：为什么要了解${topic}？
答：因为...（说明重要性和好处）

❓ 问题三：如何做好${topic}？
答：这三个步骤很关键：
第一步：明确目标
第二步：掌握方法
第三步：持续实践

❓ 问题四：常见误区有哪些？
答：很多人容易犯这三个错误：
1. 忽视基础
2. 急于求成
3. 缺乏坚持

总结：避开这些误区，${topic}其实很简单！`;
    }
    generateStoryScript(topic) {
        return `【${topic}】故事版

📖 从一个真实故事说起
"我朋友小李前段时间遇到了${topic}的问题，当时他也是一头雾水..."

🎭 故事展开
"一开始他以为...，后来发现...，最后..."

💡 关键转折点
"就在快要放弃的时候，他发现了..."

✨ 故事结局
"现在他不仅解决了问题，还把这个方法教给了其他人..."

🎯 总结升华
"这个故事告诉我们，${topic}其实没那么难..."`;
    }
    generateComparisonScript(topic) {
        return `【${topic}】对比版

🔴 错误做法
"很多人在做${topic}时，会犯这些错误：
❌ 错误一
❌ 错误二
❌ 错误三"

🟢 正确做法
"正确的做法应该是：
✅ 正确一
✅ 正确二
✅ 正确三"

📊 效果对比
"错误做法：效率低、效果差
正确做法：效率高、效果好"

🎯 核心要点
"记住这几个关键点，${topic}就搞定了！"`;
    }
    generateTipsScript(topic) {
        return `【${topic}】技巧版

💎 三个黄金技巧
"关于${topic}，我总结了三个黄金技巧"

技巧一：快速入门
"第一步...第二步...第三步..."

技巧二：进阶提升
"当你掌握了基础后，可以这样提升..."

技巧三：高手心得
"达到这个水平后，还可以这样..."

🎯 注意事项
"但要注意这几点..."
"避开这些误区..."

🏆 成功公式
"${topic}成功 = 基础 + 技巧 + 坚持"`;
    }
    getTitleTemplates() {
        return [
            '必看指南',
            '深度解析',
            '实战攻略',
            '详细教程',
            '超详细'
        ];
    }
};
exports.ContentGenerationService = ContentGenerationService;
exports.ContentGenerationService = ContentGenerationService = ContentGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ContentGenerationService);
//# sourceMappingURL=content-generation.service.js.map