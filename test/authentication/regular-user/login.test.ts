import axios, { AxiosInstance } from 'axios';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getLoginUrl, getPingSecuredUrl, IUrl } from '../shared/config-management';
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

    describe('Login flow', async () => {
        let authToken: string;

        beforeEach(() => {
            authToken = '';
        });

        it(`${ID++}. should fail due to missing auth header`, async () => {
            const url: IUrl = await getPingSecuredUrl();
            const protectedResponse = await api.request({
                ...url,
                headers: {},
            });
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: `Authorization header is missing.`,
            });
        });

        it(`${ID++}. should fail due to invalid auth header`, async () => {
            const url: IUrl = await getPingSecuredUrl();
            const protectedResponse = await api.request({
                ...url,
                headers: {
                    Authorization: `Beare`,
                },
            });
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: `Authorization header is invalid.`,
            });
        });

        it(`${ID++}. should fail due to invalid auth token`, async () => {
            const url: IUrl = await getPingSecuredUrl();
            const protectedResponse = await api.request({
                ...url,
                headers: {
                    Authorization: `Bearer InvalidToken`,
                },
            });
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: `Invalid token.`,
            });
        });

        it(`${ID++}. should fail due to expired token`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            // simulate token expiration
            await new Promise((resolve) => setTimeout(resolve, 5001));
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: `Token expired.`,
            });
        }, 10000);

        it(`${ID++}. should be able to access protected endpoints after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toStrictEqual({
                msg: 'Pong!',
            });
        });
    });
});
