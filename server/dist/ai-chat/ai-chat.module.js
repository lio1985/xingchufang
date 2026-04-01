"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatModule = void 0;
const common_1 = require("@nestjs/common");
const ai_chat_controller_1 = require("./ai-chat.controller");
const ai_chat_service_1 = require("./ai-chat.service");
const intent_recognition_service_1 = require("./intent-recognition.service");
const conversation_manager_service_1 = require("./conversation-manager.service");
const function_executor_service_1 = require("./function-executor.service");
const doubao_llm_service_1 = require("./doubao-llm.service");
const content_generation_module_1 = require("../content-generation/content-generation.module");
let AiChatModule = class AiChatModule {
};
exports.AiChatModule = AiChatModule;
exports.AiChatModule = AiChatModule = __decorate([
    (0, common_1.Module)({
        imports: [content_generation_module_1.ContentGenerationModule],
        controllers: [ai_chat_controller_1.AiChatController],
        providers: [
            doubao_llm_service_1.DoubaoLLMService,
            ai_chat_service_1.AiChatService,
            intent_recognition_service_1.IntentRecognitionService,
            conversation_manager_service_1.ConversationManagerService,
            function_executor_service_1.FunctionExecutorService,
        ],
        exports: [
            doubao_llm_service_1.DoubaoLLMService,
            ai_chat_service_1.AiChatService,
            intent_recognition_service_1.IntentRecognitionService,
            conversation_manager_service_1.ConversationManagerService,
            function_executor_service_1.FunctionExecutorService,
        ],
    })
], AiChatModule);
//# sourceMappingURL=ai-chat.module.js.map