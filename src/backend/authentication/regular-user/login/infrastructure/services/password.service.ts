import { injectable, singleton } from 'tsyringe';
import { IPasswordService } from '../../application/services/password.service.interface';

@singleton()
@injectable()
export class PasswordService implements IPasswordService {}
