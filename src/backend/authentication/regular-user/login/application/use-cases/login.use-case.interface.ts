export interface ILoginInput {
    email: string;
    password: string;
}

export interface ILoginOutput {
    token: string;
}

export interface ILoginUseCase {
    execute(input: ILoginInput): Promise<ILoginOutput>;
}

export class LoginUserNotFoundError extends Error {
    constructor(email: string) {
        super(`No user found with email: ${email}`);
    }
}

export class LoginIncorrectPasswordError extends Error {
    constructor() {
        super(`Provided password is incorrect.`);
    }
}
