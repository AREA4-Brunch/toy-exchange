import { injectable, singleton } from 'tsyringe';
import { RegularUser } from '../../core/entities/regular-user';
import { ITestRegularUserRepoDto } from '../repositories/test-regular-user.repository';

@singleton()
@injectable()
export class TestRegularUserMapper {
    toRepoDto(user: RegularUser): ITestRegularUserRepoDto {
        return {} as ITestRegularUserRepoDto;
    }

    toEntity(dto: ITestRegularUserRepoDto): RegularUser {
        return {} as RegularUser;
    }
}
