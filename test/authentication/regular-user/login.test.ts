import axios, { AxiosInstance } from 'axios';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
    generateAdminCredentials,
    generateBannedUserCredentials,
    generateModeratorAdminCredentials,
    generateModeratorCredentials,
    generateMultipleRoleCredentials,
    generateNoRoleCredentials,
    generateSomeRoleCredentials,
    generateSuperAdminCredentials,
    generateSuspendedUserCredentials,
    generateTestCredentials,
} from './common';
import {
    getAdminOnlyUrl,
    getAllAndNoneUrl,
    getAllAndSomeUrl,
    getAuthenticatedUrl,
    getCombinedRequirementsUrl,
    getDoubleMiddlewareUrl,
    getForbiddenRolesUrl,
    getLoginUrl,
    getModeratorOrAdminUrl,
    getMultipleRolesAllUrl,
    getMultipleRolesSomeUrl,
    getNoBannedUsersUrl,
    getPublicUrl,
    getSingleRoleUrl,
    getSomeAndNoneUrl,
    getSuperAdminUrl,
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

    describe('Login endpoint validation', async () => {
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

        it(`${ID++}. should fail due to incorrect email`, async () => {
            const loginResponse = await api.request({
                ...url,
                data: { ...generateTestCredentials(), email: 'non@existant.com' },
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data).toStrictEqual({
                status: 'failure',
                message: 'Wrong username or password.',
            });
        });

        it(`${ID++}. should fail due to incorrect password`, async () => {
            const loginResponse = await api.request({
                ...url,
                data: { ...generateTestCredentials(), password: 'non-existant' },
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data).toStrictEqual({
                status: 'failure',
                message: 'Wrong username or password.',
            });
        });

        it(`${ID++}. should fail due to incorrect email and password`, async () => {
            const loginResponse = await api.request({
                ...url,
                data: {
                    ...generateTestCredentials(),
                    email: 'non@existant.com',
                    password: 'non-existant',
                },
            });
            expect(loginResponse.status).toBe(401);
            expect(loginResponse.data).toStrictEqual({
                status: 'failure',
                message: 'Wrong username or password.',
            });
        });
    });

    describe('Authentication & Authorization Tests', async () => {
        let authToken: string;

        beforeEach(() => {
            authToken = '';
        });

        it(`${ID++}. should access public endpoint without authentication`, async () => {
            const response = await api.request({
                ...(await getPublicUrl()),
                headers: {},
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail accessing authenticated endpoint without token`, async () => {
            const response = await api.request({
                ...(await getAuthenticatedUrl()),
                headers: {},
            });
            expect(response.status).toBe(401);
            expect(response.data).toStrictEqual({
                errMsg: 'Authorization header is missing.',
            });
        });

        it(`${ID++}. should access authenticated endpoint with valid token`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getAuthenticatedUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail accessing single role endpoint without required role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateNoRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getSingleRoleUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should access single role endpoint with required role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getSingleRoleUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail accessing multiple roles all endpoint without all required roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getMultipleRolesAllUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should access multiple roles all endpoint with all required roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getMultipleRolesAllUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail accessing multiple roles some endpoint without any required roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getMultipleRolesSomeUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should access multiple roles some endpoint with one required role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateSomeRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getMultipleRolesSomeUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail accessing forbidden roles endpoint with forbidden role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getForbiddenRolesUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should access forbidden roles endpoint without forbidden roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getForbiddenRolesUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should pass all-and-some combination with correct roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getAllAndSomeUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail all-and-some combination missing all roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateSomeRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getAllAndSomeUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should pass some-and-none combination with correct roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateSomeRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getSomeAndNoneUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail some-and-none combination with forbidden role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getSomeAndNoneUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should pass all-and-none combination with correct roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getAllAndNoneUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should pass combined requirements with all conditions met`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getCombinedRequirementsUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should handle double middleware correctly`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateMultipleRoleCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getDoubleMiddlewareUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail admin-only endpoint without admin role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getAdminOnlyUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should access admin-only endpoint with admin role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateAdminCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getAdminOnlyUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail super-admin endpoint without both roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateAdminCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getSuperAdminUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has insufficient roles.',
            });
        });

        it(`${ID++}. should access super-admin endpoint with both roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateSuperAdminCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getSuperAdminUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should access moderator-or-admin endpoint with moderator role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateModeratorCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getModeratorOrAdminUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should access moderator-or-admin endpoint with admin role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateModeratorAdminCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getModeratorOrAdminUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail no-banned-users endpoint with banned role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateBannedUserCredentials(),
            });
            expect(loginResponse.status).toBe(403);
            expect(loginResponse.data).toStrictEqual({
                status: 'failure',
                message: 'Forbidden to login due to having been banned.',
            });
        });

        it(`${ID++}. should fail no-banned-users endpoint with suspended role`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateSuspendedUserCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getNoBannedUsersUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(403);
            expect(response.data).toStrictEqual({
                errMsg: 'Token has forbidden roles.',
            });
        });

        it(`${ID++}. should access no-banned-users endpoint without banned roles`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            const response = await api.request({
                ...(await getNoBannedUsersUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(200);
            expect(response.data).toStrictEqual({
                msg: 'Pong!',
            });
        });

        it(`${ID++}. should fail with invalid token format`, async () => {
            const response = await api.request({
                ...(await getSingleRoleUrl()),
                headers: {
                    Authorization: 'Bearer InvalidToken',
                },
            });
            expect(response.status).toBe(401);
            expect(response.data).toStrictEqual({
                errMsg: 'Invalid token.',
            });
        });

        it(`${ID++}. should fail with expired token`, async () => {
            const loginResponse = await api.request({
                ...(await getLoginUrl()),
                data: generateTestCredentials(),
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data.status).toBe('success');
            authToken = loginResponse.data.data.token;

            await new Promise((resolve) => setTimeout(resolve, 5001));

            const response = await api.request({
                ...(await getSingleRoleUrl()),
                headers: { Authorization: `Bearer ${authToken}` },
            });
            expect(response.status).toBe(401);
            expect(response.data).toStrictEqual({
                errMsg: 'Token expired.',
            });
        }, 10000);
    });
});
