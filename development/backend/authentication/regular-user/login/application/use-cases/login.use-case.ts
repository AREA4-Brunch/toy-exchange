import { inject, injectable, singleton } from 'tsyringe';
import { Result } from '../../../../shared/types/result';
import { RegularUserRole } from '../../core/value-objects/regular-user-role';
import { LOGIN_APPLICATION_TYPES } from '../di/login.types';
import { IRegularUserRepository } from '../ports/repositories/regular-user.repository.interface';
import { IPasswordService } from '../ports/services/password.service.interface';
import { ITokenService } from '../ports/services/token.service.interface';
import {
    ILoginInput,
    ILoginOutput,
    ILoginUseCase,
    LoginBannedUserError,
    LoginIncorrectPasswordError,
    LoginUserNotFoundError,
} from '../ports/use-cases/login.use-case.interface';

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

    async execute({
        email,
        password,
    }: ILoginInput): Promise<
        Result<
            ILoginOutput,
            | LoginUserNotFoundError
            | LoginIncorrectPasswordError
            | LoginBannedUserError
        >
    > {
        const user = await this.RegularUser.findLoginData(email);
        if (!user) {
            return Result.failure(new LoginUserNotFoundError(email));
        }
        if (user.roles.includes(RegularUserRole.create('banned'))) {
            return Result.failure(new LoginBannedUserError());
        }
        const isPasswordValid = await this.passwordService.verifyPassword(
            password,
            user.password,
        );
        if (!isPasswordValid) {
            return Result.failure(new LoginIncorrectPasswordError());
        }
        return Result.success({
            token: this.tokenService.generateAuthToken(email, user.roles)[0],
        } as ILoginOutput);
    }
}
