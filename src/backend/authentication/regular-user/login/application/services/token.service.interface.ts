export interface ITokenService {
    generateAuthToken(email: string, roles: string[]): [string, string];
}
