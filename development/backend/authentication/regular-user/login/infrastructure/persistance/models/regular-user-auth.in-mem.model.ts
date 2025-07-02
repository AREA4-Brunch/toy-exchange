/**
 * @internal - This exists for testing purposes only.
 */
export interface IRegularUserAuthInMemoryModel {
    roles: string[];
    email: string;
    password: string; // hashed
}
