import { ILoginOutput } from '../../../application/ports/use-cases/login.use-case.interface';

export interface ILoginResponseSuccessDto {
    readonly success: true;
    data: ILoginOutput;
}

export interface ILoginResponseErrorDto {
    readonly success: false;
    message: string;
}

export type ILoginResponseDto =
    | ILoginResponseSuccessDto
    | ILoginResponseErrorDto;
