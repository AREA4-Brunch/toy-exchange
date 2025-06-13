import { Email } from '../value-objects/email';
import { UserId } from '../value-objects/user-id';
import {
    DomainEntity,
    IDomainEntity,
    IDomainEntityProps,
} from './domain-entity.base';

export interface IUserProps extends IDomainEntityProps {
    email: Email;
    password: string;
    username: string;
}

export interface IUser extends IDomainEntity<UserId> {
    email: Email;
    password: string;
    username: string;

    isNotBanned(): boolean;
    isVerified(): boolean;
}

export abstract class User<TProps extends IUserProps>
    extends DomainEntity<UserId, TProps>
    implements IUser
{
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
