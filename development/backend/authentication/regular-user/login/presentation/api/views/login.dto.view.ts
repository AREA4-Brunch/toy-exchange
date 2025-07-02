import express from 'express';
import {
    ILoginView,
    LoginForbiddenViewModel,
    LoginIncorrectPasswordViewModel,
    LoginNotFoundViewModel,
    LoginSuccessViewModel,
} from '../../../infrastructure/ports/presenters/login.view.interface';

/**
 * Humble object part of the True Humble Object pattern between view and
 * presenter.
 */
export class LoginDtoView implements ILoginView {
    constructor(private readonly outlet: express.Response<TDtoPayload>) {}

    public setSuccessData(data: LoginSuccessViewModel): void {
        this.render(new Success(data.token));
    }

    public setUserNotFoundData(data: LoginNotFoundViewModel): void {
        this.render(new InvalidCredentials(data.message));
    }

    public setIncorrectPasswordData(
        data: LoginIncorrectPasswordViewModel,
    ): void {
        this.render(new InvalidCredentials(data.message));
    }

    public setForbiddenData(data: LoginForbiddenViewModel): void {
        this.render(new Forbidden(data.message));
    }

    private render(dto: Dto): void {
        this.outlet.status(dto.httpStatus).json(dto.payload);
    }
}

// used classes and strict typed everything for sense of completeness:

interface Dto {
    httpStatus: number;
    payload: TDtoPayload;
}

type TDtoPayload =
    | Success['payload']
    | InvalidCredentials['payload']
    | Forbidden['payload'];

class Success implements Dto {
    public readonly httpStatus: number = 200;
    public readonly payload: {
        status: 'success';
        token: string;
    };

    constructor(token: string) {
        this.payload = {
            status: 'success',
            token,
        };
    }
}

// possible not to combine into a single view class, saying that as I wish to
// emphasize that such decision was delayed all the way up to the view, and was
// not done in the presenter pkg or earlier, in accordance with the principles
class InvalidCredentials implements Dto {
    public readonly httpStatus: number = 401;
    public readonly payload: {
        status: 'failure';
        message: string;
    };

    constructor(message: string) {
        this.payload = {
            status: 'failure',
            message,
        };
    }
}

class Forbidden implements Dto {
    public readonly httpStatus: number = 403;
    public readonly payload: {
        status: 'failure';
        message: string;
    };

    constructor(message: string) {
        this.payload = {
            status: 'failure',
            message,
        };
    }
}
