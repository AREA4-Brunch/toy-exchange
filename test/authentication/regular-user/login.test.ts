import axios, { AxiosInstance } from 'axios';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getLoginUrl, IUrl } from '../shared/config-management';
import { generateTestCredentials } from './common';

describe('Login API', () => {
    let api: AxiosInstance;
    let ID = 1;
    let server: any;

    beforeAll(async () => {
        // server = await startTestServer();
        api = axios.create({
            baseURL: ``,
            validateStatus: (status) => true,
        });
    });

    afterAll(async () => {
        if (server) await server.stop();
    });

    describe('Login endpoint', async () => {
        const url: IUrl = await getLoginUrl();

        it(`${ID++}. should process login request`, async () => {
            const loginPayload = generateTestCredentials();
            const response = await api.request({ ...url, data: loginPayload });
            expect(response.status).toBe(200);
        });

        it(`${ID++}. should reject login with missing email`, async () => {
            const invalidPayload = {
                password: 'password123',
            };
            const response = await api.request({ ...url, data: invalidPayload });
            expect(response.status).toBe(400);
        });

        it(`${ID++}. should reject login with missing password`, async () => {
            const invalidPayload = {
                email: 'test@example.com',
            };
            const response = await api.request({ ...url, data: invalidPayload });
            expect(response.status).toBe(400);
        });

        it(`${ID++}. should reject login with invalid email format`, async () => {
            const invalidPayload = {
                email: 'not-an-email',
                password: 'password123',
            };
            const response = await api.request({ ...url, data: invalidPayload });
            expect(response.status).toBe(400);
        });
    });

    // describe('Login flow', () => {
    //     const apiBasePath = getApiBasePath();
    //     const url = `${apiBasePath}/login`;

    //     let authToken: string;

    //     beforeEach(() => {
    //         authToken = '';
    //     });

    //     it(`${ID++}. should be able to access protected endpoints after login`, async () => {
    //         const loginResponse = await api.request({ ...url, generateTestCredentials() });

    //         // authToken = loginResponse.data.token;
    //         // expect(loginResponse.status).toBeLessThan(500);
    //         // const protectedResponse = await api.get(`${apiBasePath}/protected-resource`, {
    //         //     headers: {
    //         //         Authorization: `Bearer ${authToken}`
    //         //     }
    //         // });
    //         // expect(protectedResponse.status).toBe(200);
    //     });
    // });
});
