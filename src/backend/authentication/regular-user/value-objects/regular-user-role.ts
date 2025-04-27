import { IComparable } from '../../shared/common/comparable.interface.ts';
import { ValueObject } from '../../shared/value-objects/value-object.base.ts';

export class RegularUserRole
    extends ValueObject<RegularUserRole.Type>
    implements IComparable<RegularUserRole.Type>
{
    private static readonly registry: Map<
        RegularUserRole.Type,
        RegularUserRole
    > = (() => {
        const roles = Object.values(RegularUserRole.Type).map((role) => {
            return [role, new RegularUserRole(role)] as [
                RegularUserRole.Type,
                RegularUserRole,
            ];
        });
        return new Map(roles);
    })();

    protected constructor(value: RegularUserRole.Type) {
        super(value);
    }

    public static create(value: RegularUserRole.Type): RegularUserRole {
        return this.registry.get(value)!;
    }

    public static fromString(value: string): RegularUserRole {
        const role = RegularUserRole.getRole(value);
        if (role === undefined) {
            throw new Error(`Invalid role: ${value}`);
        }
        return this.registry.get(role)!;
    }

    public equals(other?: RegularUserRole.Type | RegularUserRole): boolean {
        if (other instanceof RegularUserRole) {
            return super.equals(other);
        }
        return other !== undefined && other !== null && this.value === other;
    }

    public toString(): string {
        return this.value;
    }

    private static getRole(value: string): RegularUserRole.Type | undefined {
        return Object.values(RegularUserRole.Type).find(
            (role) => role === value,
        ) as RegularUserRole.Type;
    }
}

export namespace RegularUserRole {
    export enum Type {
        BLOCKED = 'BLOCKED',
        UNVERIFIED = 'UNVERIFIED',
    }
}
