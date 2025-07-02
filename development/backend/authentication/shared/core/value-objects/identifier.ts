import { ValueObject } from './value-object.base';

export class Identifier<T> extends ValueObject<T> {
    constructor(value: T) {
        super(value);
    }
}
