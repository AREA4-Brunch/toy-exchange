import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { findFilesByPattern } from './common';
import { IClientProject } from './config.interface';

const execAsync = util.promisify(exec);

interface PackageJson {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    files?: string[];
    main?: string;
    types?: string;
    scripts?: Record<string, string>;
    [key: string]: any;
}

interface DependencyInfo {
    dependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
    localDependencies: Record<string, string>;
}

interface VersionInfo {
    version: string;
    filename: string;
    path: string;
}

export type DependencyFormat = 'version' | 'filename' | 'relative' | 'bundled';

export interface IPublishOptions {
    projectRoot: string;
    clientProjects: IClientProject[];
    pkgJsonFiles: string[];
    tsConfigContent: any;
    publishedLibName: string;
    newVersion?: string;
    outputDest?: string;
    selectiveCompilation?: boolean;
    selectiveFiles?: string[]; // New: file patterns for selective compilation
    selectiveIgnorePatterns?: string[];
    cleanupTempDist?: boolean;
    dependencyFormat?: DependencyFormat;
    bundleDependencies?: boolean;
    updateClients?: boolean;
    buildBeforePublish?: boolean;
    libPaths?: string[]; // New: configurable paths to dependency libs
}

export interface ICreatePackageOptions {
    projectRoot: string;
    pkgJsonFiles: string[];
    tsConfigContent: any;
    publishedLibName: string;
    newVersion?: string;
    outputDest?: string;
    selectiveCompilation?: boolean;
    selectiveFiles?: string[];
    selectiveIgnorePatterns?: string[];
    cleanupTempDist?: boolean;
    dependencyFormat?: DependencyFormat;
    bundleDependencies?: boolean;
    buildBeforePublish?: boolean;
    libPaths?: string[];
}

export interface IDistributePackageOptions {
    packageInfo: VersionInfo;
    clientProjects: IClientProject[];
    publishedLibName: string;
    updateClients?: boolean;
}

export interface ICopyPackageOptions {
    packageInfo: VersionInfo;
    destinationDir: string;
    overwrite?: boolean;
}

export const createPackageTgz = async (
    options: ICreatePackageOptions,
): Promise<VersionInfo> => {
    const {
        projectRoot,
        pkgJsonFiles,
        tsConfigContent,
        publishedLibName,
        newVersion,
        outputDest = './_versions',
        selectiveCompilation = false,
        selectiveFiles = [],
        cleanupTempDist = true,
        dependencyFormat = 'bundled',
        bundleDependencies = true,
        buildBeforePublish = true,
        libPaths = [],
        selectiveIgnorePatterns = [],
    } = options;

    try {
        console.log(`📦 Creating package for ${publishedLibName}...`);
        console.log(`📁 Project root: ${projectRoot}`);
        console.log(
            `📦 Compilation mode: ${selectiveCompilation ? 'Selective' : 'Full'}`,
        );
        console.log(`🔗 Dependency format: ${dependencyFormat}`);

        // Initialize directories
        const distDir = path.join(projectRoot, 'dist');
        const outputDir = path.resolve(projectRoot, outputDest);
        const stagingDir = selectiveCompilation
            ? path.join(projectRoot, `staging.${publishedLibName}`)
            : projectRoot;

        createDirIfNotExists(distDir);
        createDirIfNotExists(outputDir);

        // Load and prepare package.json
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`package.json not found at ${packageJsonPath}`);
        }

        const originalPackageJson = loadPackageJson(packageJsonPath);
        const workingPackageJson = { ...originalPackageJson };
        workingPackageJson.name = publishedLibName;

        // Handle version update
        if (newVersion && workingPackageJson.version !== newVersion) {
            console.log(
                `📝 Updating version: ${workingPackageJson.version} → ${newVersion}`,
            );
            workingPackageJson.version = newVersion;
        }

        // Determine files to compile
        let sourceFiles: string[] = [];
        let compilationRoot: string;
        if (selectiveCompilation) {
            console.log(`🎯 Performing selective compilation...`);
            sourceFiles = discoverDependentFiles(
                selectiveFiles.length > 0
                    ? selectiveFiles
                    : tsConfigContent.include || [],
                projectRoot,
                selectiveIgnorePatterns,
            );
            compilationRoot = await setupStagingEnvironment(
                stagingDir,
                sourceFiles,
                projectRoot,
                tsConfigContent,
                workingPackageJson,
            );
        } else {
            console.log(`🌐 Performing full compilation...`);
            sourceFiles = findFilesByPattern(
                tsConfigContent.include?.[0] || '**/*.ts',
                projectRoot,
                ['node_modules/**', 'dist/**'],
            );
            compilationRoot = projectRoot;
        }

        // Analyze dependencies
        console.log(`🔍 Analyzing dependencies...`);
        const dependencyInfo = await analyzeDependencies({
            sourceFiles,
            projectRoot: compilationRoot,
            clientProjects: [], // Empty for package creation step
            dependencyFormat,
            bundleDependencies,
        });

        // Prepare final package.json for publishing
        const publishPackageJson = preparePublishPackageJson(
            workingPackageJson,
            dependencyInfo,
            pkgJsonFiles,
        );

        // Build the project
        if (buildBeforePublish) {
            console.log(`🔨 Building project...`);
            await buildProject(
                compilationRoot,
                tsConfigContent,
                selectiveCompilation,
            );
        }

        // Handle dependency bundling
        if (bundleDependencies && dependencyFormat === 'bundled') {
            console.log(`📦 Bundling dependencies...`);
            await bundleLocalDependencies(
                compilationRoot,
                dependencyInfo.localDependencies,
                [], // Empty for package creation step
                libPaths,
            );
        }

        // Create package
        console.log(`📤 Creating package...`);
        const packageInfo = await createPackage(
            compilationRoot,
            publishPackageJson,
            outputDir,
            selectiveCompilation ? undefined : packageJsonPath,
        );

        // Update original package.json version if needed
        if (newVersion && originalPackageJson.version !== newVersion) {
            const updatedOriginal = {
                ...originalPackageJson,
                version: newVersion,
            };
            savePackageJson(packageJsonPath, updatedOriginal);
        }

        // Cleanup
        if (
            selectiveCompilation
            && cleanupTempDist
            && fs.existsSync(stagingDir)
        ) {
            console.log(`🧹 Cleaning up staging directory...`);
            fs.rmSync(stagingDir, { recursive: true, force: true });
        }

        console.log(
            `✅ Successfully created package ${publishedLibName} v${packageInfo.version}`,
        );
        console.log(`📦 Package: ${packageInfo.filename}`);
        console.log(`📍 Location: ${packageInfo.path}`);

        return packageInfo;
    } catch (error) {
        console.error(
            `❌ Failed to create package ${publishedLibName}:`,
            error,
        );
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        throw error;
    }
};

export const distributePackage = async (
    options: IDistributePackageOptions,
): Promise<void> => {
    const {
        packageInfo,
        clientProjects,
        publishedLibName,
        updateClients = true,
    } = options;

    try {
        if (!updateClients) {
            console.log(`⏭️ Skipping client updates as requested`);
            return;
        }

        console.log(
            `🔄 Distributing ${publishedLibName} to client projects...`,
        );

        // Initialize client libs directories
        for (const client of clientProjects) {
            createDirIfNotExists(client.targetLibsDir);
        }

        // Distribute to client projects
        await distributeToClients(
            packageInfo,
            clientProjects,
            publishedLibName,
        );

        console.log(
            `✅ Successfully distributed ${publishedLibName} v${packageInfo.version}`,
        );
    } catch (error) {
        console.error(`❌ Failed to distribute ${publishedLibName}:`, error);
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        throw error;
    }
};

export const publish = async (options: IPublishOptions): Promise<string> => {
    const { clientProjects, updateClients = true, ...createOptions } = options;

    try {
        console.log(`🚀 Publishing ${options.publishedLibName}...`);

        // Step 1: Create the package
        const packageInfo = await createPackageTgz(createOptions);

        // Step 2: Distribute the package
        await distributePackage({
            packageInfo,
            clientProjects,
            publishedLibName: options.publishedLibName,
            updateClients,
        });

        console.log(
            `✅ Successfully published ${options.publishedLibName} v${packageInfo.version}`,
        );

        return packageInfo.version;
    } catch (error) {
        console.error(
            `❌ Failed to publish ${options.publishedLibName}:`,
            error,
        );
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        throw error;
    }
};

export const copyPackageToDirectory = async (
    options: ICopyPackageOptions,
): Promise<VersionInfo> => {
    const { packageInfo, destinationDir, overwrite = true } = options;

    try {
        console.log(`📁 Copying package to ${destinationDir}...`);

        createDirIfNotExists(destinationDir);

        const destinationPath = path.join(destinationDir, packageInfo.filename);

        // Check if file exists and handle overwrite
        if (fs.existsSync(destinationPath) && !overwrite) {
            console.log(
                `⚠️ Package already exists at ${destinationPath}, skipping copy`,
            );
            return {
                ...packageInfo,
                path: destinationPath,
            };
        }

        fs.copyFileSync(packageInfo.path, destinationPath);
        console.log(`✅ Successfully copied package to ${destinationPath}`);

        return {
            ...packageInfo,
            path: destinationPath,
        };
    } catch (error) {
        console.error(`❌ Failed to copy package to ${destinationDir}:`, error);
        throw error;
    }
};

// Helper Functions

const createDirIfNotExists = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
};

const loadPackageJson = (packageJsonPath: string): PackageJson => {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(content);
};

const savePackageJson = (
    packageJsonPath: string,
    packageJson: PackageJson,
): void => {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const indentMatch = content.match(/\n(\s+)"/);
    const indent = indentMatch ? indentMatch[1].length : 2;

    fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, indent) + '\n',
    );
};

const discoverDependentFiles = (
    includePatterns: string[],
    projectRoot: string,
    ignorePatterns: string[] = [],
): string[] => {
    const allFiles = new Set<string>();
    const toProcess = new Set<string>();

    console.log(`🔍 Discovering files with patterns:`, includePatterns);

    // Start with files matching include patterns
    for (const pattern of includePatterns) {
        console.log(`  📁 Processing pattern: ${pattern}`);
        const matches = findFilesByPattern(
            pattern,
            projectRoot,
            ignorePatterns,
        );
        if (matches.length === 0) {
            console.warn(`  ⚠️ No files found for pattern: ${pattern}`);
        } else {
            console.log(
                `  ✅ Found ${matches.length} files for pattern: ${pattern}`,
            );
        }

        matches.forEach((file) => {
            allFiles.add(file);
            toProcess.add(file);
        });
    }

    if (allFiles.size === 0) {
        console.warn(
            `⚠️ No files found for any include patterns. Check your patterns and file paths.`,
        );
        return [];
    }

    console.log(`📋 Starting with ${allFiles.size} initial files`);

    // Recursively find dependencies
    while (toProcess.size > 0) {
        const currentFile = toProcess.values().next().value;
        if (!currentFile) {
            break;
        }
        toProcess.delete(currentFile);

        const fullPath = path.join(projectRoot, currentFile);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ File not found: ${fullPath}`);
            continue;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const importRegex = /import\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            if (importPath.startsWith('.')) {
                const resolvedPath = resolveImportPath(
                    importPath,
                    path.dirname(currentFile),
                    projectRoot,
                );

                if (resolvedPath && !allFiles.has(resolvedPath)) {
                    allFiles.add(resolvedPath);
                    toProcess.add(resolvedPath);
                }
            }
        }
    }

    const finalFiles = Array.from(allFiles);
    console.log(`📊 Final file count: ${finalFiles.length}`);
    return finalFiles;
};

const resolveImportPath = (
    importPath: string,
    currentDir: string,
    projectRoot: string,
): string | null => {
    const resolvedDir = path.resolve(projectRoot, currentDir, importPath);
    const relativePath = path.relative(projectRoot, resolvedDir);

    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const indexFiles = extensions.map((ext) => `/index${ext}`);

    // Try direct file with extensions
    for (const ext of extensions) {
        const testPath = relativePath + ext;
        if (fs.existsSync(path.join(projectRoot, testPath))) {
            return testPath.replace(/\\/g, '/');
        }
    }

    // Try index files
    for (const indexFile of indexFiles) {
        const testPath = relativePath + indexFile;
        if (fs.existsSync(path.join(projectRoot, testPath))) {
            return testPath.replace(/\\/g, '/');
        }
    }
    return null;
};

const setupStagingEnvironment = async (
    stagingDir: string,
    sourceFiles: string[],
    projectRoot: string,
    tsConfigContent: any,
    packageJson: PackageJson,
): Promise<string> => {
    // Clean and create staging directory
    if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
    }
    fs.mkdirSync(stagingDir, { recursive: true });

    // Copy source files
    for (const file of sourceFiles) {
        const sourcePath = path.join(projectRoot, file);
        const destPath = path.join(stagingDir, file);
        const destDir = path.dirname(destPath);

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(sourcePath, destPath);
    } // Create staging tsconfig.json
    const stagingTsConfig = {
        ...tsConfigContent,
        compilerOptions: {
            ...tsConfigContent.compilerOptions,
            outDir: './dist',
            rootDir: './',
        },
        include: sourceFiles.map((file) => `./${file}`), // Use copied source files as include
        exclude: ['./dist/**/*', './node_modules/**/*'],
    };
    delete stagingTsConfig.extends;

    fs.writeFileSync(
        path.join(stagingDir, 'tsconfig.json'),
        JSON.stringify(stagingTsConfig, null, 2),
    );

    // Create minimal package.json for staging
    const stagingPackageJson = {
        name: packageJson.name,
        version: packageJson.version,
        dependencies: {},
    };

    fs.writeFileSync(
        path.join(stagingDir, 'package.json'),
        JSON.stringify(stagingPackageJson, null, 2),
    );

    // Copy README if needed
    const readmePath = path.join(projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
        fs.copyFileSync(readmePath, path.join(stagingDir, 'README.md'));
    }

    return stagingDir;
};

const analyzeDependencies = async (options: {
    sourceFiles: string[];
    projectRoot: string;
    clientProjects: IClientProject[];
    dependencyFormat: DependencyFormat;
    bundleDependencies: boolean;
}): Promise<DependencyInfo> => {
    const { sourceFiles, projectRoot, clientProjects, dependencyFormat } =
        options;

    const externalImports = new Set<string>();
    const localDependencies: Record<string, string> = {};

    // Analyze imports in source files
    for (const file of sourceFiles) {
        const fullPath = path.join(projectRoot, file);
        const content = fs.readFileSync(fullPath, 'utf8');

        const importRegex = /import\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            const importPath = match[1];

            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
                const packageName = importPath.startsWith('@')
                    ? importPath.split('/').slice(0, 2).join('/')
                    : importPath.split('/')[0];

                externalImports.add(packageName);
            }
        }
    }

    // Load existing dependencies from package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = loadPackageJson(packageJsonPath);

    const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    // Categorize dependencies
    const dependencies: Record<string, string> = {};
    const peerDependencies: Record<string, string> =
        packageJson.peerDependencies || {};

    const frameworkDeps = ['typescript', 'react', 'vue', 'angular', '@types'];

    for (const pkg of externalImports) {
        if (allDependencies[pkg]) {
            const isFramework = frameworkDeps.some((fw) => pkg.includes(fw));

            if (isFramework) {
                peerDependencies[pkg] = allDependencies[pkg];
            } else {
                const depValue = allDependencies[pkg];

                if (depValue.startsWith('file:')) {
                    // Handle local dependencies based on format
                    localDependencies[pkg] = formatLocalDependency(
                        pkg,
                        depValue,
                        dependencyFormat,
                        clientProjects,
                    );
                } else {
                    dependencies[pkg] = depValue;
                }
            }
        }
    }

    return {
        dependencies: { ...dependencies, ...localDependencies },
        peerDependencies,
        localDependencies,
    };
};

const formatLocalDependency = (
    packageName: string,
    originalValue: string,
    format: DependencyFormat,
    clientProjects: IClientProject[],
): string => {
    const filePath = originalValue.substring(5); // Remove 'file:' prefix

    switch (format) {
        case 'version':
            // Extract version from filename
            const versionMatch = filePath.match(
                /-(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)\.tgz$/,
            );
            return versionMatch ? versionMatch[1] : '1.0.0';

        case 'filename':
            // Just the filename
            return path.basename(filePath);

        case 'relative':
            // Keep original relative path
            return originalValue;

        case 'bundled':
            // Reference to bundled location
            const filename = path.basename(filePath);
            return `file:./${filename}`;

        default:
            return originalValue;
    }
};

const buildProject = async (
    projectRoot: string,
    tsConfigContent: any,
    isStaging: boolean,
): Promise<void> => {
    if (isStaging) {
        // Build using staging tsconfig
        await execAsync('npx tsc -p tsconfig.json', { cwd: projectRoot });
    } else {
        // Create temporary tsconfig for non-staging build
        const tempTsConfigPath = path.join(projectRoot, 'temp-tsconfig.json');
        fs.writeFileSync(
            tempTsConfigPath,
            JSON.stringify(tsConfigContent, null, 2),
        );

        try {
            await execAsync('npx tsc -p temp-tsconfig.json', {
                cwd: projectRoot,
            });
        } finally {
            if (fs.existsSync(tempTsConfigPath)) {
                fs.unlinkSync(tempTsConfigPath);
            }
        }
    }
};

const bundleLocalDependencies = async (
    projectRoot: string,
    localDependencies: Record<string, string>,
    clientProjects: IClientProject[],
    libPaths: string[] = [],
): Promise<void> => {
    const libsDir = path.join(projectRoot, 'libs');
    createDirIfNotExists(libsDir);

    for (const [packageName, depPath] of Object.entries(localDependencies)) {
        if (depPath.startsWith('file:./')) {
            const filename = depPath.substring(7); // Remove 'file:./'

            if (filename.endsWith('.tgz')) {
                // Find source file using configurable lib paths or fallback to client libs directories
                let sourceFound = false;

                // First, check libPaths if provided
                for (const libPath of libPaths) {
                    const resolvedFiles = resolveLibPath(libPath, filename);
                    for (const resolvedFile of resolvedFiles) {
                        if (fs.existsSync(resolvedFile)) {
                            const destPath = path.join(libsDir, filename);
                            fs.copyFileSync(resolvedFile, destPath);
                            console.log(
                                `📦 Bundled ${packageName}: ${filename} from ${resolvedFile}`,
                            );
                            sourceFound = true;
                            break;
                        }
                    }
                    if (sourceFound) break;
                }

                // Fallback to client libs directories if not found in libPaths
                if (!sourceFound) {
                    for (const client of clientProjects) {
                        const sourcePath = path.join(
                            client.targetLibsDir,
                            filename,
                        );
                        if (fs.existsSync(sourcePath)) {
                            const destPath = path.join(libsDir, filename);
                            fs.copyFileSync(sourcePath, destPath);
                            console.log(
                                `📦 Bundled ${packageName}: ${filename} from client ${client.name}`,
                            );
                            sourceFound = true;
                            break;
                        }
                    }
                }

                if (!sourceFound) {
                    console.warn(
                        `⚠️ Could not find dependency file: ${filename}`,
                    );
                }
            }
        }
    }
};

// Helper function to resolve lib paths and patterns
const resolveLibPath = (libPath: string, filename: string): string[] => {
    const resolvedPaths: string[] = [];

    if (libPath.includes('*')) {
        // Handle pattern like 'dir/with/libs/*.tgz'
        const dirPath = path.dirname(libPath);
        const pattern = path.basename(libPath);

        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            try {
                const files = fs.readdirSync(dirPath);
                const regex = new RegExp(
                    pattern.replace(/\*/g, '.*').replace(/\./g, '\\.'),
                );

                for (const file of files) {
                    if (regex.test(file) && file === filename) {
                        resolvedPaths.push(path.join(dirPath, file));
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Could not read directory: ${dirPath}`);
            }
        }
    } else {
        // Handle direct file path like 'path/to-single.tgz'
        if (path.basename(libPath) === filename) {
            resolvedPaths.push(libPath);
        } else if (
            fs.existsSync(libPath)
            && fs.statSync(libPath).isDirectory()
        ) {
            // If it's a directory, look for the filename inside
            const possiblePath = path.join(libPath, filename);
            if (fs.existsSync(possiblePath)) {
                resolvedPaths.push(possiblePath);
            }
        }
    }

    return resolvedPaths;
};

const preparePublishPackageJson = (
    basePackageJson: PackageJson,
    dependencyInfo: DependencyInfo,
    files: string[],
): PackageJson => {
    const publishPackageJson: PackageJson = {
        name: basePackageJson.name,
        version: basePackageJson.version,
        files: files.map((f) => f.replace(/\\/g, '/')),
        dependencies: dependencyInfo.dependencies,
    };

    if (Object.keys(dependencyInfo.peerDependencies).length > 0) {
        publishPackageJson.peerDependencies = dependencyInfo.peerDependencies;
    }

    // Copy essential fields if they exist
    if (basePackageJson.description)
        publishPackageJson.description = basePackageJson.description;
    if (basePackageJson.author)
        publishPackageJson.author = basePackageJson.author;
    if (basePackageJson.license)
        publishPackageJson.license = basePackageJson.license;
    if (basePackageJson.repository)
        publishPackageJson.repository = basePackageJson.repository;
    if (basePackageJson.keywords)
        publishPackageJson.keywords = basePackageJson.keywords;

    return publishPackageJson;
};

const createPackage = async (
    projectRoot: string,
    packageJson: PackageJson,
    outputDir: string,
    originalPackageJsonPath?: string,
): Promise<VersionInfo> => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    let originalBackupPath: string | null = null;
    let originalContent: string | null = null;
    let needsRestore = false;

    try {
        // Check if we need to temporarily modify package.json
        // This happens for non-staging builds where we need to modify the original package.json
        if (
            originalPackageJsonPath
            && originalPackageJsonPath === packageJsonPath
        ) {
            // Read and backup original content
            originalContent = fs.readFileSync(packageJsonPath, 'utf8');
            originalBackupPath = packageJsonPath + '.backup';

            // Create backup file
            fs.writeFileSync(originalBackupPath, originalContent);
            needsRestore = true;

            console.log(
                `📝 Backing up original package.json and updating for packing`,
            );
        }

        // Write the package.json for packing (either to staging or overwrite original)
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Create the package
        console.log(`📦 Running npm pack in ${projectRoot}`);
        await execAsync(`npm pack --pack-destination "${outputDir}"`, {
            cwd: projectRoot,
        });

        const filename = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
        const packagePath = path.join(outputDir, filename);

        if (!fs.existsSync(packagePath)) {
            throw new Error(`Package file not found: ${packagePath}`);
        }

        return {
            version: packageJson.version,
            filename,
            path: packagePath,
        };
    } finally {
        // Restore original package.json if we modified it
        if (needsRestore && originalContent) {
            try {
                fs.writeFileSync(packageJsonPath, originalContent);
                console.log(`✅ Restored original package.json`);

                // Clean up backup file
                if (originalBackupPath && fs.existsSync(originalBackupPath)) {
                    fs.unlinkSync(originalBackupPath);
                }
            } catch (restoreError) {
                console.error(
                    `❌ Failed to restore original package.json:`,
                    restoreError,
                );

                // Try restoring from backup file as fallback
                if (originalBackupPath && fs.existsSync(originalBackupPath)) {
                    try {
                        fs.copyFileSync(originalBackupPath, packageJsonPath);
                        console.log(
                            `✅ Restored package.json from backup file`,
                        );
                    } catch (backupRestoreError) {
                        console.error(
                            `❌ Critical: Could not restore package.json. Backup available at: ${originalBackupPath}`,
                        );
                    }
                } else {
                    console.error(
                        `❌ Critical: No backup available to restore package.json`,
                    );
                }
            }
        }
    }
};

const distributeToClients = async (
    packageInfo: VersionInfo,
    clientProjects: IClientProject[],
    publishedLibName: string,
): Promise<void> => {
    for (const client of clientProjects) {
        try {
            console.log(`📂 Updating ${client.name}...`);

            const targetPath = path.join(
                client.targetLibsDir,
                packageInfo.filename,
            );
            fs.copyFileSync(packageInfo.path, targetPath);
            console.log(`   📦 Copied package to ${targetPath}`);

            // Update client's package.json if it exists and uses this package
            if (fs.existsSync(client.packageJsonPath)) {
                await updateClientPackageJson(
                    client,
                    publishedLibName,
                    packageInfo,
                    targetPath,
                );
            }

            // Clean up old versions
            await cleanupOldVersions(
                client.targetLibsDir,
                publishedLibName,
                packageInfo.version,
            );
        } catch (error) {
            console.error(`   ❌ Failed to update ${client.name}:`, error);
        }
    }
};

const updateClientPackageJson = async (
    client: IClientProject,
    packageName: string,
    packageInfo: VersionInfo,
    targetPath: string,
): Promise<void> => {
    const packageJson = loadPackageJson(client.packageJsonPath);
    const allDeps = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
    };

    if (!allDeps[packageName]) {
        console.log(`   ⏭️ ${client.name} doesn't use ${packageName}`);
        return;
    }

    // Determine which dependency section to update
    const isInDependencies = packageJson.dependencies?.[packageName];
    const depSection = isInDependencies ? 'dependencies' : 'devDependencies';

    // Update dependency reference
    const relativePath = path
        .relative(client.projectPath, targetPath)
        .replace(/\\/g, '/');
    packageJson[depSection] = { ...packageJson[depSection] };
    packageJson[depSection][packageName] = `file:${relativePath}`;

    savePackageJson(client.packageJsonPath, packageJson);
    console.log(`   ✏️ Updated package.json dependency reference`);

    // Run npm install based on update strategy
    if (client.updateStrategy === 'install') {
        await execAsync(`npm install`, { cwd: client.projectPath });
        console.log(`   🔄 Ran npm install`);
    } else {
        await execAsync(`npm update ${packageName}`, {
            cwd: client.projectPath,
        });
        console.log(`   🔄 Ran npm update`);
    }
};

const cleanupOldVersions = async (
    libsDir: string,
    packageName: string,
    currentVersion: string,
): Promise<void> => {
    try {
        const files = fs.readdirSync(libsDir);
        const oldFiles = files.filter(
            (file) =>
                file.startsWith(`${packageName}-`)
                && file.endsWith('.tgz')
                && !file.includes(`-${currentVersion}.tgz`),
        );

        for (const oldFile of oldFiles) {
            fs.unlinkSync(path.join(libsDir, oldFile));
            console.log(`   🗑️ Removed old version: ${oldFile}`);
        }
    } catch (error) {
        console.warn(`   ⚠️ Failed to cleanup old versions:`, error);
    }
};
