import * as path from 'path';

interface ClientProject {
    name: string;
    packageJsonPath: string;
    targetLibsDir: string;
}

const baseDir = path.resolve(__dirname, '../../../../');

export const clientProjects: ClientProject[] = [
    {
        name: 'Authentication Service',
        packageJsonPath: path.join(baseDir, 'authentication/package.json'),
        targetLibsDir: path.join(baseDir, 'authentication/shared/libs'),
    },
];
