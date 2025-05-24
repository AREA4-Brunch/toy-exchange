import { IApiConfig, ITestConfig } from '../shared/config';

const api: IApiConfig = {
    endpoint: `http://${process.env.HOSTNAME}:${process.env.PORT}`,
    authentication: {
        endpoint: '/api/v1/auth',
        regularUser: {
            endpoint: '/regular-user',
            health: {
                endpoint: '/health',
                method: 'GET',
            },
            login: {
                endpoint: '/login',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            },
        },
    },
};

export const config: ITestConfig = {
    api: api,
};
