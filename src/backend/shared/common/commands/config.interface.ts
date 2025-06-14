export interface IClientProject {
    name: string;
    projectPath: string; // dir of package.json
    packageJsonPath: string;
    targetLibsDir: string;
    updateStrategy?: 'update' | 'install';
}
