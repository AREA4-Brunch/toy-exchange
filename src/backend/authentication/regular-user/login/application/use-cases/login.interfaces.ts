export interface ILoginInput {
    email: string;
    password: string;
}

export interface ILoginOutput {
    token: string;
}

export interface ILoginUseCase {
    execute(input: ILoginInput): ILoginOutput;
}
