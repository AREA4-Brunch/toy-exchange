import { UserId } from '../../../shared/core/value-objects/user-id';
import { RegularUserRole } from '../value-objects/regular-user-role';
import { IUserProps, User } from '../../../shared/core/entities/user.base';

export class RegularUserId extends UserId {}

export interface IRegularUserProps extends IUserProps {
    roles: RegularUserRole[];
}

export class RegularUser extends User<IRegularUserProps> {
    constructor(id: RegularUserId, props: IRegularUserProps) {
        super(id, props);
    }

    public get roles(): RegularUserRole[] {
        return [...this.props.roles];
    }

    public isNotBanned(): boolean {
        return !this.roles.includes(
            RegularUserRole.create(RegularUserRole.Type.BLOCKED),
        );
    }

    public isVerified(): boolean {
        return !this.roles.includes(
            RegularUserRole.create(RegularUserRole.Type.UNVERIFIED),
        );
    }
}
