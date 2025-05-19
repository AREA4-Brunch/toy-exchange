import {
    ErrorHandlerMiddleware,
    IErrorHandlerMiddlewareConfig,
} from './error-handler.middleware';
import {
    IRequestLoggingMiddlewareConfig,
    RequestLoggingMiddleware,
} from './request-logging.middleware';
import {
    IRequestMetadataMiddlewareConfig,
    RequestMetadataMiddleware,
} from './request-metadata.middleware';
import {
    IRequestValidationMiddlewareConfig,
    RequestValidationMiddleware,
} from './request-validation.middleware';
import {
    IResponseLoggingMiddlewareConfig,
    ResponseLoggingMiddleware,
} from './response-logging.middleware';
import {
    ISanitizationMiddlewareConfig,
    SanitizationMiddleware,
} from './sanitization.middleware';

export type IMiddlewareModuleConfig = {
    sanitization: ISanitizationMiddlewareConfig;
    requestMetadata: IRequestMetadataMiddlewareConfig;
    requestLogging: IRequestLoggingMiddlewareConfig;
    responseLogging: IResponseLoggingMiddlewareConfig;
    errorHandler: IErrorHandlerMiddlewareConfig;
    requestValidation: IRequestValidationMiddlewareConfig;
};

export class MiddlewareModule {
    public readonly sanitizationMiddleware: SanitizationMiddleware;
    public readonly requestMetadataMiddleware: RequestMetadataMiddleware;
    public readonly requestLoggingMiddleware: RequestLoggingMiddleware;
    public readonly responseLoggingMiddleware: ResponseLoggingMiddleware;
    public readonly errorHandlerMiddleware: ErrorHandlerMiddleware;
    public readonly requestValidationMiddleware: RequestValidationMiddleware;

    constructor(config: IMiddlewareModuleConfig) {
        this.sanitizationMiddleware = new SanitizationMiddleware(
            config.sanitization,
        );
        this.requestMetadataMiddleware = new RequestMetadataMiddleware(
            config.requestMetadata,
        );
        this.requestLoggingMiddleware = new RequestLoggingMiddleware(
            config.requestLogging,
        );
        this.responseLoggingMiddleware = new ResponseLoggingMiddleware(
            config.responseLogging,
        );
        this.errorHandlerMiddleware = new ErrorHandlerMiddleware(
            config.errorHandler,
        );
        this.requestValidationMiddleware = new RequestValidationMiddleware(
            config.requestValidation,
        );
    }
}
