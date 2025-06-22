import { ILoginOutput } from '../../../application/ports/use-cases/login.use-case.interface';

export interface ILoginResponseSuccessDto {
    readonly status: 'success';
    data: ILoginOutput;
}

export interface ILoginResponseErrorDto {
    readonly status: 'failure';
    message: string;
}

export type ILoginResponseDto =
    | ILoginResponseSuccessDto
    | ILoginResponseErrorDto;
