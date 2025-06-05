import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../di/login-application.types';
import { IPasswordService } from '../services/password.service.interface';
import { ITokenService } from '../services/token.service.interface';
import {
    ILoginInput,
    ILoginOutput,
    ILoginUseCase,
    IRegularUserRepository,
} from './login.interfaces';

@singleton()
@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.TokenService)
        private readonly tokenService: ITokenService,
        @inject(LOGIN_APPLICATION_TYPES.PasswordService)
        private readonly passwordService: IPasswordService,
        @inject(LOGIN_APPLICATION_TYPES.RegularUserRepository)
        private readonly RegularUser: IRegularUserRepository,
    ) {}

    execute({ email, password }: ILoginInput): ILoginOutput {
        const token = this.tokenService.generateAuthToken(email, [])[0];
        return { token: token } as ILoginOutput;
    }
}
