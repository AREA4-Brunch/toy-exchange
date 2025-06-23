import cors from 'cors';
import express from 'express';
import { injectable, singleton } from 'tsyringe';
import { RegularUserIoC } from '../../../regular-user/main/ioc/ioc/regular-user.ioc';
import { ModuleIoC } from '../../../shared/main/ioc/ioc/ioc';
import { IAuthenticationConfig } from '../../config/auth.config.interface';
import { AuthenticationBinder } from '../binders/auth.binder';

@singleton()
@injectable()
export class AuthenticationIoC extends ModuleIoC<IAuthenticationConfig> {
    constructor(binder: AuthenticationBinder) {
        super(
            binder,
            (conf: IAuthenticationConfig) => conf.api.basePath,
            (_, __, conf: IAuthenticationConfig) => [
                [[RegularUserIoC, conf.regularUser]],
            ],
        );
    }

    protected override async createCommonChildRouter(): Promise<express.Router> {
        const router = express.Router();
        router.use(cors());
        router.use(express.json());
        return router;
    }
}
