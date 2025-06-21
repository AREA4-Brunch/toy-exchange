import { injectable, singleton } from 'tsyringe';
import {
    Email,
    InvalidEmailError,
} from '../../../../../shared/core/value-objects/email';
import { Result } from '../../../../../shared/types/result';
import { ILoginInput } from '../../../application/ports/use-cases/login.use-case.interface';
import { TLoginRequestDto } from '../dtos/login.request.dto';

@singleton()
@injectable()
export class LoginRequestMapper {
    toLoginInput(
        dto: TLoginRequestDto,
    ): Result<ILoginInput, InvalidEmailError> {
        return Email.createNoThrow(dto.body.email).map((email) => {
            return { email, password: dto.body.password } as ILoginInput;
        });
    }
}
