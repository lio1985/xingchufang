"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.AppLogger = void 0;
exports.getLogLevel = getLogLevel;
const common_1 = require("@nestjs/common");
let AppLogger = class AppLogger {
    setContext(context) {
        this.context = context;
    }
    log(message, ...optionalParams) {
        this.printMessage('LOG', message, optionalParams);
    }
    error(message, ...optionalParams) {
        this.printMessage('ERROR', message, optionalParams);
    }
    warn(message, ...optionalParams) {
        this.printMessage('WARN', message, optionalParams);
    }
    debug(message, ...optionalParams) {
        if (process.env.NODE_ENV !== 'production') {
            this.printMessage('DEBUG', message, optionalParams);
        }
    }
    verbose(message, ...optionalParams) {
        if (process.env.NODE_ENV !== 'production') {
            this.printMessage('VERBOSE', message, optionalParams);
        }
    }
    printMessage(level, message, optionalParams) {
        const timestamp = new Date().toISOString();
        const contextPrefix = this.context ? `[${this.context}] ` : '';
        console.log(`[${timestamp}] [${level}] ${contextPrefix}`, message, ...optionalParams);
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], AppLogger);
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
    LogLevel["VERBOSE"] = "verbose";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
function getLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLevel && Object.values(LogLevel).includes(envLevel)) {
        return envLevel;
    }
    return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
}
//# sourceMappingURL=logger.util.js.map