import { Identifier } from './identifier';
import * as uuid from 'uuid';

export class UserId extends Identifier<string> {
    public constructor(value: string) {
        super(value);
    }

    public static create(): UserId {
        return new UserId(uuid.v4());
    }
}
