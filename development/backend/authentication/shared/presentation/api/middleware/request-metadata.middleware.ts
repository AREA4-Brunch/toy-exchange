import express from 'express';

export interface IRequestMetadataMiddlewareConfig {}

export class RequestMetadataMiddleware {
    public constructor(config: IRequestMetadataMiddlewareConfig) {}

    public createRequestMetadata(): express.RequestHandler {
        return this.requestMetadata.bind(this);
    }

    public requestMetadata(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        req.id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
        next();
    }
}
