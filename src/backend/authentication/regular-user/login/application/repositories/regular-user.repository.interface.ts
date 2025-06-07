import { RegularUser } from '../../core/entities/regular-user';

export interface IRegularUserRepoDto {}

export interface IRegularUserRepository {
    find(
        criteria: Partial<IRegularUserRepoDto>,
    ): (RegularUser | null) | Promise<RegularUser | null>;
}
