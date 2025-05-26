import cors from 'cors';
import express from 'express';
import { injectable, InjectionToken, singleton } from 'tsyringe';
import { RegularUserIoC } from '../../../regular-user/main/ioc/ioc/regular-user.ioc';
import { ModuleIoC } from '../../../shared/main/ioc/ioc/ioc-initializer.base';
import { IAuthenticationConfig } from '../../config/auth-config.interface';
import { AuthenticationBinder } from '../binders/auth.binder';

@singleton()
@injectable()
export class AuthenticationIoC extends ModuleIoC<IAuthenticationConfig> {
    constructor(binder: AuthenticationBinder) {
        super(
            binder,
            'api.basePath',
            new Map<InjectionToken, string>([[RegularUserIoC, 'regularUser']]),
        );
    }

    protected override createCommonChildRouter(): express.Router {
        const router = express.Router();
        router.use(cors());
        router.use(express.json());
        return router;
    }
}
