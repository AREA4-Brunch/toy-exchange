import { injectable, singleton } from 'tsyringe';
import { RegularUserRole } from '../../core/value-objects/regular-user-role';

@singleton()
@injectable()
export class LoginEligibilityService {
    public isForbidden(roles: RegularUserRole[]): boolean {
        return roles.includes(RegularUserRole.create('banned'));
    }
}
