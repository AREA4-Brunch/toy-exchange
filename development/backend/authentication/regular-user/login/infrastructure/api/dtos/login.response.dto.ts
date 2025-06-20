import { ILoginOutput } from '../../../application/ports/use-cases/login.use-case.interface';

export interface ILoginResponseSuccessDto {
    success: boolean;
    data: ILoginOutput;
}

export interface ILoginResponseErrorDto {
    success: boolean;
    message: string;
}

export type ILoginResponseDto =
    | ILoginResponseSuccessDto
    | ILoginResponseErrorDto;
