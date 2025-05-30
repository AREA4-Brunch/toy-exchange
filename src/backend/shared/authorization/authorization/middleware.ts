import express from 'express';
import jwt from 'jsonwebtoken';
import {
    AuthorizationHeaderInvalid,
    AuthorizationHeaderMissing,
    AuthTokenRequestParser,
} from './token';

export class AuthorizationMiddleware {
    constructor(private readonly tokenReqParser: AuthTokenRequestParser) {}

    public createRequireLogin(): express.RequestHandler {
        return this.requireLogin.bind(this);
    }

    public requireLogin(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        res.locals.authTokenData = this.tokenReqParser.getData(req)[1];
        next();
    }

    public createUnauthorizedErrHandler(): express.ErrorRequestHandler {
        return this.unauthorizedErrHandler.bind(this);
    }

    public unauthorizedErrHandler(
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ errMsg: 'Token expired.' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ errMsg: 'Invalid token.' });
        } else if (err instanceof jwt.NotBeforeError) {
            res.status(401).json({ errMsg: 'Token not active yet.' });
        } else if (err instanceof AuthorizationHeaderMissing) {
            res.status(401).json({ errMsg: err.message });
        } else if (err instanceof AuthorizationHeaderInvalid) {
            res.status(401).json({ errMsg: err.message });
        } else {
            next(err);
        }
    }
}
