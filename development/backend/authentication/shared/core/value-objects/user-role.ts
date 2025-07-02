import { ValueObject } from './value-object.base';

export interface IUserRole<TValue extends string> extends ValueObject<TValue> {}

export abstract class UserRole<TValue extends string>
    extends ValueObject<TValue>
    implements IUserRole<TValue>
{
    protected constructor(value: TValue) {
        super(value);
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
}

export const _TUserRole = ['banned', 'unverified'] as const;
export type TUserRole = (typeof _TUserRole)[number];
