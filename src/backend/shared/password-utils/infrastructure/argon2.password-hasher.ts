import * as argon2 from 'argon2';

export interface IArgon2PasswordHasherConfig {
    type: any;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
    hashLength: number;
}

const DEFAULT: IArgon2PasswordHasherConfig = {
    type: argon2.argon2id,
    memoryCost: 262144,
    timeCost: 1,
    parallelism: 2,
    hashLength: 32,
};

export class Argon2PasswordHasher {
    constructor(private readonly config: IArgon2PasswordHasherConfig) {
        this.config.type = this.config.type || DEFAULT.type;
        this.config.memoryCost = this.config.memoryCost || DEFAULT.memoryCost;
        this.config.timeCost = this.config.timeCost || DEFAULT.timeCost;
        this.config.parallelism =
            this.config.parallelism || DEFAULT.parallelism;
        this.config.hashLength = this.config.hashLength || DEFAULT.hashLength;
    }

    async hashPassword(
        password: string,
        config?: IArgon2PasswordHasherConfig,
    ): Promise<string> {
        return await argon2.hash(password, config || this.config);
    }
}
