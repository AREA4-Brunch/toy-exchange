export interface IPasswordService {
    verifyPassword(
        password: string,
        hashedPassword: string,
    ): boolean | Promise<boolean>;
}
