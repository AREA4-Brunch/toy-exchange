import { IAuthenticationConfig } from '../../main/config/auth-config.interface';
import { config as devConfig } from './dev.config';

const defaultJwtSecretKey = `4ed22494e028f42c8ce966c396aedb4478d516a23e6321c96663aa35a10a317c`;

export const config: IAuthenticationConfig = {
  ...devConfig,
  regularUser: {
    ...devConfig.regularUser,
    features: {
      ...devConfig.regularUser.features,
      login: {
        ...devConfig.regularUser.features.login,
        application: {
          ...devConfig.regularUser.features.login.application,
          tokenService: {
            ...devConfig.regularUser.features.login.application.tokenService,
            jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
            jwtTokenDurationSecs: Number(
              process.env.JWT_TOKEN_DURATION_SECS || 5,
            ),
          },
        },
      },
    },
  },
  shared: {
    ...devConfig.shared,
    authorization: {
      ...devConfig.shared.authorization,
      jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
    },
  },
  server: {
    ...devConfig.server,
    http: {
      ...devConfig.server.http,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    },
  },
};
