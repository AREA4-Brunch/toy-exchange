import {
  IAuthenticationConfig,
  ISharedConfig,
} from '../../main/config/auth-config.interface';
import { IHealthConfig } from '../../regular-user/health/main/config/health-config.interface';
import { ILoginConfig } from '../../regular-user/login/main/config/login-config.interface';
import { IRegularUserConfig } from '../../regular-user/main/config/app-config.interface';

const loginConfig: ILoginConfig = {
  core: {},
  application: {
    tokenService: {
      jwtSecretKey:
        process.env.JWT_SECRET_KEY
        || `07885db471baa1ce5672c7843e309818cfe43cbaadc76133c21213d98fc8c3d3`,
      jwtTokenDurationSecs: Number(process.env.JWT_TOKEN_DURATION_SECS || 3600),
    },
  },
  infrastructure: {
    api: {
      routes: {
        apiBasePath: '/login',
        staticBasePath: '/static',
        staticContents: [],
      },
      middleware: {},
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
      logLevel: 'detailed',
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
};

export const config: IAuthenticationConfig = {
  server: {
    http: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      hostname: process.env.HOSTNAME || 'localhost',
    },
  },
  api: {
    basePath: '/api/v1/auth',
  },
  regularUser: regularUserConfig,
  shared: sharedConfig,
};
