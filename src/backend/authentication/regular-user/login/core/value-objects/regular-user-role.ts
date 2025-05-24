import { UserRole } from '../../../../shared/core/value-objects/user-role';

export class RegularUserRole extends UserRole<RegularUserRole.Type> {
    private static readonly registry = new Map<
        RegularUserRole.Type,
        RegularUserRole
    >();

    protected constructor(value: RegularUserRole.Type) {
        super(value);
        this.registerInstance(value, this);
    }

    public static create(role: RegularUserRole.Type): RegularUserRole {
        return RegularUserRole.registry.get(role) ?? new RegularUserRole(role);
    }

    public static fromString(value: string): RegularUserRole {
        const role = RegularUserRole.getRole<RegularUserRole.Type>(
            value,
            RegularUserRole.Type,
        );
        if (role === undefined) {
            throw new Error(`Invalid role: ${value}`);
        }
        return RegularUserRole.create(role);
    }

    protected registerInstance(
        role: RegularUserRole.Type,
        instance: RegularUserRole,
    ): void {
        RegularUserRole.registry.set(role, instance);
    }
}

export namespace RegularUserRole {
    export class Type extends UserRole.Type {}
}
