import express from 'express';

export interface IResponseLoggingMiddlewareConfig {
    logger?: { info: (_: string, meta?: any) => void };
}

export class ResponseLoggingMiddleware {
    private readonly logger: { info: (_: string, meta?: any) => void };

    constructor(config: IResponseLoggingMiddlewareConfig) {
        this.logger = config.logger || console;
    }

    public createLogResponse(): express.RequestHandler {
        return this.logResponse.bind(this);
    }

    public logResponse(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const { method, url } = req;
        const id = req.id || 'no-id';
        const start = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - start;
            if (id === 'no-id') {
                this.logger.info(
                    `${res.statusCode} - [${method}] [${url}] [${duration}ms]`,
                );
            } else {
                this.logger.info(`${res.statusCode} - [${id}] [${duration}ms]`);
            }
        });

        next();
    }
}
