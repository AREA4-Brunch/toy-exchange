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
