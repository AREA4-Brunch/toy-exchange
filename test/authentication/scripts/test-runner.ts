import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ITestRunnerConfig, killServer, startServer, waitForServer } from '../shared/server';

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
 * Initialize configuration and environment variables
 * @returns Configuration object
 */
const initializeServerConfig = (): ITestRunnerConfig => {
    const rootDir = path.resolve(
        process.env.PROJECT_ROOT ?? path.resolve(__dirname, '../../../../../'),
    );

    const serverDir = path.resolve(
        process.env.SERVER_DIR ?? path.join(rootDir, 'src', 'backend', 'authentication'),
    );

    const testDir = path.resolve(
        process.env.TEST_DIR ?? path.join(rootDir, 'test', 'authentication'),
    );

    console.log(`Using root directory: ${rootDir}`);

    const config: ITestRunnerConfig = {
        port: process.env.PORT || '4000',
        hostname: process.env.HOSTNAME || 'localhost',
        configPath:
            process.env.APP_CONFIG
            || path.join(serverDir, 'dist', 'config', 'app-config', 'test.config.js'),
        pingTimeout: Number(process.env.PING_TIMEOUT) || 30000,
        serverPingEndpoint: process.env.HEALTH_ENDPOINT || '/api/v1/auth/regular-user/health',
        rootDir,
        serverDir,
        testDir,
        testConfigPath:
            process.env.TEST_CONFIG
            || path.join(testDir, 'dist', 'test', 'authentication', 'config', 'default.config.js'),
    };
    console.log(`configPath: ${config.configPath}`);
    console.log(
        `configPath: ${path.join(serverDir, 'dist', 'config', 'app-config', 'test.config.js')}`,
    );

    // Set environment variables for child processes
    process.env.NODE_ENV = 'test';
    process.env.PORT = config.port;
    process.env.HOSTNAME = config.hostname;
    process.env.APP_CONFIG = config.configPath;

    return config;
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
    config: ITestRunnerConfig,
    testArgs: string[],
    options: CommandLineOptions,
    server: ChildProcess,
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

    console.log(`Using vitest at: ${vitestBin}`);

    // Platform-independent way to run the binary
    const { command, args } = getCommandForBinary(vitestBin, testArgs);
    console.log(`Running command: ${command} ${args.join(' ')}`);

    return new Promise<boolean>((resolve) => {
        const tests = spawn(command, args, {
            cwd: config.testDir,
            env: process.env,
            stdio: 'inherit',
        });

        tests.on('error', (err) => {
            console.error('Failed to start tests:', err);
            killServer(server);
            process.exit(1);
        });

        tests.on('exit', (code) => {
            console.log(`Tests completed with exit code: ${code}`);

            if (!options.watchMode) {
                killServer(server);
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
    config: ITestRunnerConfig,
    testArgs: string[],
    options: CommandLineOptions,
    server: ChildProcess,
): Promise<boolean> => {
    console.log('Vitest binary not found, using fallback approach');
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

        tests.on('error', (err) => {
            console.error('Failed to start tests with fallback:', err);
            killServer(server);
            process.exit(1);
        });

        tests.on('exit', (code) => {
            console.log(`Tests completed with exit code: ${code}`);

            if (!options.watchMode) {
                killServer(server);
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
    config: ITestRunnerConfig,
    options: CommandLineOptions,
    server: ChildProcess,
): Promise<void> => {
    console.log('Server is ready! Running tests...');

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
    initializeTestConfig(config); // common for both methods
    const success =
        (await tryRunningWithVitestBinary(config, testArgs, options, server))
        || (await tryRunningWithVitestModule(config, testArgs, options, server));

    if (!success) {
        console.error('Could not find vitest. Make sure it is installed.');
        killServer(server);
        process.exit(1);
    }
};

const initializeTestConfig = (config: ITestRunnerConfig): void => {
    process.env.TEST_CONFIG = config.testConfigPath;
    console.log(`Test config path: ${config.testConfigPath}`);
};

/**
 * Main function that orchestrates the test running process
 */
const main = async (): Promise<void> => {
    try {
        console.log('Starting test runner...');
        const options = parseArguments();
        const config = initializeServerConfig();

        console.log(`Server directory: ${config.serverDir}`);
        console.log(`Test directory: ${config.testDir}`);

        const server = startServer(config);
        await waitForServer(config);
        await runTests(config, options, server);
    } catch (error) {
        console.error('Error in test runner:', error);
        process.exit(1);
    }
};

main();
