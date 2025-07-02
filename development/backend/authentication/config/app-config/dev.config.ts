import { IAuthenticationConfig } from '../../main/config/authentication.config.interface';
import prodConfig from './prod.config';

const defaultJwtSecretKey = `07885db471baa1ce5672c7843e309818cfe43cbaadc76133c21213d98fc8c3d3`;
const jwtKey = process.env.JWT_SECRET_KEY || defaultJwtSecretKey;

const conf: IAuthenticationConfig = { ...prodConfig };

conf.features.regularUser.features.login.infrastructure.tokenService = {
  ...conf.features.regularUser.features.login.infrastructure.tokenService,
  jwtSecretKey: jwtKey,
  jwtTokenDurationSecs: Number(process.env.JWT_TOKEN_DURATION_SECS || 60 * 60),
};

conf.shared.authorization.jwtSecretKey = jwtKey;

conf.server.http.port = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT)
  : 3001;

export default { ...conf };
