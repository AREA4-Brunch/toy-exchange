export const generateTestCredentials = () => {
    return {
        email: 'test@test.com',
        password: 'password123',
        // roles: ['test'],
    };
};

export const generateNoRoleCredentials = () => {
    return {
        email: 'no-role@test.com',
        password: 'password123',
        // roles: [],
    };
};

export const generateSomeRoleCredentials = () => {
    return {
        email: 'test-some-2@test.com',
        password: 'password123',
        // roles: ['test', 'test-some-2'],
    };
};

export const generateMultipleRoleCredentials = () => {
    return {
        email: 'multiple-roles@test.com',
        password: 'password123',
        // roles: ['test', 'test-some-1', 'test-1', 'test-none-2'],
    };
};

export const generateAdminCredentials = () => {
    return {
        email: 'admin@test.com',
        password: 'password123',
        // roles: ['test-admin'],
    };
};

export const generateSuperAdminCredentials = () => {
    return {
        email: 'super-admin@test.com',
        password: 'password123',
        // roles: ['test-admin', 'test-super-admin'],
    };
};

export const generateModeratorCredentials = () => {
    return {
        email: 'moderator@test.com',
        password: 'password123',
        // roles: ['test-moderator'],
    };
};

export const generateBannedUserCredentials = () => {
    return {
        email: 'banned@test.com',
        password: 'password123',
        // roles: ['regular-user', 'banned'],
    };
};

export const generateModeratorAdminCredentials = () => {
    return {
        email: 'moderator-admin@test.com',
        password: 'password123',
        // roles: ['test-moderator', 'test-admin'],
    };
};

export const generateSuspendedUserCredentials = () => {
    return {
        email: 'suspended@test.com',
        password: 'password123',
        // roles: ['regular-user', 'test-suspended'],
    };
};
