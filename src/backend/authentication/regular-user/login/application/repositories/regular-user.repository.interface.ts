import { RegularUserRole } from '../../core/value-objects/regular-user-role';

export interface IFindLoginData {
    password: string; // hashed
    roles: RegularUserRole[];
}

export interface IRegularUserRepository {
    findLoginData(
        email: string,
    ): (IFindLoginData | undefined) | (Promise<IFindLoginData> | undefined);
}
