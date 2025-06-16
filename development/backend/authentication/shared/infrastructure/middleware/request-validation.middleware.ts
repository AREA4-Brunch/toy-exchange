import express from 'express';
import { AnyZodObject, ZodError } from 'zod';

export interface IRequestValidationMiddlewareConfig {}

export class RequestValidationMiddleware {
    public constructor(config: IRequestValidationMiddlewareConfig) {}

    public createValidateRequest(
        schema: AnyZodObject,
        rethrowValidationError: boolean = false,
    ): express.RequestHandler {
        return this.validateRequest.bind(this, schema, rethrowValidationError);
    }

    public async validateRequest(
        schema: AnyZodObject,
        rethrowValidationError: boolean,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<void> {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            next();
        } catch (error) {
            if (!rethrowValidationError && error instanceof ZodError) {
                res.status(400).json({
                    status: 'error',
                    message: 'Invalid request data',
                    errors: error.errors,
                });
                return;
            }

            next(error);
        }
    }
}
