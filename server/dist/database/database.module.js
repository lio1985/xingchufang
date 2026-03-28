"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("./database.service");
const welcome_module_1 = require("./welcome/welcome.module");
const conversation_module_1 = require("./conversation/conversation.module");
const lexicon_module_1 = require("./lexicon/lexicon.module");
const product_module_1 = require("./product/product.module");
const live_script_module_1 = require("./live-script/live-script.module");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [welcome_module_1.WelcomeModule, conversation_module_1.ConversationModule, lexicon_module_1.LexiconModule, product_module_1.ProductModule, live_script_module_1.LiveScriptModule],
        providers: [database_service_1.DatabaseService],
        exports: [database_service_1.DatabaseService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map