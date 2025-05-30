import 'reflect-metadata';
import { TokenService } from '../login/application/services/token.service';

const jwtSecretKey = TokenService.generateJwtSecretKey();
console.log(`Newly generated JWT secret key: ${jwtSecretKey}`);
