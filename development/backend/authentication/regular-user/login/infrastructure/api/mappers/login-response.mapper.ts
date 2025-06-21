import express from 'express';
import { injectable, singleton } from 'tsyringe';
import { InvalidEmailError } from '../../../../../shared/core/value-objects/email';
import {
    ILoginOutput,
    LoginForbiddenError,
    LoginIncorrectPasswordError,
    LoginUseCaseErrors,
    LoginUserNotFoundError,
} from '../../../application/ports/use-cases/login.use-case.interface';
import {
    ILoginResponseErrorDto,
    ILoginResponseSuccessDto,
} from '../dtos/login.response.dto';

@singleton()
@injectable()
export class LoginResponseMapper {
    /**
     * Sets up the given response and returns data to be sent via res.json()
     */
    public success(
        res: express.Response,
        data: ILoginOutput,
    ): ILoginResponseSuccessDto {
        res.status(200);
        return { success: true, data } as ILoginResponseSuccessDto;
    }

    /**
     * Sets up the given response and returns data to be sent via res.json()
     */
    public loginError(
        res: express.Response,
        err: LoginUseCaseErrors,
    ): ILoginResponseErrorDto {
        const mapping = LoginResponseMapper.loginErrMap[err.constructor.name];
        if (!mapping) {
            // should never happen
            throw new Error(
                `Unknown domain error passed to ${this.constructor.name}`,
            );
        }

        res.status(mapping.status);
        return {
            success: false,
            message: mapping.message,
        } as ILoginResponseErrorDto;
    }

    /**
     * Sets up the given response and returns data to be sent via res.json()
     * Handles errors occurred during request DTO to use case input mapping.
     */
    public invalidInput(res: express.Response, err: InvalidEmailError) {
        const mapping =
            LoginResponseMapper.invalidInputErrMap[err.constructor.name];
        if (!mapping) {
            // should never happen
            throw new Error(
                `Unknown invalid input error passed to ${this.constructor.name}`,
            );
        }

        const { status, message } = mapping(err);
        res.status(status);
        return { success: false, message } as ILoginResponseErrorDto;
    }

    private static readonly loginErrMap = {
        [LoginUserNotFoundError.name]: {
            status: 401,
            message: 'Wrong username or password.',
        },
        [LoginIncorrectPasswordError.name]: {
            status: 401,
            message: 'Wrong username or password.',
        },
        [LoginForbiddenError.name]: {
            status: 403,
            message: 'Forbidden to login due to having been banned.',
        },
    } as const;

    private static readonly invalidInputErrMap = {
        [InvalidEmailError.name]: (err: InvalidEmailError) => {
            return {
                status: 400,
                message: err.message,
            };
        },
    } as const;
}
