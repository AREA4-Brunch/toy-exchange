import { IAuthenticationConfig } from '../../main/config/auth.config.interface';
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
        infrastructure: {
          ...devConfig.regularUser.features.login.infrastructure,
          tokenService: {
            ...devConfig.regularUser.features.login.infrastructure.tokenService,
            jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
            jwtTokenDurationSecs: Number(
              process.env.JWT_TOKEN_DURATION_SECS || 60 * 60,
            ),
          },
        },
      },
      health: {
        ...devConfig.regularUser.features.health,
        infrastructure: {
          ...devConfig.regularUser.features.health.infrastructure,
          api: {
            ...devConfig.regularUser.features.health.infrastructure.api,
            routes: {
              ...devConfig.regularUser.features.health.infrastructure.api
                .routes,
              testEnabled: true,
            },
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
      port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3001,
    },
  },
};
