import express from 'express';
import jwt from 'jsonwebtoken';
import {
    AuthorizationHeaderInvalid,
    AuthorizationHeaderMissing,
    AuthTokenDataInterpreter,
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
            return;
        }
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ errMsg: 'Invalid token.' });
            return;
        }
        if (err instanceof jwt.NotBeforeError) {
            res.status(401).json({ errMsg: 'Token not active yet.' });
            return;
        }
        if (err instanceof AuthorizationHeaderMissing) {
            res.status(401).json({ errMsg: err.message });
            return;
        }
        if (err instanceof AuthorizationHeaderInvalid) {
            res.status(401).json({ errMsg: err.message });
            return;
        }
        next(err);
    }

    public createRequireRoles(roles: {
        all?: string[];
        some?: string[];
        none?: string[];
    }): express.RequestHandler {
        return this.requireRoles.bind(
            this,
            new Set<string>(roles.all),
            new Set<string>(roles.some),
            new Set<string>(roles.none),
        );
    }

    public requireRoles(
        all: Set<string>,
        some: Set<string>,
        none: Set<string>,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        const data: AuthTokenDataInterpreter = res.locals.authTokenData;
        if (!data.hasNoRoles(none)) {
            res.status(403).json({ errMsg: `Token has forbidden roles.` });
            return;
        }
        if (!data.hasAllRoles(all) || !data.hasSomeRoles(some)) {
            res.status(403).json({ errMsg: `Token has insufficient roles.` });
            return;
        }
        next();
    }
}
