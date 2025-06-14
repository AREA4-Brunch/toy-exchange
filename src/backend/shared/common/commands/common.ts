import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';

export const findFilesByPattern = (
    pattern: string,
    rootDir: string,
    ignorePatterns: string[] = [],
): string[] => {
    try {
        const results = fg.sync(pattern, {
            cwd: rootDir,
            ignore: ignorePatterns,
            onlyFiles: true,
        });

        console.log(`🔍 Pattern: ${pattern} found ${results.length} files`);
        return results;
    } catch (error) {
        console.error(`❌ Error finding files with pattern ${pattern}:`, error);
        return [];
    }
};

export interface SetupStagingOptions {
    stagingDir: string;
    sourceFiles: string[];
    projectRoot: string;
    originalTsConfigPath?: string;
    tsConfigTemplate?: any;
    outputDir?: string;
    packageJson?: any;
}

export const setupStagingEnvironment = async (
    options: SetupStagingOptions,
): Promise<string> => {
    const {
        stagingDir,
        sourceFiles,
        projectRoot,
        originalTsConfigPath,
        tsConfigTemplate,
        outputDir = './dist',
        packageJson,
    } = options;

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
    }

    // Check if original tsconfig exists and use it as base
    let baseTsConfig: any = {};

    if (originalTsConfigPath && fs.existsSync(originalTsConfigPath)) {
        try {
            const tsConfigContent = fs.readFileSync(
                originalTsConfigPath,
                'utf8',
            );

            // Parse JSON with comments (JSONC format)
            const parseJSONC = (content: string): any => {
                // Remove single-line comments
                let cleaned = content.replace(/\/\/.*$/gm, '');
                // Remove multi-line comments
                cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
                // Remove trailing commas
                cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
                return JSON.parse(cleaned);
            };

            baseTsConfig = parseJSONC(tsConfigContent);
            console.log(`✅ Successfully parsed original tsconfig.json`);
        } catch (error: any) {
            console.warn(
                `⚠️ Failed to parse original tsconfig.json: ${error.message}`,
            );
            console.warn(`📍 File path: ${originalTsConfigPath}`);
            console.warn(`📄 Using defaults instead`);
        }
    } else if (originalTsConfigPath) {
        console.warn(
            `⚠️ Original tsconfig.json not found at: ${originalTsConfigPath}`,
        );
    }

    // Create staging tsconfig.json with proper Node.js and decorator support
    const defaultTsConfig = {
        compilerOptions: {
            target: 'ES2020',
            module: 'commonjs',
            lib: ['ES2020'],
            outDir: outputDir,
            rootDir: './',
            declaration: true,
            strict: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            resolveJsonModule: true,
            allowJs: true,
            moduleResolution: 'node',
            types: ['node'],
        },
        include: sourceFiles.map((file) => `./${file}`),
        exclude: [`${outputDir}/**/*`, './node_modules/**/*'],
    };

    const stagingTsConfig = tsConfigTemplate
        ? {
              ...baseTsConfig,
              ...tsConfigTemplate,
              compilerOptions: {
                  ...baseTsConfig.compilerOptions,
                  ...tsConfigTemplate.compilerOptions,
                  outDir: outputDir,
                  rootDir: './',
                  experimentalDecorators: true,
                  emitDecoratorMetadata: true,
                  allowSyntheticDefaultImports: true,
                  esModuleInterop: true,
                  skipLibCheck: true,
              },
              include: sourceFiles.map((file) => `./${file}`),
              exclude: [`${outputDir}/**/*`, './node_modules/**/*'],
          }
        : {
              ...baseTsConfig,
              compilerOptions: {
                  ...baseTsConfig.compilerOptions,
                  ...defaultTsConfig.compilerOptions,
              },
              include: defaultTsConfig.include,
              exclude: defaultTsConfig.exclude,
          };

    // Remove extends if it exists (doesn't work in staging)
    delete stagingTsConfig.extends;

    // Copy node_modules if it exists (for type definitions)
    const originalNodeModules = path.join(projectRoot, 'node_modules');
    const stagingNodeModules = path.join(stagingDir, 'node_modules');

    if (fs.existsSync(originalNodeModules)) {
        console.log(`📦 Creating symlink to node_modules...`);
        try {
            // Create symlink to avoid copying entire node_modules
            fs.symlinkSync(originalNodeModules, stagingNodeModules, 'junction');
        } catch (error) {
            console.warn(`⚠️ Failed to create node_modules symlink:`, error);
        }
    }

    // Copy or create package.json for type resolution
    if (packageJson) {
        // Create minimal package.json for staging (publish.ts usage)
        const stagingPackageJson = {
            name: packageJson.name,
            version: packageJson.version,
            dependencies: {},
        };
        fs.writeFileSync(
            path.join(stagingDir, 'package.json'),
            JSON.stringify(stagingPackageJson, null, 2),
        );
    } else {
        // Copy existing package.json (selective-compile.ts usage)
        const originalPackageJson = path.join(projectRoot, 'package.json');
        if (fs.existsSync(originalPackageJson)) {
            fs.copyFileSync(
                originalPackageJson,
                path.join(stagingDir, 'package.json'),
            );
        }
    }

    // Copy README if needed
    const readmePath = path.join(projectRoot, 'README.md');
    if (fs.existsSync(readmePath)) {
        fs.copyFileSync(readmePath, path.join(stagingDir, 'README.md'));
    }

    fs.writeFileSync(
        path.join(stagingDir, 'tsconfig.json'),
        JSON.stringify(stagingTsConfig, null, 2),
    );

    console.log(`📋 Created staging tsconfig.json with decorator support`);
    return stagingDir;
};
