import { IClientProject } from 'common/dist/commands/config.interface';
import { IPublishOptions } from 'common/dist/commands/publish';
import * as path from 'path';

// relative to dist .js compiled file
const projectRoot = path.resolve(__dirname, '../../../');
const baseDir = path.resolve(__dirname, '../../../../');

const clientProjectsInterfaces: IClientProject[] = [
  {
    name: 'Password Utils (Infrastructure)',
    packageJsonPath: path.join(baseDir, 'shared/password-utils/package.json'),
    targetLibsDir: path.join(baseDir, 'shared/password-utils/libs'),
  },
];

const pkgJsonFilesInterfaces = ['dist/', 'README.md'];

const tsConfigContentInterfaces = {
  extends: './tsconfig.json',
  compilerOptions: {
    outDir: './dist', // Unique temp output for TSC
    rootDir: './',
    declaration: true,
    emitDeclarationOnly: false,
  },
  // Be very specific about included files - only interface files
  include: ['./regular-user/login/application/**/*.interface.ts'],
  // Let TypeScript handle exclusions based on include patterns
};

export const publishInterfacesOptions: IPublishOptions = {
  projectRoot,
  clientProjects: clientProjectsInterfaces,
  pkgJsonFiles: pkgJsonFilesInterfaces,
  tsConfigContent: tsConfigContentInterfaces,
  publishedLibName: 'authentication-interfaces',
  newVersion: undefined,
  selectiveCompilation: true,
  cleanupTempDist: true,
  outputDest: './_versions',
};
