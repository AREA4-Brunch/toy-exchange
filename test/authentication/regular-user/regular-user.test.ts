import { beforeEach, describe, expect, it } from 'vitest';
import {
    IRegularUserProps,
    RegularUser,
    RegularUserId,
} from '../../../development/backend/authentication/regular-user/login/core/entities/regular-user';
import { RegularUserRole } from '../../../development/backend/authentication/regular-user/login/core/value-objects/regular-user-role';
import { Email } from '../../../development/backend/authentication/shared/core/value-objects/email';

describe('RegularUser', () => {
    let userId: RegularUserId;
    let userProps: IRegularUserProps;
    let ID = 1;

    beforeEach(() => {
        userId = RegularUserId.create();
        userProps = {
            email: Email.create('test@example.com'),
            password: 'hashedPassword123',
            username: 'testuser',
            roles: [RegularUserRole.create('unverified')],
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
        };
    });

    describe('creation', () => {
        it(`${ID++}. should create a regular user with expected properties`, () => {
            const user = new RegularUser(userId, userProps);
            expect(user.id).toEqual(userId);
            expect(user.email.equals(Email.create('test@example.com'))).toBe(true);
            expect(user.username).toEqual('testuser');
        });

        it(`${ID++}. should return a copy of roles to prevent mutation`, () => {
            const user = new RegularUser(userId, userProps);
            const roles = user.roles;

            expect(roles).not.toBe(userProps.roles);
            expect(roles).toHaveLength(1);
            expect(roles[0].value).toEqual('unverified');
        });
    });

    describe('user interpreting roles', () => {
        it(`${ID++}. should correctly identify an unverified user`, () => {
            const user = new RegularUser(userId, userProps);
            expect(user.isVerified()).toBe(false);
        });

        it(`${ID++}. should correctly identify a verified user`, () => {
            // remove UNVERIFIED role
            userProps.roles = [];
            const user = new RegularUser(userId, userProps);
            expect(user.isVerified()).toBe(true);
        });

        it(`${ID++}. should correctly identify a non-banned user`, () => {
            const user = new RegularUser(userId, userProps);
            expect(user.isNotBanned()).toBe(true);
        });

        it(`${ID++}. should correctly identify a banned user`, () => {
            userProps.roles = [RegularUserRole.create('banned')];
            const user = new RegularUser(userId, userProps);
            expect(user.isNotBanned()).toBe(false);
        });
    });

    describe('RegularUserRole', () => {
        it(`${ID++}. should create a role from a valid TRegularUserRole`, () => {
            const role = RegularUserRole.create('banned');
            expect(role.value).toBe('banned');
            expect(RegularUserRole.isValidRole('banned')).toBe(true);
        });

        it(`${ID++}. should create a role from a valid test TRegularUserRole`, () => {
            const role = RegularUserRole.create('test');
            expect(role.value).toBe('test');
            expect(RegularUserRole.isValidRole('test')).toBe(true);
        });

        it(`${ID++}. should create a role from a valid string`, () => {
            const role = RegularUserRole.createFromString('banned');
            expect(role.value).toBe('banned');
        });

        it(`${ID++}. should create a role from a valid test string`, () => {
            const role = RegularUserRole.createFromString('test');
            expect(role.value).toBe('test');
        });

        it(`${ID++}. should throw an error for invalid role string`, () => {
            const invalid_role = 'INVALID_ROLE';
            expect(() => {
                RegularUserRole.createFromString(invalid_role);
            }).toThrow(`Invalid role: ${invalid_role}`);
            expect(RegularUserRole.isValidRole(invalid_role)).toBe(false);
        });

        it(`${ID++}. should return the same instance for the same role (flyweight pattern)`, () => {
            const role1 = RegularUserRole.create('banned');
            const role2 = RegularUserRole.create('banned');
            expect(role1).toBe(role2);
        });

        it(`${ID++}. should return the same instance for the same role diff factories (flyweight pattern)`, () => {
            const role1 = RegularUserRole.create('banned');
            const role2 = RegularUserRole.createFromString('banned');
            expect(role1).toBe(role2);
        });

        it(`${ID++}. should properly handle includes check with flyweight instances`, () => {
            const blockedRole = RegularUserRole.create('banned');
            const unverifiedRole = RegularUserRole.create('unverified');

            const roles = [blockedRole];

            expect(roles.includes(blockedRole)).toBe(true);
            expect(roles.includes(unverifiedRole)).toBe(false);
            expect(roles.includes(RegularUserRole.create('banned'))).toBe(true);
        });
    });

    describe('User with multiple roles', () => {
        it(`${ID++}. should handle multiple roles correctly`, () => {
            userProps.roles = [
                RegularUserRole.create('unverified'),
                RegularUserRole.create('banned'),
            ];

            const user = new RegularUser(userId, userProps);

            expect(user.isVerified()).toBe(false);
            expect(user.isNotBanned()).toBe(false);
        });
    });
});
