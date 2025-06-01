import axios, { AxiosInstance } from 'axios';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
    generateTestCredentials,
    generateTestCredentialsMultipleRoles,
    generateTestCredentialsNoRoles,
    generateTestCredentialsSomeRole,
} from './common';
import { getLoginUrl, getPingSecuredSomeRole, getPingSecuredUrl, IUrl } from './urls';

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
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: {},
            });
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: `Authorization header is missing.`,
            });
        });

        it(`${ID++}. should fail due to invalid auth header`, async () => {
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
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
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
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
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: `Token expired.`,
            });
        }, 10000);

        it(`${ID++}. should fail due to lack of 1 mandatory role to access protected endpoint`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsNoRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(protectedResponse.status).toBe(403);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should fail due to lack of 1 of couple allowed roles to access protected endpoint`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsSomeRole(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            const protectedResponse = await api.request({
                ...(await getPingSecuredSomeRole()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(protectedResponse.status).toBe(403);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should fail due to having 1 forbidden role to access protected endpoint`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsMultipleRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(protectedResponse.status).toBe(403);
            expect(protectedResponse.data).toStrictEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should be able to access single role protected endpoint after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should be able to access multiple roles protected endpoint after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsMultipleRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.token;
            expect(authToken).toBeDefined();
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toStrictEqual({
                msg: 'Pong!',
            });
        });
    });
});
