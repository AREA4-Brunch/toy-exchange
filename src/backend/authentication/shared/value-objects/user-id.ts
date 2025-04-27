import { Identifier } from './identifier.ts';
import * as uuid from 'uuid';

export class UserId extends Identifier<string> {
    protected constructor(value: string) {
        super(value);
    }

    public static create(): UserId {
        return new UserId(uuid.v4());
    }
}
