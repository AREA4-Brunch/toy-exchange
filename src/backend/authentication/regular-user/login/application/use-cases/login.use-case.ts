import { inject, injectable, singleton } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../di/login-application.types';
import { IRegularUserRepository } from '../repositories/regular-user.repository.interface';
import { IPasswordService } from '../services/password.service.interface';
import { ITokenService } from '../services/token.service.interface';
import {
    ILoginInput,
    ILoginOutput,
    ILoginUseCase,
    LoginIncorrectPasswordError,
    LoginUserNotFoundError,
} from './login.use-case.interface';

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

    async execute({ email, password }: ILoginInput): Promise<ILoginOutput> {
        const user = await this.RegularUser.find({ email });
        if (!user) {
            throw new LoginUserNotFoundError(email);
        }
        const isPasswordValid = await this.passwordService.verifyPassword(
            password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new LoginIncorrectPasswordError();
        }
        return {
            token: this.tokenService.generateAuthToken(email, user.roles)[0],
        } as ILoginOutput;
    }
}
