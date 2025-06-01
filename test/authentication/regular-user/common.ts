export const generateTestCredentials = () => {
    return {
        email: 'test@test.com',
        password: 'password123',
        // roles: ['test'],
    };
};

export const generateTestCredentialsNoRoles = () => {
    return {
        email: 'no-role@test.com',
        password: 'password123',
        // roles: [],
    };
};

export const generateTestCredentialsSomeRole = () => {
    return {
        email: 'test-some-2@test.com',
        password: 'password123',
        // roles: ['test', 'test-some-2'],
    };
};

export const generateTestCredentialsMultipleRoles = () => {
    return {
        email: 'multiple-roles@test.com',
        password: 'password123',
        // roles: ['test', 'test-some-1', 'test-1', 'test-none-2'],
    };
};
