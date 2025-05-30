import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { clientProjects } from './common';
import { publish } from './publish';

const execAsync = util.promisify(exec);

const main = async () => {
    try {
        const optionalVersion: string | undefined = process.argv[2];
        const version: string = await publish(optionalVersion);
        // const version: string = '1.1.0';
        console.log(
            `\n📦 Authorization package published as version ${version}`,
        );
        console.log(`🔄 Updating client projects...\n`);
        const numFailed = await npmUpdateClients(version);
        if (numFailed === 0) {
            console.log(`\n✅ Client update process completed successfully!`);
        } else {
            console.error(
                '❌ Client update process had failures check the summary above:',
            );
        }
    } catch (error) {
        console.error('❌ Client update process failed:', error);
        process.exit(1);
    }
};

const npmUpdateClients = async (version: string): Promise<number> => {
    const updatedClients: string[] = [];
    const skippedClients: string[] = [];
    const failedClients: { name: string; error: any }[] = [];
    const cleanedOldVersions: { client: string; removed: string[] }[] = [];

    for (const client of clientProjects) {
        try {
            console.log(`📂 Processing ${client.name}...`);

            if (!fs.existsSync(client.packageJsonPath)) {
                console.log(
                    `   ⚠️ Package.json not found at ${client.packageJsonPath}`,
                );
                skippedClients.push(client.name);
                continue;
            }

            // read the client's package.json with original formatting
            const packageJsonContent = fs.readFileSync(
                client.packageJsonPath,
                'utf8',
            );
            const packageJson = JSON.parse(packageJsonContent);

            // Store the original indentation by checking the first property indentation
            const indentMatch = packageJsonContent.match(/\n(\s+)"/);
            const indent = indentMatch ? indentMatch[1] : '  '; // Default to 2 spaces if not found

            // check if the client uses our authorization package
            const dependencies = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies,
            };

            if (!dependencies.authorization) {
                console.log(`   ⚠️ Project does not use authorization package`);
                skippedClients.push(client.name);
                continue;
            }
            // Check if version needs updating
            const isFileDependency =
                dependencies.authorization.startsWith('file:');

            // Update version in package.json (dependencies or devDependencies)
            const depKey = packageJson.dependencies?.authorization
                ? 'dependencies'
                : 'devDependencies';
            packageJson[depKey].authorization = isFileDependency
                ? packageJson[depKey].authorization.replace(
                      /(authorization-)([0-9.]+)(\.tgz)/,
                      `$1${version}$3`,
                  )
                : version;

            // write updated package.json
            fs.writeFileSync(
                client.packageJsonPath,
                JSON.stringify(packageJson, null, indent.length) + '\n',
            );

            console.log(`   ✏️ Updated package.json version reference`);
            console.log(`   🔄 Running npm update...`);
            await execAsync('npm update authorization', {
                cwd: path.dirname(client.packageJsonPath),
            });

            console.log(`   ✅ Successfully updated authorization package`);
            updatedClients.push(client.name);

            // Clean up older versions after successful update
            if (isFileDependency) {
                const oldVersionFilesToRemove: string[] = [];
                try {
                    const libsDir =
                        path.dirname(client.packageJsonPath) + '/shared/libs';
                    if (fs.existsSync(libsDir)) {
                        const files = fs.readdirSync(libsDir);
                        const oldVersionFiles = files.filter(
                            (file) =>
                                file.startsWith('authorization-')
                                && file.endsWith('.tgz')
                                && !file.includes(`-${version}.tgz`),
                        );

                        for (const oldFile of oldVersionFiles) {
                            const oldFilePath = path.join(libsDir, oldFile);
                            fs.unlinkSync(oldFilePath);
                            oldVersionFilesToRemove.push(oldFile);
                        }

                        if (oldVersionFilesToRemove.length > 0) {
                            console.log(
                                `   🗑️ Removed ${oldVersionFilesToRemove.length} older version(s)`,
                            );
                            cleanedOldVersions.push({
                                client: client.name,
                                removed: oldVersionFilesToRemove,
                            });
                        }
                    }
                } catch (cleanupError: any) {
                    console.warn(
                        `   ⚠️ Failed to clean up old versions: ${cleanupError.message}`,
                    );
                }
            }
        } catch (error) {
            console.error(`   ❌ Failed to update ${client.name}:`, error);
            failedClients.push({ name: client.name, error });
        }
    }

    console.log(`\nUpdate Summary:`);
    if (updatedClients.length) {
        console.log(
            `   ✅ Updated ${updatedClients.length} projects: ${updatedClients.join(', ')}`,
        );
    }
    if (skippedClients.length) {
        console.log(
            `   ⏭️ Skipped ${skippedClients.length} projects: ${skippedClients.join(', ')}`,
        );
    }
    if (failedClients.length) {
        console.log(
            `   ❌ Failed ${failedClients.length} projects: ${failedClients.map((f) => f.name).join(', ')}`,
        );
    }
    if (cleanedOldVersions.length) {
        console.log(
            `   🗑️ Cleaned up old versions in ${cleanedOldVersions.length} projects`,
        );
        cleanedOldVersions.forEach(({ client, removed }) => {
            console.log(`      ${client}: Removed ${removed.join(', ')}`);
        });
    }

    if (failedClients.length > 0) {
        console.log(`\n⚠️ Failed Updates Details:`);
        failedClients.forEach(({ name, error }) => {
            console.log(`   ${name}: ${error.message || error}`);
        });
    }

    return failedClients.length;
};

if (require.main === module) {
    main();
}
