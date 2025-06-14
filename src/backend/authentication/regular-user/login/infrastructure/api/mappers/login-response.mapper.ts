import express from 'express';
import { injectable, singleton } from 'tsyringe';
import {
    ILoginOutput,
    LoginIncorrectPasswordError,
    LoginUserNotFoundError,
} from '../../../application/use-cases/login.use-case.interface';
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
    public domainError(
        res: express.Response,
        err: unknown,
    ): ILoginResponseErrorDto {
        if (!(err instanceof Error)) {
            throw err;
        }

        const mapping = LoginResponseMapper.errorMap[err.constructor.name];
        if (!mapping) {
            throw err;
        }

        res.status(mapping.status);
        return {
            success: false,
            message: mapping.message,
        } as ILoginResponseErrorDto;
    }

    private static readonly errorMap = {
        [LoginUserNotFoundError.name]: {
            status: 401,
            message: 'Wrong username or password.',
        },
        [LoginIncorrectPasswordError.name]: {
            status: 401,
            message: 'Wrong username or password.',
        },
    };
}
