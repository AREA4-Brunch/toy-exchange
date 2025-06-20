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
            | LoginBannedUserError
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

export class LoginBannedUserError extends ILoginUseCaseError {
    public static readonly msg = `User may not login due to having been banned.`;

    constructor() {
        super(LoginBannedUserError.msg);
    }
}

export type LoginUseCaseErrors =
    | LoginUserNotFoundError
    | LoginIncorrectPasswordError
    | LoginBannedUserError;
