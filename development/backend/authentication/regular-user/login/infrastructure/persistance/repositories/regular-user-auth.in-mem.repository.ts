import { injectable, singleton } from 'tsyringe';
import {
    IFindLoginData,
    IRegularUserAuthRepository,
} from '../../../application/ports/repositories/regular-user-auth.repository.interface';
import { RegularUserAuthInMemoryMapper } from '../mappers/regular-user-auth.in-mem.mapper';
import { IRegularUserAuthInMemoryModel } from '../models/regular-user-auth.in-mem.model';
import { InMemoryQueryBuilder } from './query-builder.in-mem';

/**
 * @internal - This exists for testing purposes only.
 */
@injectable()
@singleton()
export class RegularUserAuthInMemoryRepo implements IRegularUserAuthRepository {
    private readonly db: IRegularUserAuthInMemoryModel[] = [];

    constructor(private readonly mapper: RegularUserAuthInMemoryMapper) {
        this.db = this.initDB();
    }

    public findUsrLoginData(email: string): IFindLoginData | undefined {
        const data = this.query()
            .select('password', 'roles')
            .where({ email })
            .first();
        return data ? this.mapper.toLoginData(data) : undefined;
    }

    private initDB(): IRegularUserAuthInMemoryModel[] {
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
            {
                email: 'admin@test.com',
                roles: ['test-admin'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'super-admin@test.com',
                roles: ['test-admin', 'test-super-admin'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'moderator@test.com',
                roles: ['test-moderator'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'banned@test.com',
                roles: ['regular-user', 'banned'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'moderator-admin@test.com',
                roles: ['test-moderator', 'test-admin'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
            {
                email: 'suspended@test.com',
                roles: ['regular-user', 'test-suspended'],
                // password: 'password123',
                password:
                    '$argon2id$v=19$m=262144,t=1,p=2$z0biLO9xSPTxq5aC+nG4Ew$HWpJD0FOpq0XiastASO160lm5KNjpEcfxrRLu4N2p1E',
            },
        ];
    }

    private query(): InMemoryQueryBuilder<
        IRegularUserAuthInMemoryModel,
        never
    > {
        return InMemoryQueryBuilder.create<IRegularUserAuthInMemoryModel>(
            this.db,
        );
    }
}
