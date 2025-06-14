import 'reflect-metadata';
import { JwtTokenService } from '../login/infrastructure/services/jwt.token.service';

if (require.main === module) {
    const jwtSecretKey = JwtTokenService.generateJwtSecretKey();
    console.log(`Newly generated JWT secret key: ${jwtSecretKey}`);
}
