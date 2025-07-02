import {
  IAuthenticationConfig,
  ISharedConfig,
} from '../../main/config/authentication.config.interface';
import { IHealthConfig } from '../../regular-user/health/main/config/health.config.interface';
import { ILoginConfig } from '../../regular-user/login/main/config/login.config.interface';
import { IRegularUserConfig } from '../../regular-user/main/config/regular-user.config.interface';

const defaultJwtSecretKey = `1151ed58911dd2acdaedfc6e4d3e681d522574ca41a65c89d04912c2afeb67b3`;

const loginConfig: ILoginConfig = {
  core: {},
  application: {},
  infrastructure: {
    tokenService: {
      jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
      jwtTokenDurationSecs: Number(process.env.JWT_TOKEN_DURATION_SECS || 3600),
    },
  },
  presentation: {
    api: {
      routes: {
        loginBasePath: '/login',
      },
      middleware: {},
    },
  },
};

const healthConfig: IHealthConfig = {
  presentation: {
    api: {
      routes: {
        healthBasePath: '/health',
        testEnabled: false,
        testRoleCheckingPath: '/health-test',
      },
    },
  },
};

const regularUserConfig: IRegularUserConfig = {
  presentation: {
    api: {
      basePath: '/regular-user',
    },
  },
  features: {
    login: loginConfig,
    health: healthConfig,
  },
};

const sharedConfig: ISharedConfig = {
  authorization: {
    jwtSecretKey: process.env.JWT_SECRET_KEY || defaultJwtSecretKey,
  },
  presentation: {
    api: {
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
    },
  },
};

export default {
  server: {
    http: {
      port: process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000,
      hostname: process.env.APP_HOSTNAME || '0.0.0.0',
    },
  },
  presentation: {
    api: {
      basePath: '/api/v1/auth',
    },
  },
  features: {
    regularUser: regularUserConfig,
  },
  shared: sharedConfig,
} as IAuthenticationConfig;
