import express from 'express';
import { v4 as uuidv4 } from 'uuid';

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
        req.id = (req.headers['x-request-id'] as string) || uuidv4();
        next();
    }
}
