import { injectable, singleton } from 'tsyringe';
import { ILoginInput, ILoginOutput, ILoginUseCase } from './login.interfaces';

@singleton()
@injectable()
export class LoginUseCase implements ILoginUseCase {
    execute({ email, password }: ILoginInput): ILoginOutput {
        return {} as ILoginOutput;
    }
}
