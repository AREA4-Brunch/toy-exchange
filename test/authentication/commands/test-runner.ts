import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import defaultConfig from '../config/default.config';
import { ITestsRunnerConfig } from '../shared/config.interface';
import { initializeServerConfig, killServer, startServer, waitForServer } from '../shared/server';

/**
 * Command line options
 */
interface CommandLineOptions {
    watchMode: boolean;
    coverage: boolean;
}

/**
 * Parse command line arguments
 * @returns Object containing parsed options
 */
const parseArguments = (): CommandLineOptions => {
    const args = process.argv.slice(2);
    return {
        watchMode: args.includes('--watch'),
        coverage: args.includes('--coverage'),
    };
};

/**
 * Get the appropriate command and arguments for running a binary across platforms
 * @param binaryPath Path to the binary
 * @param args Arguments to pass to the binary
 * @returns Object with command and args properties
 */
const getCommandForBinary = (
    binaryPath: string,
    args: string[],
): { command: string; args: string[] } => {
    if (process.platform === 'win32') {
        return {
            command: 'cmd',
            args: ['/c', binaryPath, ...args],
        };
    } else {
        return {
            command: binaryPath,
            args,
        };
    }
};

/**
 * Try running tests with the vitest binary
 * @param config Configuration object
 * @param testArgs Arguments for vitest
 * @param options Command line options
 * @param server Server process
 * @returns True if successful, false if vitest binary not found
 */
const tryRunningWithVitestBinary = async (
    config: ITestsRunnerConfig,
    testArgs: string[],
    options: CommandLineOptions,
    server: ChildProcess,
    port: number,
): Promise<boolean> => {
    // Find vitest executable
    const vitestBin = path.join(
        config.testDir,
        'node_modules',
        '.bin',
        process.platform === 'win32' ? 'vitest.cmd' : 'vitest',
    );

    if (!fs.existsSync(vitestBin)) {
        return false;
    }

    console.info(`Using vitest at: ${vitestBin}`);

    // Platform-independent way to run the binary
    const { command, args } = getCommandForBinary(vitestBin, testArgs);
    console.info(`Running command: ${command} ${args.join(' ')}`);

    return new Promise<boolean>((resolve) => {
        const tests = spawn(command, args, {
            cwd: config.testDir,
            env: process.env,
            stdio: 'inherit',
        });

        tests.on('error', async (err) => {
            console.error('Failed to start tests:', err);
            await killServer(server, port);
            process.exit(1);
        });

        tests.on('exit', async (code) => {
            console.info(`Tests completed with exit code: ${code}`);

            if (!options.watchMode) {
                await killServer(server, port);
                process.exit(code || 0);
            }

            resolve(true);
        });
    });
};

/**
 * Try running tests with the vitest module directly
 * @param config Configuration object
 * @param testArgs Arguments for vitest
 * @param options Command line options
 * @param server Server process
 * @returns True if successful, false if vitest module not found
 */
const tryRunningWithVitestModule = async (
    config: ITestsRunnerConfig,
    testArgs: string[],
    options: CommandLineOptions,
    server: ChildProcess,
    port: number,
): Promise<boolean> => {
    console.info('Vitest binary not found, using fallback approach');
    const vitestPath = path.resolve(config.testDir, 'node_modules', 'vitest', 'dist', 'cli.mjs');

    if (!fs.existsSync(vitestPath)) {
        return false;
    }

    return new Promise<boolean>((resolve) => {
        const tests = spawn(process.execPath, [vitestPath, ...testArgs], {
            cwd: config.testDir,
            env: process.env,
            stdio: 'inherit',
        });

        tests.on('error', async (err) => {
            console.error('Failed to start tests with fallback:', err);
            await killServer(server, port);
            process.exit(1);
        });

        tests.on('exit', async (code) => {
            console.info(`Tests completed with exit code: ${code}`);

            if (!options.watchMode) {
                await killServer(server, port);
                process.exit(code || 0);
            }

            resolve(true);
        });
    });
};

/**
 * Run the tests
 * @param config Configuration object
 * @param options Command line options
 * @param server Server process
 */
const runTests = async (
    config: ITestsRunnerConfig,
    options: CommandLineOptions,
    server: ChildProcess,
    port: number,
): Promise<void> => {
    console.info('Server is ready! Running tests...');

    // Build the test command based on arguments
    const testArgs: string[] = [];
    if (options.watchMode) {
        testArgs.push('--watch');
    } else if (options.coverage) {
        testArgs.push('run', '--coverage');
    } else {
        testArgs.push('run');
    }

    // Try to run tests using the vitest binary
    const success =
        (await tryRunningWithVitestBinary(config, testArgs, options, server, port))
        || (await tryRunningWithVitestModule(config, testArgs, options, server, port));

    if (!success) {
        console.error('Could not find vitest. Make sure it is installed.');
        await killServer(server, port);
        process.exit(1);
    }
};

const initializeTestConfig = (): ITestsRunnerConfig => {
    const config: ITestsRunnerConfig = defaultConfig.runnerScript.tests;
    process.env.TEST_CONFIG = config.testConfigPath;
    console.info(`Test config path: ${config.testConfigPath}`);
    return config;
};

/**
 * Main function that orchestrates the test running process
 */
const main = async (): Promise<void> => {
    try {
        console.info('Starting test runner...');
        const options = parseArguments();

        const serverConfig = initializeServerConfig();
        console.info(`Server directory: ${serverConfig.serverDir}`);
        const server = startServer(serverConfig);
        await waitForServer(serverConfig);

        const runnerConfig = initializeTestConfig();
        console.info(`Test directory: ${runnerConfig.testDir}`);
        await runTests(runnerConfig, options, server, serverConfig.port);
    } catch (error) {
        console.error('Error in test runner:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    main();
}
