import * as path from 'path';
import { IClientProject } from '../commands/config.interface';
import { IPublishOptions } from '../commands/publish';

const baseDir = path.resolve(__dirname, '../../../');

const clientProjects: IClientProject[] = [
  {
    name: 'Authorization Lib',
    projectPath: path.join(baseDir, 'authorization'),
    packageJsonPath: path.join(baseDir, 'authorization/package.json'),
    targetLibsDir: path.join(baseDir, 'authorization/libs'),
  },
  {
    name: 'Password Utils Lib',
    projectPath: path.join(baseDir, 'password-utils'),
    packageJsonPath: path.join(baseDir, 'password-utils/package.json'),
    targetLibsDir: path.join(baseDir, 'password-utils/libs'),
  },
  {
    name: 'Authentication Service',
    projectPath: path.join(baseDir, '../authentication'),
    packageJsonPath: path.join(baseDir, '../authentication/package.json'),
    targetLibsDir: path.join(baseDir, '../authentication/shared/libs'),
  },
];

const projectRoot = path.resolve(__dirname, '../../');

const pkgJsonFiles = ['dist/commands/**/*', 'README.md'];

const tsConfigContent = {
  extends: './tsconfig.json',
  // !important: must specify commands dir, ./**/*.ts wont work
  include: ['./commands/**/*.ts'],
  exclude: ['./_commands/**/*.ts', 'node_modules'],
};

export const publishOptions: IPublishOptions = {
  projectRoot,
  clientProjects,
  pkgJsonFiles,
  tsConfigContent,
  publishedLibName: 'common',
  newVersion: undefined,
  selectiveCompilation: false,
  cleanupTempDist: true,
  outputDest: './_versions',
};
