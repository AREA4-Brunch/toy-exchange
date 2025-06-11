import { IClientProject } from 'common/dist/commands/config.interface';
import { IPublishOptions } from 'common/dist/commands/publish';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../../');
const baseDir = path.resolve(__dirname, '../../../../');

const clientProjects: IClientProject[] = [
  {
    name: 'Authentication Service (Login)',
    projectPath: path.join(baseDir, 'authentication'),
    packageJsonPath: path.join(baseDir, 'authentication/package.json'),
    targetLibsDir: path.join(baseDir, 'authentication/regular-user/login/libs'),
    updateStrategy: 'install',
  },
];

const pkgJsonFiles = ['dist/infrastructure/**/*', 'README.md'];

const tsConfigContent = {
  extends: './tsconfig.json',
  // !important: must specify infrastructure dir, ./**/*.ts wont work
  include: ['./infrastructure/**/*.ts'],
  exclude: ['./commands/**/*.ts', 'node_modules'],
  compilerOptions: {
    outDir: './dist',
    declaration: true,
    emitDeclarationOnly: false,
  },
};

export const publishOptions: IPublishOptions = {
  projectRoot,
  clientProjects,
  pkgJsonFiles,
  tsConfigContent,
  publishedLibName: 'password-utils',
  newVersion: undefined,
  cleanupTempDist: true,
  outputDest: './_versions',
  updateClients: true,
  buildBeforePublish: true,
  bundleDeps: {
    enabled: true,
    outputDir: './',
    dependencyFormat: 'bundled',
  },
};
