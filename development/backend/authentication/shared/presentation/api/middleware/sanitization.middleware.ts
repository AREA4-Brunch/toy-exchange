import express from 'express';
import xss from 'xss';

export interface ISanitizationMiddlewareConfig {
    logger?: { error: (_: string) => void };
}

export class SanitizationMiddleware {
    private readonly logger: { error: (_: string) => void };

    constructor(config: ISanitizationMiddlewareConfig) {
        this.logger = config.logger || console;
    }

    public createSanitizeEntireBody(): express.RequestHandler {
        return this.sanitizeEntireBody.bind(this);
    }

    public sanitizeEntireBody(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        try {
            this.sanitizeObject(req.body);
        } catch (err) {
            this.logger.error(`Error while sanitizing request body: ${err}`);
            throw err;
        }
        next();
    }

    private sanitizeObject(data: any): void {
        if (data === null || data === undefined) return;

        for (const key in data) {
            const datum: any = data[key];
            if (datum === null || datum === undefined) {
                continue;
            }
            if (typeof datum === 'object') {
                this.sanitizeObject(datum);
            } else {
                data[key] = xss(datum);
            }
        }
    }
}
