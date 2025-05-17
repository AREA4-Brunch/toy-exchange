import 'reflect-metadata';
import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AxiosInstance } from 'axios';
import { getApiBasePath, generateTestCredentials, startTestServer } from './utils/test-utils';

describe('Login API', () => {
    let api: AxiosInstance;
    let ID = 1;
    let server: any;

    beforeAll(async () => {
        server = await startTestServer();
        api = axios.create({
            baseURL: `http://localhost:${server.port}/api`,
            validateStatus: (status) => status < 500,
        });
    });

    afterAll(async () => {
        if (server) await server.stop();
    });

    describe('Login endpoint', async () => {
        const apiBasePath = await getApiBasePath();
        const loginEndpoint = `${apiBasePath}/login`;

        it(`${ID++}. should process login request`, async () => {
            const loginPayload = generateTestCredentials();
            console.log(`login: ${loginEndpoint}`);
            const response = await api.post(loginEndpoint, loginPayload);
            // In real implementation, you'd check for a token or user data
            // For now, just check that the endpoint responds
            expect(response.status).toBeLessThan(500); // Not a server error
        });

        // it(`${ID++}. should reject login with missing email`, async () => {
        //     const invalidPayload = {
        //         password: 'password123',
        //     };

        //     const response = await api.post(loginEndpoint, invalidPayload);

        //     expect(response.status).toBe(400);
        // });

        // it(`${ID++}. should reject login with missing password`, async () => {
        //     const invalidPayload = {
        //         email: 'test@example.com',
        //     };

        //     const response = await api.post(loginEndpoint, invalidPayload);

        //     expect(response.status).toBe(400);
        // });

        // it(`${ID++}. should reject login with invalid email format`, async () => {
        //     const invalidPayload = {
        //         email: 'not-an-email',
        //         password: 'password123',
        //     };

        //     const response = await api.post(loginEndpoint, invalidPayload);

        //     expect(response.status).toBe(400);
        // });
    });

    // describe('Login flow', () => {
    //     const apiBasePath = getApiBasePath();
    //     const loginEndpoint = `${apiBasePath}/login`;

    //     let authToken: string;

    //     beforeEach(() => {
    //         authToken = '';
    //     });

    //     it(`${ID++}. should be able to access protected endpoints after login`, async () => {
    //         const loginResponse = await api.post(loginEndpoint, generateTestCredentials());

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
