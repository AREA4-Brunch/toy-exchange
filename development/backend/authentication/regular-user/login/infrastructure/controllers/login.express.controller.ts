import express from 'express';
import { inject, injectable } from 'tsyringe';
import { z, ZodError } from 'zod';
import {
    Email,
    InvalidEmailError,
} from '../../../../shared/core/value-objects/email';
import { Result } from '../../../../shared/types/result';
import { LOGIN_APPLICATION_TYPES } from '../../application/di/login.types';
import {
    ILoginInputBoundary,
    LoginInput,
} from '../../application/ports/use-cases/login.use-case.input.interface';
import { ILoginExpressController } from '../ports/controllers/login.express.controller.interface';

@injectable()
export class LoginExpressController implements ILoginExpressController {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.LoginInputBoundary)
        private readonly useCase: ILoginInputBoundary,
    ) {}

    public login(
        req: express.Request<any, any, any>,
    ): Result<Promise<void>, z.ZodError<any> | InvalidEmailError> {
        return toLoginInput(req).map(async (input: LoginInput) => {
            await this.useCase.execute(input);
        });
    }
}

// basic existance of fields and type safety could be enforced in presentation
// layer via middleware instead, but no need to clutter presentation layer with
// schemas, so left the incoming request raw and parsed only here
const loginRestRequestSchema = z.object({
    body: z.object({
        email: z.string(),
        password: z.string(),
    }),
    query: z.object({}),
    params: z.object({}),
});

const toLoginInput = (
    rawReq: express.Request<any, any, any>,
): Result<LoginInput, ZodError | InvalidEmailError> => {
    const res = loginRestRequestSchema.safeParse({
        body: rawReq.body,
        query: rawReq.query,
        params: rawReq.params,
    });
    if (!res.success) {
        return Result.failure(res.error);
    }
    return Email.create(res.data.body.email).flatMap((email) =>
        LoginInput.create(email, res.data.body.password),
    );
};
