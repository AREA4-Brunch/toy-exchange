import { ILoginOutput } from '../../../application/ports/use-cases/login.use-case.interface';

export interface ILoginSuccessView {
    readonly status: 'success';
    data: ILoginOutput;
}

export interface ILoginErrorView {
    readonly status: 'failure';
    message: string;
}

export type TLoginResponseView = ILoginSuccessView | ILoginErrorView;
