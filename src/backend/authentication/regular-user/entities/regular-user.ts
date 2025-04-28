import { UserId } from '../../shared/value-objects/user-id.ts';
import { RegularUserRole } from '../value-objects/regular-user-role.ts';
import { IUserProps, User } from '../../shared/entities/user.base.ts';

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
