import { IComparable } from '../common/comparable.interface';

export interface IValueObject<T> extends IComparable<IValueObject<T>> {
    readonly value: T;
}
