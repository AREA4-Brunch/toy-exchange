import { findStaticStringProperty } from '../common/class-utils';
import { IComparable } from '../common/comparable.interface';
import { ValueObject } from './value-object.base';

export abstract class UserRole<TValue extends UserRole.Type>
    extends ValueObject<TValue>
    implements IComparable<TValue>
{
    /**
     * Invokes findByValue on given roleType class and returns the result cast.
     */
    protected static getRole<TValue extends UserRole.Type>(
        value: string,
        roleType: any = UserRole.Type,
    ): TValue | undefined {
        return roleType.findByValue(value, roleType) as TValue | undefined;
    }

    protected constructor(value: TValue) {
        super(value);
        this.registerInstance(value, this);
    }

    public override equals(other?: ValueObject<TValue> | TValue): boolean {
        if (other === null || other === undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        return other instanceof UserRole
            ? this.value === other.value
            : this.value === other;
    }

    public toString(): string {
        return String(this.value);
    }

    protected abstract registerInstance(
        value: TValue,
        instance: UserRole<TValue>,
    ): void;
}

export namespace UserRole {
    export class Type {
        public static findByValue(
            value: string,
            typeClass?: any,
        ): Type | undefined {
            return findStaticStringProperty(typeClass || this, value) as
                | Type
                | undefined;
        }

        public static readonly BLOCKED: string = 'BLOCKED';
        public static readonly UNVERIFIED: string = 'UNVERIFIED';
    }
}
