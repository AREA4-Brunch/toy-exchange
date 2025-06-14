import { ConfigManager } from '../shared/config-management';
import { IApiConfig, IEndpointConfig } from '../shared/config.interface';

export interface IUrl {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
}

export const getPingUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.health', config);
};

export const getLoginUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.login.login', config);
};

export const getPublicUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.public', config);
};

export const getAuthenticatedUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.authenticated', config);
};

export const getSingleRoleUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.singleRole', config);
};

export const getMultipleRolesAllUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.multipleRolesAll', config);
};

export const getMultipleRolesSomeUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.multipleRolesSome', config);
};

export const getForbiddenRolesUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.forbiddenRoles', config);
};

export const getCombinedRequirementsUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.combinedRequirements', config);
};

export const getAdminOnlyUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.adminOnly', config);
};

export const getSuperAdminUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.superAdmin', config);
};

export const getModeratorOrAdminUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.moderatorOrAdmin', config);
};

export const getNoBannedUsersUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.noBannedUsers', config);
};

export const getAllAndSomeUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.allAndSome', config);
};

export const getSomeAndNoneUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.someAndNone', config);
};

export const getAllAndNoneUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.allAndNone', config);
};

export const getDoubleMiddlewareUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.doubleMiddleware', config);
};

export const getPingSecuredUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return getSingleRoleUrl(config);
};

export const getPingSecuredSomeRole = async (config?: IApiConfig): Promise<IUrl> => {
    return getMultipleRolesSomeUrl(config);
};

export const getPingSecuredMultipleRoles = async (config?: IApiConfig): Promise<IUrl> => {
    return getMultipleRolesAllUrl(config);
};

export const getPingSecuredForbiddenRoles = async (config?: IApiConfig): Promise<IUrl> => {
    return getForbiddenRolesUrl(config);
};

const buildUrl = async (propertyPath: string, obj: any): Promise<IUrl> => {
    obj = obj || (await ConfigManager.getInstance().apiConfig());
    if (!obj) throw new Error('Cannot build url of undefined/null obj.');

    const keys = propertyPath.split('.');
    let path = `${obj.endpoint}`;
    for (const key of keys) {
        const val = obj[key as keyof typeof obj] as unknown as IEndpointConfig;
        if (!val) {
            throw new Error(
                `Key '${key}' in given obj is undefined or null. propertyPath: ${propertyPath}`,
            );
        }
        path += `${val.endpoint}`;
        obj = val;
    }

    return { url: path, method: obj.method };
};
