import { UserRole } from '../../shared/value-objects/user-role.ts';

export class RegularUserRole extends UserRole<RegularUserRole.Type> {
    private static readonly registry = new Map<
        RegularUserRole.Type,
        RegularUserRole
    >();

    protected constructor(value: RegularUserRole.Type) {
        super(value);
    }

    public static create(role: RegularUserRole.Type): RegularUserRole {
        return RegularUserRole.registry.get(role) ?? new RegularUserRole(role);
    }

    public static fromString(value: string): RegularUserRole {
        const role = RegularUserRole.getRole(value);
        if (role === undefined) {
            throw new Error(`Invalid role: ${value}`);
        }
        return RegularUserRole.create(role);
    }

    private static getRole(value: string): RegularUserRole.Type | undefined {
        return RegularUserRole.Type.findByValue(value, RegularUserRole.Type);
    }

    protected override registerInstance(
        role: RegularUserRole.Type,
        instance: RegularUserRole,
    ): void {
        RegularUserRole.registry.set(role, instance);
    }
}

export namespace RegularUserRole {
    export class Type extends UserRole.Type {}
}
