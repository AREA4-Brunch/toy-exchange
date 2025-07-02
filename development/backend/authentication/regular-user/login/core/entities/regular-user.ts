import {
    IUser,
    IUserProps,
    User,
} from '../../../../shared/core/entities/user.base';
import { UserId } from '../../../../shared/core/value-objects/user-id';
import { RegularUserRole } from '../value-objects/regular-user-role';

export class RegularUserId extends UserId {}

export interface IRegularUserProps extends IUserProps {
    roles: RegularUserRole[];
}

export interface IRegularUser extends IUser {
    roles: RegularUserRole[];
}

export class RegularUser
    extends User<IRegularUserProps>
    implements IRegularUser
{
    constructor(id: RegularUserId, props: IRegularUserProps) {
        super(id, props);
    }

    public get roles(): RegularUserRole[] {
        return [...this.props.roles];
    }

    public isNotBanned(): boolean {
        return !this.roles.includes(RegularUserRole.create('banned'));
    }

    public isVerified(): boolean {
        return !this.roles.includes(RegularUserRole.create('unverified'));
    }
}
