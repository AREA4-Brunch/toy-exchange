import { injectable, singleton } from 'tsyringe';
import { TokenService } from '../services/token.service';
import { ILoginInput, ILoginOutput, ILoginUseCase } from './login.interfaces';

@singleton()
@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(private readonly tokenService: TokenService) {}

    execute({ email, password }: ILoginInput): ILoginOutput {
        const token = this.tokenService.generateAuthToken(email, [])[0];
        return { token: token } as ILoginOutput;
    }
}
