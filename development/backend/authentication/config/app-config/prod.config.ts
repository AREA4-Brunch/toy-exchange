import {
  IAuthenticationConfig,
  ISharedConfig,
} from '../../main/config/auth.config.interface';
import { IHealthConfig } from '../../regular-user/health/main/config/health.config.interface';
import { ILoginConfig } from '../../regular-user/login/main/config/login.config.interface';
import { IRegularUserConfig } from '../../regular-user/main/config/app.config.interface';

const defaultJwtSecretKey = `1151ed58911dd2acdaedfc6e4d3e681d522574ca41a65c89d04912c2afeb67b3`;

const loginConfig: ILoginConfig = {
  core: {},
  application: {},
  infrastructure: {
    api: {
      routes: {
        apiBasePath: '/login',
        staticBasePath: '/static',
        staticContents: [],
      },
      middleware: {},
    },
    tokenService: {
      jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
      jwtTokenDurationSecs: Number(process.env.JWT_TOKEN_DURATION_SECS || 3600),
    },
  },
};

const healthConfig: IHealthConfig = {
  infrastructure: {
    api: {
      routes: {
        apiBasePath: '/health',
        staticBasePath: '/static',
        staticContents: [],
        testEnabled: false,
      },
    },
  },
};

const regularUserConfig: IRegularUserConfig = {
  api: {
    basePath: '/regular-user',
  },
  features: {
    login: loginConfig,
    health: healthConfig,
  },
};

const sharedConfig: ISharedConfig = {
  middleware: {
    sanitization: {
      logger: console,
    },
    requestMetadata: {},
    requestLogging: {
      logger: console,
      logLevel: 'basic',
      fieldsToRedact: ['password', 'token'],
    },
    responseLogging: {
      logger: console,
    },
    errorHandler: {
      logger: console,
    },
    requestValidation: {},
  },
  authorization: {
    jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
  },
};

export const config: IAuthenticationConfig = {
  server: {
    http: {
      port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000,
      hostname: process.env.APP_HOSTNAME || '0.0.0.0',
    },
  },
  api: {
    basePath: '/api/v1/auth',
  },
  regularUser: regularUserConfig,
  shared: sharedConfig,
};
