import {
    Entity,
    ITimestampedProps,
} from '../../shared/entities/entity.base.ts';
import { Email } from '../../shared/value-objects/email.ts';
import { UserId } from '../value-objects/user-id.ts';

export interface IUserProps extends ITimestampedProps {
    email: Email;
    password: string;
    username: string;
}

export abstract class User<TProps extends IUserProps> extends Entity<
    UserId,
    TProps
> {
    constructor(id: UserId, props: TProps) {
        super(id, props);
    }

    public get email(): Email {
        return this.props.email;
    }

    public get password(): string {
        return this.props.password;
    }

    public get username(): string {
        return this.props.username;
    }

    public abstract isNotBanned(): boolean;

    public abstract isVerified(): boolean;
}
