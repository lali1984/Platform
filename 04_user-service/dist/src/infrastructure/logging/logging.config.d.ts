import { LoggerService } from '@nestjs/common';
export declare class WinstonLogger implements LoggerService {
    private logger;
    private context?;
    constructor();
    setContext(context: string): void;
    log(message: string, ...optionalParams: any[]): void;
    error(message: string, ...optionalParams: any[]): void;
    warn(message: string, ...optionalParams: any[]): void;
    debug(message: string, ...optionalParams: any[]): void;
    verbose(message: string, ...optionalParams: any[]): void;
}
