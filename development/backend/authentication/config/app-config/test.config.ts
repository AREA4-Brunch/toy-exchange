import { IAuthenticationConfig } from '../../main/config/authentication.config.interface';
import prodConfig from './prod.config';

const defaultJwtSecretKey = `4ed22494e028f42c8ce966c396aedb4478d516a23e6321c96663aa35a10a317c`;
const jwtKey = process.env.JWT_SECRET_KEY || defaultJwtSecretKey;

const conf: IAuthenticationConfig = { ...prodConfig };

conf.features.regularUser.features.login.infrastructure.tokenService = {
  ...conf.features.regularUser.features.login.infrastructure.tokenService,
  jwtSecretKey: jwtKey,
  jwtTokenDurationSecs: Number(process.env.JWT_TOKEN_DURATION_SECS || 60 * 60),
};

if (conf.features.regularUser.features.health.presentation.api) {
  conf.features.regularUser.features.health.presentation.api.routes.testEnabled =
    true;
}

conf.shared.authorization.jwtSecretKey = jwtKey;

if (conf.shared.presentation.api) {
  conf.shared.presentation.api.middleware.requestLogging.logLevel = 'debug';
}

conf.server.http.port = process.env.APP_PORT
  ? parseInt(process.env.APP_PORT)
  : 3002;

export default { ...conf };
