import { Entity, TimestampedProps } from '../../shared/entities/entity.base.ts';
import { UserId } from '../../shared/value-objects/user-id.ts';
import { Email } from '../../shared/value-objects/email.ts';
import { RegularUserRole } from '../value-objects/regular-user-role.ts';

export class RegularUserId extends UserId {}

export interface RegularUserProps extends TimestampedProps {
    email: Email;
    password: string;
    username: string;
    roles: RegularUserRole[];
}

export class RegularUser extends Entity<RegularUserId, RegularUserProps> {
    constructor(id: RegularUserId, props: RegularUserProps) {
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

    public get roles(): RegularUserRole[] {
        return [...this.props.roles];
    }

    public isNotBanned(): boolean {
        return !this.roles.some((role) =>
            role.equals(RegularUserRole.Type.BLOCKED),
        );
    }
}
