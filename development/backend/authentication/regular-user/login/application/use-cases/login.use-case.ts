import { inject, injectable, singleton } from 'tsyringe';
import { Result } from '../../../../shared/types/result';
import { LOGIN_APPLICATION_TYPES } from '../di/login.types';
import { IRegularUserAuthRepository } from '../ports/repositories/regular-user-auth.repository.interface';
import { IPasswordService } from '../ports/services/password.service.interface';
import { ITokenService } from '../ports/services/token.service.interface';
import {
    ILoginInput,
    ILoginOutput,
    ILoginUseCase,
    LoginForbiddenError,
    LoginIncorrectPasswordError,
    LoginUseCaseErrors,
    LoginUserNotFoundError,
} from '../ports/use-cases/login.use-case.interface';
import { LoginEligibilityService } from '../services/login-eligibility.service';

@singleton()
@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.TokenService)
        private readonly tokenService: ITokenService,
        @inject(LOGIN_APPLICATION_TYPES.PasswordService)
        private readonly passwordService: IPasswordService,
        @inject(LOGIN_APPLICATION_TYPES.RegularUserAuthRepository)
        private readonly AuthRepo: IRegularUserAuthRepository,
        private readonly loginEligibility: LoginEligibilityService,
    ) {}

    async execute({
        email,
        password,
    }: ILoginInput): Promise<Result<ILoginOutput, LoginUseCaseErrors>> {
        const data = await this.AuthRepo.findUsrLoginData(email);
        if (!data) {
            return Result.failure(new LoginUserNotFoundError(email));
        }
        if (this.loginEligibility.isForbidden(data.roles)) {
            return Result.failure(new LoginForbiddenError());
        }
        const isPasswordValid = await this.passwordService.verifyPassword(
            password,
            data.password,
        );
        if (!isPasswordValid) {
            return Result.failure(new LoginIncorrectPasswordError());
        }
        return Result.success({
            token: this.tokenService.generateAuthToken(email, data.roles)[0],
        } as ILoginOutput);
    }
}
