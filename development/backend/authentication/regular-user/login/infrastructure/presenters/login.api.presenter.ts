import { Email } from '../../../../shared/core/value-objects/email';
import {
    ILoginOutputBoundary,
    LoginOutput,
} from '../../application/ports/use-cases/login.use-case.output.interface';
import { ILoginView } from '../ports/presenters/login.view.interface';

export class LoginApiPresenter implements ILoginOutputBoundary {
    constructor(private readonly view: ILoginView) {}

    public success(data: LoginOutput): void {
        this.view.setSuccessData({ token: data.token });
    }

    public errorUserNotFound(email: Email): void {
        console.warn(
            `Someone checked if there is a user with email: ${email.value}`,
        );
        // message could be more specific, but higher security since view impl
        // may forget not to leak that given email address has no account
        this.view.setUserNotFoundData({
            message: `Wrong username or password.`,
        });
    }

    public errorIncorrectPassword(): void {
        // message could be more specific, but higher security since view impl
        // may forget not to leak that given email address exists
        this.view.setIncorrectPasswordData({
            message: `Wrong username or password.`,
        });
    }

    public errorForbidden(): void {
        this.view.setForbiddenData({
            message: `Forbidden to login due to having been banned.`,
        });
    }
}
