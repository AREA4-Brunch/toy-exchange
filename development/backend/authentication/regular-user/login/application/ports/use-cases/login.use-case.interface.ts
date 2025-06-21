import { Email } from '../../../../../shared/core/value-objects/email';
import { Result } from '../../../../../shared/types/result';

export interface ILoginInput {
    email: Email;
    password: string;
}

export interface ILoginOutput {
    token: string;
}

export interface ILoginUseCase {
    execute(
        input: ILoginInput,
    ): Promise<Result<ILoginOutput, LoginUseCaseErrors>>;
}

// do not export, use LoginUseCaseErrors instead to enforce thinking
// about all causes
abstract class LoginUseCaseError extends Error {
    abstract readonly code: string; // for type safety

    constructor(public readonly message: string) {
        super(message);
    }
}

export class LoginUserNotFoundError extends LoginUseCaseError {
    readonly code = 'LOGIN_USER_NOT_FOUND' as const;

    constructor(email: Email) {
        super(`No user found with email: ${email.value}`);
    }
}

export class LoginIncorrectPasswordError extends LoginUseCaseError {
    readonly code = 'LOGIN_INCORRECT_PASSWORD' as const;

    constructor() {
        super(`Provided password is incorrect.`);
    }
}

export class LoginForbiddenError extends LoginUseCaseError {
    readonly code = 'LOGIN_FORBIDDEN' as const;

    constructor() {
        super(`User may not login due to having been banned.`);
    }
}

// union useful for reminding of strict typing/handling all causes/errors
// not just general error base class
export type LoginUseCaseErrors =
    | LoginUserNotFoundError
    | LoginIncorrectPasswordError
    | LoginForbiddenError;
