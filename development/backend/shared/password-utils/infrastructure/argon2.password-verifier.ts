import * as argon2 from 'argon2';
import { IPasswordService as IPwdVerifier } from 'authentication-interfaces/dist/regular-user/login/application/ports/services/password.service.interface';

export class Argon2PasswordVerifier implements IPwdVerifier {
    async verifyPassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        try {
            return await argon2.verify(hashedPassword, password);
        } catch (error) {
            return false;
        }
    }
}
