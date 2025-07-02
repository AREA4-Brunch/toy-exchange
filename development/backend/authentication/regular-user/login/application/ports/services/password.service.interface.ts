export interface IPasswordVerifier {
    verifyPassword(
        password: string,
        hashedPassword: string,
    ): boolean | Promise<boolean>;
}
