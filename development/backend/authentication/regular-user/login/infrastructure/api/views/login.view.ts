import { ILoginOutput } from '../../../application/ports/use-cases/login.use-case.interface';
import { ILoginErrorView, ILoginSuccessView } from './login.view.interface';

export class LoginSuccessView implements ILoginSuccessView {
    public readonly status = 'success';

    constructor(public data: ILoginOutput) {}
}

export class LoginErrorView implements ILoginErrorView {
    public readonly status = 'failure';

    constructor(public message: string) {}
}
