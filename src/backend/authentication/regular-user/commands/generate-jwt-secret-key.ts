import 'reflect-metadata';
import { TokenService } from '../login/infrastructure/services/token.service';

if (require.main === module) {
    const jwtSecretKey = TokenService.generateJwtSecretKey();
    console.log(`Newly generated JWT secret key: ${jwtSecretKey}`);
}
