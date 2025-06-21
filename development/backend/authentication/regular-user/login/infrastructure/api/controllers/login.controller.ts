import express from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../../../application/di/login.types';
import { ILoginUseCase } from '../../../application/ports/use-cases/login.use-case.interface';
import { ILoginResponseDto } from '../dtos/login.response.dto';
import { LoginRequestMapper } from '../mappers/login-request.mapper';
import { LoginResponseMapper } from '../mappers/login-response.mapper';

@singleton()
@injectable()
export class LoginController {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.LoginUseCase)
        private readonly loginUseCase: ILoginUseCase,
        private readonly reqMapper: LoginRequestMapper,
        private readonly resMapper: LoginResponseMapper,
    ) {}

    async login(
        req: express.Request,
        res: express.Response<ILoginResponseDto>,
    ): Promise<void> {
        this.reqMapper
            .toLoginInput(req)
            .mapError((err) => this.resMapper.invalidInput(res, err))
            .map((input) =>
                this.loginUseCase.execute(input).then((output) => {
                    output
                        .map((data) => this.resMapper.success(res, data))
                        .mapError((err) => this.resMapper.loginError(res, err))
                        .reduce((dto) => res.json(dto));
                }),
            );
    }
}
