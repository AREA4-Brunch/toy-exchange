import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { findFilesByPattern, setupStagingEnvironment } from './common';

const execAsync = util.promisify(exec);

interface SelectiveCompileOptions {
    projectRoot: string;
    selectiveFiles: string[];
    ignorePatterns?: string[];
    outputDir?: string;
    tsConfigTemplate?: any;
    cleanupAfter?: boolean;
}

export const selectiveCompile = async (
    options: SelectiveCompileOptions,
): Promise<void> => {
    const {
        projectRoot,
        selectiveFiles,
        ignorePatterns = ['node_modules/**', 'dist/**'],
        outputDir = './dist',
        tsConfigTemplate,
        cleanupAfter = true,
    } = options;

    const stagingDir = path.join(projectRoot, 'staging.selective-compile');

    try {
        console.log(`🎯 Starting selective compilation...`);
        console.log(`📁 Project root: ${projectRoot}`);
        console.log(`📋 Patterns: ${selectiveFiles.join(', ')}`);

        // Discover all dependent files
        const sourceFiles = discoverDependentFiles(
            selectiveFiles,
            projectRoot,
            ignorePatterns,
        );

        if (sourceFiles.length === 0) {
            throw new Error('No files found for compilation');
        }

        // Setup staging environment
        const originalTsConfigPath = path.join(projectRoot, 'tsconfig.json');
        const compilationRoot = await setupStagingEnvironment({
            stagingDir,
            sourceFiles,
            projectRoot,
            originalTsConfigPath,
            tsConfigTemplate,
            outputDir,
        });

        // Compile the project
        console.log(`🔨 Compiling ${sourceFiles.length} files...`);

        // Use absolute path to TypeScript compiler for Windows compatibility
        const isWindows = process.platform === 'win32';
        const tscCmd = isWindows ? 'tsc.cmd' : 'tsc';
        const tscPath = path.join(projectRoot, 'node_modules', '.bin', tscCmd);

        await execAsync(`"${tscPath}" -p tsconfig.json`, {
            cwd: compilationRoot,
        });

        // Copy compiled files back to original project
        const stagingDistDir = path.join(stagingDir, outputDir);
        const targetDistDir = path.resolve(projectRoot, outputDir);

        if (fs.existsSync(stagingDistDir)) {
            await copyCompiledFiles(stagingDistDir, targetDistDir);
            console.log(`✅ Compiled files copied to ${targetDistDir}`);
        }

        console.log(`✅ Selective compilation completed successfully`);
    } catch (error) {
        console.error(`❌ Selective compilation failed:`, error);
        throw error;
    } finally {
        // Cleanup staging directory
        if (cleanupAfter && fs.existsSync(stagingDir)) {
            console.log(`🧹 Cleaning up staging directory...`);
            fs.rmSync(stagingDir, { recursive: true, force: true });
        }
    }
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

const copyCompiledFiles = async (
    sourceDir: string,
    targetDir: string,
): Promise<void> => {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const copyRecursive = (src: string, dest: string) => {
        const stats = fs.statSync(src);

        if (stats.isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            const entries = fs.readdirSync(src);
            for (const entry of entries) {
                copyRecursive(path.join(src, entry), path.join(dest, entry));
            }
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    copyRecursive(sourceDir, targetDir);
};

// CLI interface for standalone usage
export const runSelectiveCompile = async () => {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        console.log(`
🎯 Selective TypeScript Compiler

Usage: node selective-compile.js [options] <patterns...>

Options:
  --root <path>           Project root directory (default: current directory)
  --output <path>         Output directory (default: ./dist)
  --ignore <patterns>     Comma-separated ignore patterns
  --no-cleanup           Don't cleanup staging directory
  --tsconfig <path>       Path to tsconfig.json template
  --help, -h             Show this help

Examples:
  node selective-compile.js "src/**/*.interface.ts"
  node selective-compile.js --root ./auth --output ./build "**/*.service.ts"
  node selective-compile.js --ignore "test/**,spec/**" "src/login/**/*.ts"
        `);
        return;
    }

    const options: SelectiveCompileOptions = {
        projectRoot: process.cwd(),
        selectiveFiles: [],
        ignorePatterns: ['node_modules/**', 'dist/**'],
        outputDir: './dist',
        cleanupAfter: true,
    };

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--root' && i + 1 < args.length) {
            options.projectRoot = path.resolve(args[++i]);
        } else if (arg === '--output' && i + 1 < args.length) {
            options.outputDir = args[++i];
        } else if (arg === '--ignore' && i + 1 < args.length) {
            options.ignorePatterns = [
                ...(options.ignorePatterns || []),
                ...args[++i].split(','),
            ];
        } else if (arg === '--no-cleanup') {
            options.cleanupAfter = false;
        } else if (arg === '--tsconfig' && i + 1 < args.length) {
            const tsConfigPath = path.resolve(args[++i]);
            if (fs.existsSync(tsConfigPath)) {
                options.tsConfigTemplate = JSON.parse(
                    fs.readFileSync(tsConfigPath, 'utf8'),
                );
            }
        } else if (!arg.startsWith('--')) {
            options.selectiveFiles.push(arg);
        }
    }

    if (options.selectiveFiles.length === 0) {
        console.error('❌ No file patterns provided');
        process.exit(1);
    }

    try {
        await selectiveCompile(options);
        process.exit(0);
    } catch (error) {
        console.error('❌ Compilation failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    runSelectiveCompile();
}
