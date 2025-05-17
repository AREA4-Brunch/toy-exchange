import {
    ErrorHandlerMiddleware,
    IErrorHandlerMiddlewareConfig,
} from './error-handler.middleware';
import {
    ISanitizationMiddlewareConfig,
    SanitizationMiddleware,
} from './sanitization.middleware';
import {
    IRequestLoggingMiddlewareConfig,
    RequestLoggingMiddleware,
} from './request-logging.middleware';
import {
    IResponseLoggingMiddlewareConfig,
    ResponseLoggingMiddleware,
} from './response-logging.middleware';
import { RequestMetadataMiddleware } from './request-metadata.middleware';

export type IMiddlewareModuleConfig = {
    sanitization: ISanitizationMiddlewareConfig;
    requestLogging: IRequestLoggingMiddlewareConfig;
    responseLogging: IResponseLoggingMiddlewareConfig;
    errorHandler: IErrorHandlerMiddlewareConfig;
};

export class MiddlewareModule {
    public readonly sanitizationMiddleware: SanitizationMiddleware;
    public readonly requestMetadataMiddleware: RequestMetadataMiddleware;
    public readonly requestLoggingMiddleware: RequestLoggingMiddleware;
    public readonly responseLoggingMiddleware: ResponseLoggingMiddleware;
    public readonly errorHandlerMiddleware: ErrorHandlerMiddleware;

    constructor(config: IMiddlewareModuleConfig) {
        this.sanitizationMiddleware = new SanitizationMiddleware(
            config.sanitization,
        );
        this.requestMetadataMiddleware = new RequestMetadataMiddleware();
        this.requestLoggingMiddleware = new RequestLoggingMiddleware(
            config.requestLogging,
        );
        this.responseLoggingMiddleware = new ResponseLoggingMiddleware(
            config.responseLogging,
        );
        this.errorHandlerMiddleware = new ErrorHandlerMiddleware(
            config.errorHandler,
        );
    }
}
