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

export const getPingSecuredUrl = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.health', config);
};

export const getPingSecuredSomeRole = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.healthSomeRole', config);
};

export const getPingSecuredMultipleRoles = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.healthMultipleRoles', config);
};

export const getPingSecuredForbiddenRoles = async (config?: IApiConfig): Promise<IUrl> => {
    return buildUrl('authentication.regularUser.health.test.healthForbiddenRoles', config);
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
