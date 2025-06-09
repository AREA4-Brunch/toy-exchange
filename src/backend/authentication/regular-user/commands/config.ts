import { IClientProject } from 'common/dist/commands/config.interface';
import { IPublishOptions } from 'common/dist/commands/publish';
import * as path from 'path';

// relative to dist .js compiled file
const projectRoot = path.resolve(__dirname, '../../../');
const baseDir = path.resolve(__dirname, '../../../../');

const clientProjectSelf: IClientProject = {
  name: 'Authentication Service (Self)',
  projectPath: path.join(baseDir, 'authentication'),
  packageJsonPath: path.join(baseDir, 'authentication/package.json'),
  targetLibsDir: path.join(baseDir, 'authentication/shared/libs'),
  updateStrategy: 'install',
};

const clientProjectsInterfaces: IClientProject[] = [
  clientProjectSelf,
  {
    name: 'Password Utils (Infrastructure)',
    projectPath: path.join(baseDir, 'shared/password-utils'),
    packageJsonPath: path.join(baseDir, 'shared/password-utils/package.json'),
    targetLibsDir: path.join(baseDir, 'shared/password-utils/libs'),
    updateStrategy: 'install',
  },
];

const pkgJsonFilesInterfaces = ['dist/', 'README.md'];

const tsConfigContentInterfaces = {
  extends: './tsconfig.json',
  compilerOptions: {
    outDir: './dist',
    declaration: true,
    emitDeclarationOnly: false,
  },
};

export const publishInterfacesOptions: IPublishOptions = {
  projectRoot,
  clientProjects: clientProjectsInterfaces,
  pkgJsonFiles: pkgJsonFilesInterfaces,
  tsConfigContent: tsConfigContentInterfaces,
  publishedLibName: 'authentication-interfaces',
  newVersion: undefined,
  selectiveCompilation: true,
  selectiveFiles: ['regular-user/login/application/**/*.interface.ts'],
  selectiveIgnorePatterns: ['node_modules', 'dist'],
  cleanupTempDist: true,
  outputDest: './_versions',
  dependencyFormat: 'bundled',
  bundleDependencies: true,
  updateClients: true,
  buildBeforePublish: true,
};

export const selfPublishInterfacesOptions: IPublishOptions = {
  ...publishInterfacesOptions,
  clientProjects: [clientProjectSelf],
};
