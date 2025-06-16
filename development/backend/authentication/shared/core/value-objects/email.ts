import { ValueObject } from './value-object.base';

export class Email extends ValueObject<string> {
    protected constructor(email: string) {
        super(email);
    }

    public static create(email: string): Email {
        if (!Email.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }
        return new Email(email);
    }

    public static createNoThrow(email: string): {
        success: boolean;
        email?: Email;
        error?: Error;
    } {
        if (!Email.isValidEmail(email)) {
            return { success: false, error: new Error(`Invalid email format`) };
        }
        return { success: true, email: new Email(email) };
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
