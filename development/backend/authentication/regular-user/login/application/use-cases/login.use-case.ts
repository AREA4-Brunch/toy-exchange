import { inject, injectable } from 'tsyringe';
import { LOGIN_APPLICATION_TYPES } from '../di/login.types';
import { IRegularUserAuthRepository } from '../ports/repositories/regular-user-auth.repository.interface';
import { IPasswordVerifier } from '../ports/services/password.service.interface';
import { ITokenService } from '../ports/services/token.service.interface';
import {
    ILoginInputBoundary,
    LoginInput,
} from '../ports/use-cases/login.use-case.input.interface';
import {
    ILoginOutputBoundary,
    LoginOutput,
} from '../ports/use-cases/login.use-case.output.interface';
import { LoginEligibilityService } from '../services/login-eligibility.service';

@injectable()
export class LoginUseCase implements ILoginInputBoundary {
    constructor(
        @inject(LOGIN_APPLICATION_TYPES.TokenService)
        private readonly tokenService: ITokenService,
        @inject(LOGIN_APPLICATION_TYPES.PasswordVerifier)
        private readonly passwordVerifier: IPasswordVerifier,
        @inject(LOGIN_APPLICATION_TYPES.RegularUserAuthRepository)
        private readonly AuthRepo: IRegularUserAuthRepository,
        private readonly loginEligibility: LoginEligibilityService,
        @inject(LOGIN_APPLICATION_TYPES.LoginOutputBoundary)
        private readonly presenter: ILoginOutputBoundary,
    ) {}

    async execute({ email, password }: LoginInput): Promise<void> {
        const data = await this.AuthRepo.findUsrLoginData(email);
        if (!data) {
            this.presenter.errorUserNotFound(email);
            return;
        }
        if (this.loginEligibility.isForbidden(data.roles)) {
            this.presenter.errorForbidden();
            return;
        }
        const isPasswordValid = await this.passwordVerifier.verifyPassword(
            password,
            data.password,
        );
        if (!isPasswordValid) {
            this.presenter.errorIncorrectPassword();
            return;
        }
        // prettier-ignore
        this.presenter.success(LoginOutput.create(
            this.tokenService.generateAuthToken(email, data.roles)[0],
        ));
    }
}
