import { Injectable, LoggerService, Scope } from '@nestjs/common';

/**
 * 统一日志服务
 * 根据环境变量选择使用 Winston 或 NestJS Logger
 */

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]) {
    this.printMessage('LOG', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.printMessage('ERROR', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.printMessage('WARN', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('DEBUG', message, optionalParams);
    }
  }

  verbose(message: any, ...optionalParams: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('VERBOSE', message, optionalParams);
    }
  }

  private printMessage(level: string, message: any, optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    const contextPrefix = this.context ? `[${this.context}] ` : '';

    console.log(
      `[${timestamp}] [${level}] ${contextPrefix}`,
      message,
      ...optionalParams,
    );
  }
}

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

/**
 * 获取日志级别
 */
export function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase() as LogLevel;

  if (envLevel && Object.values(LogLevel).includes(envLevel)) {
    return envLevel;
  }

  // 默认根据环境设置日志级别
  return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
}
