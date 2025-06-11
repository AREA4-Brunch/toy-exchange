import * as argon2 from 'argon2';

export interface IArgon2PasswordServiceConfig {
    type: any;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    hashLength: number;
}

export class Argon2PasswordHasher {
    constructor(private readonly config: IArgon2PasswordServiceConfig) {
        this.config.type = this.config.type || argon2.argon2id;
        this.config.memoryCost = this.config.memoryCost || 2 ^ 24; // 16MB
        this.config.timeCost = this.config.timeCost || 2; // 2 iterations
        this.config.parallelism = this.config.parallelism || 1; // 1 thread
        this.config.hashLength = this.config.hashLength || 32; // 32 bytes
    }

    async hashPassword(
        password: string,
        config?: IArgon2PasswordServiceConfig,
    ): Promise<string> {
        return await argon2.hash(password, config || this.config);
    }
}
