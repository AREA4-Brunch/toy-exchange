import { IComparable } from '../common/comparable.interface.ts';

export interface IValueObject<T> extends IComparable<IValueObject<T>> {
    readonly value: T;
}
