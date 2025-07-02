import { injectable, singleton } from 'tsyringe';
import { RegularUserRole } from '../../core/value-objects/regular-user-role';

// login and its eligibility are an application concern, not domain, so it
// remains in application layer, also in IDDD Vaughn Vernon says address
// transactions and security as application concerns, not in domain layer
// mini services
@singleton()
@injectable()
export class LoginEligibilityService {
    public isForbidden(roles: RegularUserRole[]): boolean {
        return roles.includes(RegularUserRole.create('banned'));
    }
}
