import {
    Argon2PasswordHasher,
    IArgon2PasswordHasherConfig,
} from '../infrastructure/argon2.password-hasher';

const defaultConfig = {} as IArgon2PasswordHasherConfig;

const main = async () => {
    const pwd = process.argv[2];
    if (!pwd) {
        console.error('Please provide a password to hash.');
        process.exit(1);
    }
    const hashed = await new Argon2PasswordHasher(defaultConfig).hashPassword(
        pwd,
    );
    console.log(`${hashed}`);
};

if (require.main === module) {
    main();
}
