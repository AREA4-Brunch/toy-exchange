import { Result } from '../../types/result';
import { ValueObject } from './value-object.base';

export class InvalidEmailError extends Error {
    readonly code: string = 'INVALID_EMAIL_FORMAT' as const;

    constructor() {
        super('Invalid email format.');
    }
}

export class Email extends ValueObject<string> {
    protected constructor(email: string) {
        super(email);
    }

    public static create(email: string): Result<Email, InvalidEmailError> {
        if (!Email.isValidEmail(email)) {
            return Result.failure(new InvalidEmailError());
        }
        return Result.success(new Email(email));
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
