import axios, { AxiosInstance } from 'axios';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
    generateTestCredentials,
    generateTestCredentialsMultipleRoles,
    generateTestCredentialsNoRoles,
    generateTestCredentialsSomeRole,
} from './common';
import {
    getLoginUrl,
    getPingSecuredForbiddenRoles,
    getPingSecuredMultipleRoles,
    getPingSecuredUrl,
    getPingUrl,
    IUrl,
} from './urls';

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

        it(`${ID++}. should fail accessing protected endpoint due to missing auth header`, async () => {
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: {},
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toEqual({
                errMsg: `Authorization header is missing.`,
            });
        });

        it(`${ID++}. should fail accessing protected endpoint due to invalid auth header`, async () => {
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: {
                    Authorization: `Beare`,
                },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toEqual({
                errMsg: `Authorization header is invalid.`,
            });
        });

        it(`${ID++}. should fail accessing protected endpoint due to missing token`, async () => {
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toEqual({
                errMsg: `Authorization header is invalid.`,
            });
        });

        it(`${ID++}. should fail accessing protected endpoint due to invalid auth token`, async () => {
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: {
                    Authorization: `Bearer InvalidToken`,
                },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toEqual({
                errMsg: `Invalid token.`,
            });
        });

        it(`${ID++}. should fail due to incorrect email`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: { ...generateTestCredentials(), email: 'non@existant.com' },
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data.data).toBeUndefined();
            expect(loginResponse.data.success).toBe(false);
            expect(loginResponse.data.message).toEqual('Wrong username or password.');
        });

        it(`${ID++}. should fail due to incorrect password`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: { ...generateTestCredentials(), password: 'non-existant' },
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data.data).toBeUndefined();
            expect(loginResponse.data.success).toBe(false);
            expect(loginResponse.data.message).toEqual('Wrong username or password.');
        });

        it(`${ID++}. should fail due to incorrect email and password`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: {
                    ...generateTestCredentials(),
                    email: 'non@existant.com',
                    password: 'non-existant',
                },
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data.data).toBeUndefined();
            expect(loginResponse.data.success).toBe(false);
            expect(loginResponse.data.message).toEqual('Wrong username or password.');
        });

        it(`${ID++}. should fail accessing protected endpoint due to expired token`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            // simulate token expiration
            await new Promise((resolve) => setTimeout(resolve, 5001));
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(401);
            expect(protectedResponse.data).toEqual({
                errMsg: `Token expired.`,
            });
        }, 10000);

        it(`${ID++}. should fail due to lack of 1 mandatory role to access protected endpoint`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsNoRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(403);
            expect(protectedResponse.data).toEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should fail due to lack of 1 of couple required roles to access protected endpoint`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsSomeRole(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingSecuredMultipleRoles()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(403);
            expect(protectedResponse.data).toEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should fail due to having 1 forbidden role to access protected endpoint`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsMultipleRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingSecuredForbiddenRoles()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(403);
            console.log(`Received: ${JSON.stringify(protectedResponse.data.data, null, 2)}`);
            expect(protectedResponse.data).toEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should be able to access single role protected endpoint after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should be able to access multiple roles protected endpoint after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsMultipleRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingSecuredMultipleRoles()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should be able to access single role protected endpoint with multi roles account after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsMultipleRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingSecuredUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should be able to access no role protected endpoint with multi roles account after login`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentialsMultipleRoles(),
            });
            expect(loginResponse.status).toBe(200);
            authToken = loginResponse.data.data.token;
            expect(authToken).toBeDefined();
            expect(loginResponse.data.success).toBe(true);
            const protectedResponse = await api.request({
                ...(await getPingUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log(`Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
            expect(protectedResponse.status).toBe(200);
            expect(protectedResponse.data).toEqual({
                msg: 'Pong!',
            });
        });
    });
});
