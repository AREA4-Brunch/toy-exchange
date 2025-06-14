import {
    copyPackageToDirectory,
    createPackageTgz,
    distributePackage,
} from 'common/dist/commands/publish';
import * as path from 'path';
import {
    publishInterfacesOptions,
    selfPublishInterfacesOptions,
} from './commands.config';

const main = async () => {
    try {
        const version: string | undefined = process.argv
            .find((arg) => arg.startsWith('--version='))
            ?.substring('--version='.length);
        const publishType = process.argv
            .find((arg) => arg.startsWith('--publish-type='))
            ?.substring('--publish-type='.length);

        console.log(`version: ${JSON.stringify(version)}`);
        console.log(`publishType: ${JSON.stringify(publishType)}`);

        const options =
            publishType === 'all'
                ? { ...publishInterfacesOptions, newVersion: version }
                : {
                      ...selfPublishInterfacesOptions,
                      newVersion: version,
                  };

        console.log('🚀 Step 1: Creating package...');
        const packageInfo = await createPackageTgz(options);

        console.log('📁 Step 2: Copying pkg to dependent libs in node_modules');
        const archiveDir = path.join(
            options.projectRoot,
            'node_modules',
            'password-utils',
        );
        const copiedPackageInfo = await copyPackageToDirectory({
            packageInfo,
            destinationDir: archiveDir,
            overwrite: true,
        });

        console.log('🔄 Step 3: Distributing package to clients...');
        await distributePackage({
            packageInfo: copiedPackageInfo,
            clientProjects: options.clientProjects,
            publishedLibName: options.publishedLibName,
            updateClients: options.updateClients,
        });

        console.log(
            `✅ Successfully published ${options.publishedLibName} v${packageInfo.version}`,
        );
    } catch (error) {
        console.error('❌ Publication failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    main();
}
