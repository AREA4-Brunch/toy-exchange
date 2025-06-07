import { IClientProject } from 'common/dist/commands/config.interface';
import { IPublishOptions } from 'common/dist/commands/publish';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../../');
const baseDir = path.resolve(__dirname, '../../../../');

const clientProjects: IClientProject[] = [
  {
    name: 'Authentication Service',
    packageJsonPath: path.join(baseDir, 'authentication/package.json'),
    targetLibsDir: path.join(baseDir, 'authentication/shared/libs'),
  },
];

const pkgJsonFiles = ['dist/infrastructure/**/*', 'README.md'];

const tsConfigContent = {
  extends: './tsconfig.json',
  // !important: must specify infrastructure dir, ./**/*.ts wont work
  include: ['./infrastructure/**/*.ts'],
  exclude: ['./commands/**/*.ts', 'node_modules'],
};

export const publishOptions: IPublishOptions = {
  projectRoot,
  clientProjects,
  pkgJsonFiles,
  tsConfigContent,
  publishedLibName: 'authorization',
  newVersion: undefined,
  selectiveCompilation: false,
  cleanupTempDist: true,
  outputDest: './_versions',
};
