export interface ILoginInput {
    email: string;
    password: string;
}

export interface ILoginOutput {}

export interface ILoginUseCase {
    execute(input: ILoginInput): ILoginOutput;
}
