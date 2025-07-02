import { Email } from '../../../../../shared/core/value-objects/email';

// in clean architecture diagrams output is presented as a data structure,
// so its simplicity by design does not require an interface, so for consistency
// with the book I will not introduce the interface, just create a final class
export class LoginOutput {
    private constructor(public token: string) {}

    public static create(token: string = ''): LoginOutput {
        return new LoginOutput(token);
    }
}

export interface ILoginOutputBoundary {
    success(data: LoginOutput): void;

    errorUserNotFound(email: Email): void;

    errorForbidden(): void;

    errorIncorrectPassword(): void;
}
