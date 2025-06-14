import {
    _TUserRole,
    UserRole,
} from '../../../../shared/core/value-objects/user-role';

const _TRegularUserRole = [..._TUserRole, 'regular-user'] as const;

/**
 * @internal - This exists for testing purposes only.
 */
const _TTestRegularUserRole = [
    ..._TUserRole,
    'test',
    'test-admin',
    'test-1',
    'test-some-1',
    'test-some-2',
    'test-none-1',
    'test-none-2',
    'test-admin',
    'test-super-admin',
    'test-moderator',
    'test-suspended',
] as const;

/** At all times contains both production and testing roles. */
export type TRegularUserRole =
    | (typeof _TRegularUserRole)[number]
    | (typeof _TTestRegularUserRole)[number];

export class RegularUserRole extends UserRole<TRegularUserRole> {
    private static readonly registry = new Map<
        TRegularUserRole,
        RegularUserRole
    >();

    /** At all times contains both production and testing roles. */
    private static readonly validRoles = new Set<TRegularUserRole>([
        ..._TRegularUserRole,
        ..._TTestRegularUserRole,
    ]);

    protected constructor(value: TRegularUserRole) {
        super(value);
        RegularUserRole.registry.set(value, this);
    }

    public static create(role: TRegularUserRole): RegularUserRole {
        return RegularUserRole.registry.get(role) ?? new RegularUserRole(role);
    }

    public static createFromString(role: string): RegularUserRole {
        if (!RegularUserRole.isValidRole(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
        return RegularUserRole.create(role as TRegularUserRole);
    }

    public static isValidRole(role: string): role is TRegularUserRole {
        return RegularUserRole.validRoles.has(role as TRegularUserRole);
    }
}
