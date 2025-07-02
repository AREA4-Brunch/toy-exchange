import { Email } from '../../../../../shared/core/value-objects/email';
import { RegularUserRole } from '../../../core/value-objects/regular-user-role';

export interface IFindLoginData {
    password: string; // hashed
    roles: RegularUserRole[];
}

export interface IRegularUserAuthRepository {
    findUsrLoginData(
        email: Email,
    ): (IFindLoginData | undefined) | (Promise<IFindLoginData> | undefined);
}
