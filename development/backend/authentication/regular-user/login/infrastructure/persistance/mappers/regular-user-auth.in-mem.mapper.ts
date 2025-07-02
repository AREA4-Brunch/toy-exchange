import { injectable, singleton } from 'tsyringe';
import { IFindLoginData } from '../../../application/ports/repositories/regular-user-auth.repository.interface';
import { RegularUserRole } from '../../../core/value-objects/regular-user-role';
import { IRegularUserAuthInMemoryModel } from '../models/regular-user-auth.in-mem.model';

/**
 * @internal - This exists for testing purposes only.
 */
@singleton()
@injectable()
export class RegularUserAuthInMemoryMapper {
    toLoginData(
        dto: Pick<IRegularUserAuthInMemoryModel, 'password' | 'roles'>,
    ): IFindLoginData {
        return {
            password: dto.password,
            roles: dto.roles.map((role) =>
                RegularUserRole.createFromString(role),
            ),
        } as IFindLoginData;
    }
}
