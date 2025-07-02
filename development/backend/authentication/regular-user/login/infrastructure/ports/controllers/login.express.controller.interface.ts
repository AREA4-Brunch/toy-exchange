import express from 'express';
import { z } from 'zod';
import { InvalidEmailError } from '../../../../../shared/core/value-objects/email';
import { Result } from '../../../../../shared/types/result';

export interface ILoginExpressController {
    login(
        req: express.Request<any, any, any>,
    ): Result<Promise<void>, z.ZodError<any> | InvalidEmailError>;
}
