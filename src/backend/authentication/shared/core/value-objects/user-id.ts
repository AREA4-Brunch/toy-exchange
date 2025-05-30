import { Identifier } from './identifier';

export class UserId extends Identifier<string> {
    protected constructor(value: string) {
        super(value);
    }

    public static create(): UserId {
        return new UserId(crypto.randomUUID());
    }
}
