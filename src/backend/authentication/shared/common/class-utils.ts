export const getAllStaticStringProperties = (cls: any): string[] => {
    const ownProps = Object.getOwnPropertyNames(cls)
        .filter((prop) => typeof cls[prop] === 'string' && prop !== 'prototype')
        .map((prop) => cls[prop]);

    const parent = Object.getPrototypeOf(cls);
    if (parent && parent !== Object.prototype) {
        return [...ownProps, ...getAllStaticStringProperties(parent)];
    }

    return ownProps;
};

export const findStaticStringProperty = (
    cls: any,
    target: string,
): string | undefined => {
    const found: string | undefined = Object.getOwnPropertyNames(cls).find(
        (prop) =>
            typeof cls[prop] === 'string'
            && prop !== 'prototype'
            && cls[prop] === target,
    );
    if (found) {
        return cls[found];
    }
    const parent = Object.getPrototypeOf(cls);
    return parent
        && parent !== Object.prototype
        && parent !== Function.prototype
        ? findStaticStringProperty(parent, target)
        : undefined;
};

export const fetchObjectProperty = <T>(obj: any, propertyPath: string): T => {
    if (!propertyPath || !obj) return obj;
    const keys = propertyPath.split('.');
    for (const key of keys) {
        if (!obj || typeof obj !== 'object' || !(key in obj)) {
            return undefined as T;
        }
        obj = obj[key];
    }
    return obj as T;
};
