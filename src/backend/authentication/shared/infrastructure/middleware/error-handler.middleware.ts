import express from 'express';

export interface IErrorHandlerMiddlewareConfig {
    logger?: { error: (_: string) => void };
}

export class ErrorHandlerMiddleware {
    private readonly logger: { error: (_: string) => void };

    constructor(config: IErrorHandlerMiddlewareConfig) {
        this.logger = config.logger || console;
    }

    public createHandleUncaughtExceptions(): express.ErrorRequestHandler {
        return this.handleUncaughtExceptions.bind(this);
    }

    public handleUncaughtExceptions(
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        res.status(500).json({ error: true, message: 'Internal Server Error' });
        this.logger.error(`Uncaught Error: ${err}`);
    }
}
