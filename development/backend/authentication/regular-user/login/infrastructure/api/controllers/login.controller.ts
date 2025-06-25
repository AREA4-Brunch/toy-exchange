import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login.types';
import { ILoginUseCase } from '../../../application/ports/use-cases/login.use-case.interface';
import { LoginPresenter } from '../presenters/login.presenter';
import { TLoginReqBody, TLoginReqParam } from '../request/login.request.dto';
import { LoginRequestMapper } from '../request/login.request.mapper';
import { TLoginResponseView } from '../views/login.view.interface';

@singleton()
@injectable()
export class LoginController {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.LoginUseCase)
        private readonly loginUseCase: ILoginUseCase,
        private readonly reqMapper: LoginRequestMapper,
        private readonly presenter: LoginPresenter,
    ) {}

    async login(
        req: express.Request<TLoginReqParam, TLoginResponseView, TLoginReqBody>,
        res: express.Response<TLoginResponseView>,
    ): Promise<void> {
        this.reqMapper
            .toLoginInput(req)
            .mapError((err) => this.presenter.invalidInput(res, err))
            .map((input) =>
                this.loginUseCase.execute(input).then((output) => {
                    output
                        .map((data) => this.presenter.success(res, data))
                        .mapError((err) => this.presenter.loginError(res, err))
                        .reduce((dto) => res.json(dto));
                }),
            );
    }
}
