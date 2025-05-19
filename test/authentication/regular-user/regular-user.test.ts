import { beforeEach, describe, expect, it } from 'vitest';
import {
    IRegularUserProps,
    RegularUser,
    RegularUserId,
} from '../../../src/backend/authentication/regular-user/core/entities/regular-user';
import { RegularUserRole } from '../../../src/backend/authentication/regular-user/core/value-objects/regular-user-role';
import { Email } from '../../../src/backend/authentication/shared/core/value-objects/email';
import { UserRole } from '../../../src/backend/authentication/shared/core/value-objects/user-role';

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
            roles: [RegularUserRole.create(RegularUserRole.Type.UNVERIFIED)],
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

            // should be a different array instance
            expect(roles).not.toBe(userProps.roles);

            // but with the same content
            expect(roles).toHaveLength(1);
            expect(roles[0].value).toEqual(RegularUserRole.Type.UNVERIFIED);
        });
    });

    describe('roles', () => {
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
            userProps.roles = [RegularUserRole.create(RegularUserRole.Type.BLOCKED)];
            const user = new RegularUser(userId, userProps);
            expect(user.isNotBanned()).toBe(false);
        });
    });

    describe('RegularUserRole', () => {
        it(`${ID++}. should create a role from a valid string`, () => {
            const role = RegularUserRole.fromString('BLOCKED');
            expect(role.value).toBe(RegularUserRole.Type.BLOCKED);
        });

        it(`${ID++}. should create a role from a valid role type`, () => {
            const role = RegularUserRole.create(RegularUserRole.Type.BLOCKED);
            expect(role.value).toBe(RegularUserRole.Type.BLOCKED);
        });

        it(`${ID++}. should throw an error for invalid role string`, () => {
            const invalid_role = 'INVALID_ROLE';
            expect(() => {
                RegularUserRole.fromString(invalid_role);
            }).toThrow(`Invalid role: ${invalid_role}`);
        });

        it(`${ID++}. should return the same instance for the same role (flyweight pattern)`, () => {
            const role1 = RegularUserRole.create(RegularUserRole.Type.BLOCKED);
            const role2 = RegularUserRole.create(RegularUserRole.Type.BLOCKED);
            expect(role1).toBe(role2); // Same instance, not just equal
        });

        it(`${ID++}. should ensure roles created from string and enum are the same instance`, () => {
            const role1 = RegularUserRole.create(RegularUserRole.Type.BLOCKED);
            const role2 = RegularUserRole.fromString('BLOCKED');
            expect(role1).toBe(role2); // Same instance
        });

        it(`${ID++}. should properly handle includes check with flyweight instances`, () => {
            const blockedRole = RegularUserRole.create(RegularUserRole.Type.BLOCKED);
            const unverifiedRole = RegularUserRole.create(RegularUserRole.Type.UNVERIFIED);

            const roles = [blockedRole];

            // should work with Array.includes() because of flyweight pattern
            expect(roles.includes(blockedRole)).toBe(true);
            expect(roles.includes(unverifiedRole)).toBe(false);

            // creating new instances with the same value should work too
            expect(roles.includes(RegularUserRole.create(RegularUserRole.Type.BLOCKED))).toBe(true);
        });

        it(`${ID++}. should inherit base role types from UserRole`, () => {
            // ensure that RegularUserRole.Type inherits from UserRole.Type
            expect(RegularUserRole.Type.BLOCKED).toBe(UserRole.Type.BLOCKED);
            expect(RegularUserRole.Type.UNVERIFIED).toBe(UserRole.Type.UNVERIFIED);
        });

        it(`${ID++}. should convert to string representation correctly`, () => {
            const role = RegularUserRole.create(RegularUserRole.Type.BLOCKED);
            expect(role.toString()).toBe('BLOCKED');
        });
    });

    describe('User with multiple roles', () => {
        it(`${ID++}. should handle multiple roles correctly`, () => {
            userProps.roles = [
                RegularUserRole.create(RegularUserRole.Type.UNVERIFIED),
                RegularUserRole.create(RegularUserRole.Type.BLOCKED),
            ];

            const user = new RegularUser(userId, userProps);

            expect(user.isVerified()).toBe(false);
            expect(user.isNotBanned()).toBe(false);
        });
    });
});
