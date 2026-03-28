"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveScriptModule = void 0;
const common_1 = require("@nestjs/common");
const live_script_controller_1 = require("./live-script.controller");
const live_script_service_1 = require("./live-script.service");
let LiveScriptModule = class LiveScriptModule {
};
exports.LiveScriptModule = LiveScriptModule;
exports.LiveScriptModule = LiveScriptModule = __decorate([
    (0, common_1.Module)({
        controllers: [live_script_controller_1.LiveScriptController],
        providers: [live_script_service_1.LiveScriptService],
        exports: [live_script_service_1.LiveScriptService]
    })
], LiveScriptModule);
//# sourceMappingURL=live-script.module.js.map