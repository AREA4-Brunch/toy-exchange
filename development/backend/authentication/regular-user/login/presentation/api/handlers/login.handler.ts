import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { ZodError } from 'zod';
import { InvalidEmailError } from '../../../../../shared/core/value-objects/email';
import { Result } from '../../../../../shared/types/result';
import { LOGIN_PRESENTATION_TYPES } from '../../di/login.types';
import { ILoginExpressControllerFactory } from '../../ports/api/handlers/login.controller.factory.interface';

// I interpret this as an extension of the presentation framework's request
// handler and not as a controller talked about in the clean architecture.
@singleton()
@injectable()
export class LoginHandler {
    constructor(
        @inject(LOGIN_PRESENTATION_TYPES.LoginExpressControllerFactory)
        private readonly loginControllerFactory: ILoginExpressControllerFactory,
    ) {}

    public handle(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        // Has to create controller dynamically for the presenter/view to be
        // configured with response (rendering) logic. Alternatively the use
        // case could for example take a request id as an arg, pass to
        // presenter/view which fetches response obj stored in some registry
        // under that id, but that breaks the separation of concerns.
        // prettier-ignore
        this.loginControllerFactory
            .create(res)
            .login(req)
            .match({
                success: (result) => { result.then(next).catch(next) },
                failure: (err) => { next(err) },
            });
    }

    // Not business errors that are handled by the view, but bad input errors
    // (controller's invalid input/invocation kind) and unexpected errors.
    public handleAnyError(
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        Result.failure(err)
            .catch(ZodError, (err) => {
                res.status(400).json({ errors: err.errors });
            })
            .catch(InvalidEmailError, (err) => {
                res.status(400).json({ errors: [err.message] });
            })
            .mapError((unimaginable: any) => {
                console.error(
                    `[${req.id || 'no-id'}] Unexpected error during login:`,
                    unimaginable,
                );
                res.status(500).json({
                    message: `Oops, an unexpected error occurred.`,
                });
            });
    }
}
