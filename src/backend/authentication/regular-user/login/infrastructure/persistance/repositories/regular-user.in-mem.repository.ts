import { injectable, singleton } from 'tsyringe';
import {
    IFindLoginData,
    IRegularUserRepository,
} from '../../../application/repositories/regular-user.repository.interface';
import { RegularUserInMemoryMapper } from '../mappers/regular-user.in-mem.mapper';
import { IRegularUserInMemoryModel } from '../models/regular-user.in-mem.model';
import { InMemoryQueryBuilder } from './query-builder.in-mem';

/**
 * @internal - This exists for testing purposes only.
 */
@injectable()
@singleton()
export class RegularUserInMemoryRepo implements IRegularUserRepository {
    private readonly db: IRegularUserInMemoryModel[] = [];

    constructor(private readonly mapper: RegularUserInMemoryMapper) {
        this.db = this.initDB();
    }

    public findLoginData(email: string): IFindLoginData | undefined {
        const data = this.query()
            .select('password', 'roles')
            .where({ email })
            .first();
        return data ? this.mapper.toLoginData(data) : undefined;
    }

    private initDB(): IRegularUserInMemoryModel[] {
        return [
            {
                email: 'test@test.com',
                roles: ['test'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'no-role@test.com',
                roles: [],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'test-some-2@test.com',
                roles: ['test', 'test-some-2'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'multiple-roles@test.com',
                roles: ['test', 'test-some-1', 'test-1', 'test-none-2'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
        ];
    }

    private query(): InMemoryQueryBuilder<IRegularUserInMemoryModel, never> {
        return InMemoryQueryBuilder.create<IRegularUserInMemoryModel>(this.db);
    }
}
