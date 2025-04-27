import { ValueObject } from './value-object.base.ts';

export class Identifier<T> extends ValueObject<T> {
    constructor(value: T) {
        super(value);
    }
}
