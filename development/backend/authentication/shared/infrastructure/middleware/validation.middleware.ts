import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const createRequestValidator = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid request data',
                    errors: error.errors,
                });
            }
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during validation',
            });
        }
    };
};
