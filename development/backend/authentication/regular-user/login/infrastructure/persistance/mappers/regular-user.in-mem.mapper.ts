import { injectable, singleton } from 'tsyringe';
import { IFindLoginData } from '../../../application/ports/repositories/regular-user.repository.interface';
import { RegularUserRole } from '../../../core/value-objects/regular-user-role';
import { IRegularUserInMemoryModel } from '../models/regular-user.in-mem.model';

/**
 * @internal - This exists for testing purposes only.
 */
@singleton()
@injectable()
export class RegularUserInMemoryMapper {
    toLoginData(
        dto: Pick<IRegularUserInMemoryModel, 'password' | 'roles'>,
    ): IFindLoginData {
        return {
            password: dto.password,
            roles: dto.roles.map((role) =>
                RegularUserRole.createFromString(role),
            ),
        } as IFindLoginData;
    }
}
