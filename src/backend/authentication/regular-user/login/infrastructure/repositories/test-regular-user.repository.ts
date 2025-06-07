import { injectable, singleton } from 'tsyringe';
import {
    IRegularUserRepoDto,
    IRegularUserRepository,
} from '../../application/repositories/regular-user.repository.interface';
import { RegularUser } from '../../core/entities/regular-user';
import { TestRegularUserMapper } from '../mappers/test-regular-user.mapper';

export interface ITestRegularUserRepoDto extends IRegularUserRepoDto {}

@injectable()
@singleton()
export class TestRegularUserRepository implements IRegularUserRepository {
    constructor(private readonly mapper: TestRegularUserMapper) {}

    find(criteria: Partial<ITestRegularUserRepoDto>): RegularUser | null {
        return null;
    }
}
