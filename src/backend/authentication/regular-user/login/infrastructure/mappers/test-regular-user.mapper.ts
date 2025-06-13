import { injectable, singleton } from 'tsyringe';
import { IFindLoginData } from '../../application/repositories/regular-user.repository.interface';
import { RegularUserRole } from '../../core/value-objects/regular-user-role';
import { ITestRegularUserRepoDto } from '../repositories/test-regular-user.repository';

@singleton()
@injectable()
export class TestRegularUserMapper {
    toLoginData(
        dto: Pick<ITestRegularUserRepoDto, 'password' | 'roles'>,
    ): IFindLoginData {
        return {
            password: dto.password,
            roles: dto.roles.map((role) => RegularUserRole.create(role)),
        } as IFindLoginData;
    }
}
