import { IValueObject } from './value-object.interface';

export abstract class ValueObject<T> implements IValueObject<T> {
    protected constructor(public readonly value: T) {}

    public equals(other?: ValueObject<T>): boolean {
        if (other === null || other === undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof this.constructor)) {
            return false;
        }
        return this.value === other.value;
    }
}
