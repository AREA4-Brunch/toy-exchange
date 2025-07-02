import express from 'express';
import { AnyZodObject } from 'zod';

export interface IRequestValidationMiddlewareConfig {}

export class RequestValidationMiddleware {
    public constructor(config: IRequestValidationMiddlewareConfig) {}

    public createParseRequest(
        schema: AnyZodObject,
        passError: boolean = false,
    ): express.RequestHandler {
        return this.parseRequest.bind(this, schema, passError);
    }

    public async parseRequest(
        schema: AnyZodObject,
        passError: boolean,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<void> {
        const result = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        if (result.success) {
            req.body = result.data.body;
            req.params = result.data.params;
            // cannot set req.query since it only has a getter in express
            return next();
        }

        if (passError) {
            return next(result.error);
        }

        res.status(400).json({
            status: 'validation-error',
            message: 'Invalid request data.',
            errors: result.error.errors,
        });
    }
}
