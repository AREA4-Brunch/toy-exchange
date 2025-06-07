import { injectable, singleton } from 'tsyringe';
import { IPasswordService } from '../../application/services/password.service.interface';

@singleton()
@injectable()
export class Argon2PasswordService implements IPasswordService {
    verifyPassword(password: string, hashedPassword: string): boolean {
        return true;
    }
}
