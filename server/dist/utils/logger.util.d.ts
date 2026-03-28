import { LoggerService } from '@nestjs/common';
export declare class AppLogger implements LoggerService {
    private context?;
    setContext(context: string): void;
    log(message: any, ...optionalParams: any[]): void;
    error(message: any, ...optionalParams: any[]): void;
    warn(message: any, ...optionalParams: any[]): void;
    debug(message: any, ...optionalParams: any[]): void;
    verbose(message: any, ...optionalParams: any[]): void;
    private printMessage;
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose"
}
export declare function getLogLevel(): LogLevel;
