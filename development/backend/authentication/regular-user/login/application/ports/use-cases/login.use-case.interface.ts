import { Result } from '../../../../../shared/types/result';

export interface ILoginInput {
    email: string;
    password: string;
}

export interface ILoginOutput {
    token: string;
}

export interface ILoginUseCase {
    execute(
        input: ILoginInput,
    ): Promise<
        Result<
            ILoginOutput,
            | LoginUserNotFoundError
            | LoginIncorrectPasswordError
            | LoginForbiddenError
        >
    >;
}

abstract class ILoginUseCaseError {
    constructor(public readonly message: string) {}
}

export class LoginUserNotFoundError extends ILoginUseCaseError {
    constructor(email: string) {
        super(`No user found with email: ${email}`);
    }
}

export class LoginIncorrectPasswordError extends ILoginUseCaseError {
    public static readonly msg = `Provided password is incorrect.`;

    constructor() {
        super(LoginIncorrectPasswordError.msg);
    }
}

export class LoginForbiddenError extends ILoginUseCaseError {
    public static readonly msg = `User may not login due to having been banned.`;

    constructor() {
        super(LoginForbiddenError.msg);
    }
}

export type LoginUseCaseErrors =
    | LoginUserNotFoundError
    | LoginIncorrectPasswordError
    | LoginForbiddenError;
