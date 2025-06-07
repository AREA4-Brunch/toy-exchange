import { exec } from 'child_process';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as util from 'util';
import { IClientProject } from './config.interface';

const execAsync = util.promisify(exec);

interface PackageJson {
    name: string;
    version: string;
    [key: string]: any;
}

interface DependencyInfo {
    dependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
}

export interface IPublishOptions {
    projectRoot: string;
    clientProjects: IClientProject[];
    pkgJsonFiles: string[];
    tsConfigContent: any;
    publishedLibName: string; // no version number
    newVersion?: string;
    outputDest?: string; // Destination for the generated package files
    selectiveCompilation?: boolean; // Enable selective compilation based on include patterns
    cleanupTempDist?: boolean; // Whether to clean up temporary dist folder after publishing
}

export const publish = async ({
    projectRoot,
    clientProjects,
    pkgJsonFiles,
    tsConfigContent,
    publishedLibName,
    newVersion,
    outputDest = './_versions',
    selectiveCompilation = false,
    cleanupTempDist = true,
}: IPublishOptions): Promise<string> => {
    try {
        console.log(`Project root: ${projectRoot}`);
        const distDir = path.join(projectRoot, 'dist');
        const targetLibsDirs = clientProjects.map(
            (project) => project.targetLibsDir,
        );
        createDirIfNotExists(distDir);
        createDirIfNotExists(outputDest);
        for (const dir of targetLibsDirs) {
            createDirIfNotExists(dir);
        }

        // read package.json from project root, not dist
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`package.json not found at ${packageJsonPath}`);
        }

        // read the client's package.json with original formatting
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent) as PackageJson;
        packageJson.name = publishedLibName; // set the package name
        // Store the original indentation by checking the first property indentation
        const indentMatch = packageJsonContent.match(/\n(\s+)"/);
        const indent = indentMatch ? indentMatch[1] : '  '; // Default to 2 spaces if not found

        // This variable will hold the final package.json data used for packing
        let finalPackageJsonForPacking: PackageJson;
        let packCwd: string;
        let tgzFilename: string; // Will be determined after potential version update

        // Initial setup of tempPackageJson from the original package.json
        // This will be the basis for non-selective compilation or metadata for selective
        const tempPackageJson = { ...packageJson };
        tempPackageJson.name = publishedLibName; // Ensure the published name is set

        // update version if provided and different from current version
        if (newVersion && tempPackageJson.version !== newVersion) {
            console.log(
                `Updating version from ${tempPackageJson.version} to ${newVersion}`,
            );
            tempPackageJson.version = newVersion;
            // Note: We are not writing back to the original package.json or running npm version yet
            // This will be handled differently based on selective or non-selective path
        } else if (newVersion && tempPackageJson.version === newVersion) {
            console.log(
                `Version already set to ${newVersion}, skipping version update`,
            );
        }
        // At this point, tempPackageJson.version has the version to be published.

        if (selectiveCompilation) {
            console.log(
                'Applying selective compilation with staging directory...',
            );
            packCwd = path.join(
                projectRoot,
                `dist.publish.${publishedLibName}`,
            );
            finalPackageJsonForPacking = { ...tempPackageJson }; // Start with metadata

            if (fs.existsSync(packCwd)) {
                fs.rmSync(packCwd, { recursive: true, force: true });
            }
            fs.mkdirSync(packCwd, { recursive: true });
            console.log(`Created staging directory: ${packCwd}`);

            // Discover all files to copy including dependencies
            const sourceFilesToCopyForStaging = discoverAllDependencies(
                tsConfigContent.include || [],
                projectRoot,
            );

            // Copy all discovered files to staging
            sourceFilesToCopyForStaging.forEach((relativeFilePath) => {
                const sourcePath = path.join(projectRoot, relativeFilePath);
                const destPath = path.join(packCwd, relativeFilePath);
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), {
                        recursive: true,
                    });
                }
                fs.copyFileSync(sourcePath, destPath);
            });
            if (sourceFilesToCopyForStaging.length === 0) {
                throw new Error(
                    'No source files found to copy to staging for selective compilation.',
                );
            }
            console.log(
                `Copied ${sourceFilesToCopyForStaging.length} source files to staging.`,
            );

            const stagingTsConfig = JSON.parse(JSON.stringify(tsConfigContent));
            delete stagingTsConfig.extends; // Prevent circularity
            stagingTsConfig.compilerOptions.outDir = './dist';
            stagingTsConfig.compilerOptions.rootDir = './';
            // sourceFilesToCopyForStaging already contains paths relative to the staging directory root
            stagingTsConfig.include = sourceFilesToCopyForStaging;

            const stagingTsConfigPath = path.join(packCwd, 'tsconfig.json');
            fs.writeFileSync(
                stagingTsConfigPath,
                JSON.stringify(stagingTsConfig, null, indent),
            );
            console.log(
                `Created tsconfig.json in staging: ${stagingTsConfigPath}`,
            );

            // Prepare a minimal package.json for staging BEFORE dependency analysis
            const tempStagingPackageJson: PackageJson = {
                name: finalPackageJsonForPacking.name, // Use name from what will be the final package.json
                version: finalPackageJsonForPacking.version, // Use version from what will be the final package.json
                dependencies: {}, // Start with empty dependencies
                // Include other essential fields if analyzeDependencies relies on them, otherwise keep minimal
            };
            const stagingPackageJsonPath = path.join(packCwd, 'package.json');
            fs.writeFileSync(
                stagingPackageJsonPath,
                JSON.stringify(tempStagingPackageJson, null, indent),
            );
            console.log(
                `Created MINIMAL package.json in staging for dependency analysis: ${stagingPackageJsonPath}`,
            );

            // Now analyze dependencies based on files copied to staging
            finalPackageJsonForPacking.files = pkgJsonFiles.map((f) =>
                f.replace(/\\/g, '/'),
            );

            const detectedDeps = analyzeDependencies({
                projectRoot: packCwd, // Analyze within the staging directory context
                sourceFiles: sourceFilesToCopyForStaging,
            });
            finalPackageJsonForPacking.dependencies = detectedDeps.dependencies;
            if (Object.keys(detectedDeps.peerDependencies).length > 0) {
                finalPackageJsonForPacking.peerDependencies =
                    detectedDeps.peerDependencies;
            }
            // Clean up fields not needed for the published package
            delete finalPackageJsonForPacking.scripts;
            delete finalPackageJsonForPacking.devDependencies;
            delete finalPackageJsonForPacking.main;
            delete finalPackageJsonForPacking.types;

            // Write the FINAL, fully populated package.json to staging, overwriting the minimal one
            fs.writeFileSync(
                stagingPackageJsonPath,
                JSON.stringify(finalPackageJsonForPacking, null, indent),
            );
            console.log(
                `Created FINAL package.json in staging: ${stagingPackageJsonPath}`,
            );

            const readmeFileName = 'README.md';
            const originalReadmePath = path.join(projectRoot, readmeFileName);
            if (
                pkgJsonFiles.includes(readmeFileName)
                && fs.existsSync(originalReadmePath)
            ) {
                fs.copyFileSync(
                    originalReadmePath,
                    path.join(packCwd, readmeFileName),
                );
                console.log(`Copied ${readmeFileName} to staging.`);
            }

            console.log('Building code in staging directory...');
            await execAsync('npx tsc -p tsconfig.json', { cwd: packCwd });
            console.log('Build in staging complete.');

            // If version was updated, write it to the original package.json and run npm version
            // This is done LATE for selective compilation to ensure it's based on success.
            if (newVersion && packageJson.version !== newVersion) {
                console.log(
                    `Finalizing version update in original package.json to ${newVersion}`,
                );
                const originalPackageJson = JSON.parse(
                    fs.readFileSync(
                        path.join(projectRoot, 'package.json'),
                        'utf8',
                    ),
                );
                originalPackageJson.version = newVersion;
                fs.writeFileSync(
                    path.join(projectRoot, 'package.json'),
                    JSON.stringify(originalPackageJson, null, indent),
                );
                // Optionally run npm version if it's desired to also update package-lock.json
                // await execAsync(`npm version ${newVersion} --no-git-tag-version`, { cwd: projectRoot });
            }
        } else {
            // Non-selective compilation path
            packCwd = projectRoot;
            finalPackageJsonForPacking = { ...tempPackageJson }; // tempPackageJson has version and name set
            finalPackageJsonForPacking.files = pkgJsonFiles.map((f) =>
                f.replace(/\\/g, '/'),
            );

            // CRITICAL FIX: Remove main and types for non-selective too if they are problematic
            delete finalPackageJsonForPacking.main;
            delete finalPackageJsonForPacking.types;
            delete finalPackageJsonForPacking.scripts;
            delete finalPackageJsonForPacking.devDependencies;

            // Analyze dependencies for non-selective compilation (can use tsConfigContent.include or all .ts files)
            let sourceFilesForAnalysis: string[] = [];
            if (
                tsConfigContent
                && tsConfigContent.include
                && Array.isArray(tsConfigContent.include)
            ) {
                for (const pattern of tsConfigContent.include) {
                    const matches = glob.sync(pattern, { cwd: projectRoot });
                    sourceFilesForAnalysis.push(...matches);
                }
            } else {
                // Fallback: analyze all .ts files in project root (excluding node_modules)
                sourceFilesForAnalysis = glob.sync('**/*.ts', {
                    cwd: projectRoot,
                    ignore: 'node_modules/**',
                });
            }
            const detectedDeps = analyzeDependencies({
                projectRoot,
                sourceFiles: sourceFilesForAnalysis,
            });
            finalPackageJsonForPacking.dependencies = detectedDeps.dependencies;
            if (Object.keys(detectedDeps.peerDependencies).length > 0) {
                finalPackageJsonForPacking.peerDependencies =
                    detectedDeps.peerDependencies;
            }

            console.log(
                'Creating temporary build configuration for non-selective build...',
            );
            const tempTsConfigPath = path.join(
                projectRoot,
                'temp-tsconfig.json',
            );
            fs.writeFileSync(
                tempTsConfigPath,
                JSON.stringify(tsConfigContent, null, indent),
            );

            console.log(
                `Building ${publishedLibName} code for non-selective build...`,
            );
            await execAsync('npx tsc -p temp-tsconfig.json', {
                cwd: projectRoot,
            });
            try {
                fs.unlinkSync(tempTsConfigPath);
            } catch (e) {
                console.warn('Failed to delete temp-tsconfig.json');
            }

            // If version was updated, write it to the original package.json and run npm version
            if (newVersion && packageJson.version !== newVersion) {
                console.log(
                    `Finalizing version update in original package.json to ${newVersion}`,
                );
                const originalPackageJson = JSON.parse(
                    fs.readFileSync(
                        path.join(projectRoot, 'package.json'),
                        'utf8',
                    ),
                );
                originalPackageJson.version = newVersion;
                fs.writeFileSync(
                    path.join(projectRoot, 'package.json'),
                    JSON.stringify(originalPackageJson, null, indent),
                );
                // await execAsync(`npm version ${newVersion} --no-git-tag-version`, { cwd: projectRoot });
            }

            // Prepare package.json for packing (non-selective)
            const tempPackPackageJsonPath = path.join(
                projectRoot,
                'package.json.packtemp',
            );
            fs.writeFileSync(
                tempPackPackageJsonPath,
                JSON.stringify(finalPackageJsonForPacking, null, indent),
            );

            fs.renameSync(
                packageJsonPath,
                path.join(projectRoot, 'package.json.original'),
            );
            fs.renameSync(tempPackPackageJsonPath, packageJsonPath);
        }

        // Determine tgzFilename based on the final package.json used for packing
        tgzFilename = `${finalPackageJsonForPacking.name.replace('@', '').replace('/', '-')}-${finalPackageJsonForPacking.version}.tgz`;

        console.log('Creating package...');
        const packDestinationDir = path.resolve(projectRoot, outputDest);
        createDirIfNotExists(packDestinationDir); // Ensure outputDest exists

        try {
            await execAsync(
                `npm pack --pack-destination "${packDestinationDir}"`,
                {
                    cwd: packCwd, // This is stagingRoot for selective, projectRoot for non-selective
                },
            );
        } finally {
            if (!selectiveCompilation) {
                // Restore original package.json for non-selective path
                fs.unlinkSync(packageJsonPath); // This is the temporary one
                fs.renameSync(
                    path.join(projectRoot, 'package.json.original'),
                    packageJsonPath,
                );
            }
        }

        const tgzPath = path.join(packDestinationDir, tgzFilename);
        if (!fs.existsSync(tgzPath)) {
            throw new Error(`Package file not found: ${tgzPath}`);
        }

        // copy to target libs directories
        for (const targetLibsDir of targetLibsDirs) {
            console.log(`Copying package to ${targetLibsDir}`);
            fs.copyFileSync(tgzPath, path.join(targetLibsDir, tgzFilename));
        }

        // Clean up temporary dist folder if selective compilation was used
        if (selectiveCompilation && cleanupTempDist) {
            const stagingDir = path.join(
                projectRoot,
                `dist.publish.${publishedLibName}`,
            );
            if (fs.existsSync(stagingDir)) {
                console.log(
                    `Cleaning up temporary staging folder ${path.basename(stagingDir)}...`,
                );
                try {
                    fs.rmSync(stagingDir, { recursive: true, force: true });
                    console.log(`✅ Cleaned up ${path.basename(stagingDir)}`);
                } catch (error) {
                    console.warn(
                        `Failed to clean up ${path.basename(stagingDir)}:`,
                        error,
                    );
                }
            }
        } else if (selectiveCompilation && !cleanupTempDist) {
            const stagingDir = path.join(
                projectRoot,
                `dist.publish.${publishedLibName}`,
            );
            console.log(
                `🔍 Keeping staging folder ${path.basename(stagingDir)} for debugging`,
            );
        }

        console.log('✅ Package published successfully!');
        console.log(`📦 Package: ${tgzFilename}`);
        console.log(`📂 Available in: ${targetLibsDirs}`);

        return packageJson.version;
    } catch (error) {
        console.error('❌ Failed to publish package:', error);
        process.exit(1);
    }
};

const createDirIfNotExists = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
};

/**
 * Analyzes TypeScript files to extract dependencies from import statements
 */
const analyzeDependencies = (options: {
    projectRoot: string;
    includePatterns?: string[];
    excludePatterns?: string[];
    sourceFiles?: string[];
}): DependencyInfo => {
    const {
        projectRoot,
        includePatterns = [],
        excludePatterns = [],
        sourceFiles,
    } = options;

    // Get all files to analyze
    let files: string[] = [];

    if (sourceFiles) {
        // Use provided source files
        files = sourceFiles.map((file) => path.resolve(projectRoot, file));
    } else {
        // Use include patterns to find files
        for (const pattern of includePatterns) {
            const matches = glob.sync(pattern, {
                cwd: projectRoot,
                ignore: excludePatterns,
                absolute: true,
            });
            files.push(...matches);
        }
    }

    // External package imports (not relative)
    const externalImports = new Set<string>();

    // Analyze each file for imports
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');

        // Match all import statements
        // This regex matches various import formats
        const importRegex =
            /import\s+(?:{[^}]*}|\*\s+as\s+[^;]+|[^;]+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            // Only consider non-relative imports (external packages)
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
                // Handle scoped packages and submodules
                const packageName = importPath.startsWith('@')
                    ? importPath.split('/').slice(0, 2).join('/') // @scope/package
                    : importPath.split('/')[0]; // package or package/submodule

                externalImports.add(packageName);
            }
        }
    }

    // Get versions from the project's package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    // Create dependency objects
    const dependencies: Record<string, string> = {};
    const peerDependencies: Record<string, string> = {};

    // Categorize dependencies (framework deps as peer deps)
    const frameworkDeps = ['typescript', 'react', 'vue', 'angular'];

    externalImports.forEach((pkg) => {
        if (allDependencies[pkg]) {
            if (frameworkDeps.some((dep) => pkg.includes(dep))) {
                peerDependencies[pkg] = allDependencies[pkg];
            } else {
                dependencies[pkg] = allDependencies[pkg];
            }
        }
    });

    return { dependencies, peerDependencies };
};

/**
 * Recursively discovers all TypeScript files that need to be included,
 * starting from the include patterns and following local import dependencies
 */
const discoverAllDependencies = (
    includePatterns: string[],
    projectRoot: string,
): string[] => {
    const allFiles = new Set<string>();
    const filesToProcess = new Set<string>();

    // Start with files matching include patterns
    for (const pattern of includePatterns) {
        const matches = glob.sync(pattern, {
            cwd: projectRoot,
            absolute: false,
        });
        matches.forEach((file) => {
            allFiles.add(file);
            filesToProcess.add(file);
        });
    }

    // Process files to find their dependencies
    while (filesToProcess.size > 0) {
        const currentFile = filesToProcess.values().next().value as string;
        filesToProcess.delete(currentFile);

        const fullPath = path.join(projectRoot, currentFile);
        if (!fs.existsSync(fullPath)) {
            continue;
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        // Find all relative imports in this file
        const importRegex =
            /import\s+(?:{[^}]*}|\*\s+as\s+[^;]+|[^;]+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            // Only process relative imports (local files)
            if (importPath.startsWith('.')) {
                // Resolve the import path relative to the current file's directory
                const currentFileDir = path.dirname(currentFile);
                const resolvedImportPath = path.resolve(
                    path.join(projectRoot, currentFileDir),
                    importPath,
                );
                const relativeImportPath = path.relative(
                    projectRoot,
                    resolvedImportPath,
                );

                // Try different extensions
                const possibleExtensions = [
                    '.ts',
                    '.tsx',
                    '.js',
                    '.jsx',
                    '/index.ts',
                    '/index.tsx',
                ];
                let foundFile: string | null = null;

                for (const ext of possibleExtensions) {
                    const testPath = relativeImportPath + ext;
                    const normalizedPath = testPath.replace(/\\/g, '/');

                    if (fs.existsSync(path.join(projectRoot, normalizedPath))) {
                        foundFile = normalizedPath;
                        break;
                    }
                }

                // If we found the file and haven't processed it yet, add it
                if (foundFile && !allFiles.has(foundFile)) {
                    allFiles.add(foundFile);
                    filesToProcess.add(foundFile);
                }
            }
        }
    }

    return Array.from(allFiles);
};
