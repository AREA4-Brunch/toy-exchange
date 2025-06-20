/**
 * @internal - This exists for testing purposes only.
 */
export interface IRegularUserInMemoryModel {
    roles: string[];
    email: string;
    password: string; // hashed
}
