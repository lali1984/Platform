// Упрощенная версия logging.config.ts без daily rotate:
import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';

export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

    const format = isProduction 
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        );

    this.logger = winston.createLogger({
      level: logLevel,
      format: format,
      transports: [
        new winston.transports.Console(),
      ],
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, ...optionalParams: any[]): void {
    this.logger.info(message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]): void {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: any[]): void {
    this.logger.verbose(message, ...optionalParams);
  }
}

// Удалить все упоминания process.domain и DailyRotateFile