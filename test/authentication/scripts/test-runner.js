const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');
const fs = require('fs');

/**
 * Parse command line arguments
 * @returns {Object} Object containing parsed options
 */
function parseArguments() {
    const args = process.argv.slice(2);
    return {
        watchMode: args.includes('--watch'),
        coverage: args.includes('--coverage'),
    };
}

/**
 * Initialize configuration and environment variables
 * @returns {Object} Configuration object
 */
function initializeConfig() {
    const rootDir = path.resolve(__dirname, '../../../');
    const serverDir = path.join(rootDir, 'src', 'backend', 'authentication');
    const testDir = path.join(rootDir, 'test', 'authentication');

    const config = {
        port: process.env.PORT || '4000',
        hostname: process.env.HOSTNAME || 'localhost',
        configPath:
            process.env.CONFIG
            || path.join(
                serverDir,
                'dist',
                'regular-user',
                'config',
                'app-config',
                'test.config.js',
            ),
        pingTimeout: 30000,
        serverPingEndpoint: '/api/v1/auth/regular-user/health',
        rootDir,
        serverDir,
        testDir,
    };

    // Set environment variables for child processes
    process.env.NODE_ENV = 'test';
    process.env.PORT = config.port;
    process.env.HOSTNAME = config.hostname;
    process.env.CONFIG = config.configPath;

    return config;
}

/**
 * Start the test server
 * @param {Object} config Configuration object
 * @returns {Object} Server process object
 */
function startServer(config) {
    console.log('Starting test server...');

    if (!fs.existsSync(config.serverDir)) {
        console.error(`Server directory not found: ${config.serverDir}`);
        process.exit(1);
    }

    const serverFile = path.join(config.serverDir, 'dist', 'server.js');
    console.log(`Starting server directly: ${serverFile}`);

    const server = spawn(process.execPath, [serverFile], {
        cwd: config.serverDir,
        env: process.env,
        stdio: 'inherit',
    });

    server.on('exit', (code) => {
        if (code !== null && code !== 0) {
            console.error(`Server process exited with code ${code}`);
        }
    });

    setupCleanupHandlers(server);

    return server;
}

/**
 * Setup handlers for cleaning up server on exit
 * @param {ChildProcess} server Server process
 */
function setupCleanupHandlers(server) {
    // Ensure server is killed on script exit
    process.on('exit', () => {
        console.log('Shutting down server...');
        killServer(server);
    });

    // Handle Ctrl+C and other termination signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
        process.on(signal, () => {
            console.log(`\nReceived ${signal}, shutting down...`);
            killServer(server);
            process.exit(0);
        });
    });
}

/**
 * Kill server process if it exists and is running
 * @param {ChildProcess} server Server process
 */
function killServer(server) {
    if (server && !server.killed) {
        server.kill();
    }
}

/**
 * Wait for the server to be ready
 * @param {Object} config Configuration object
 * @returns {Promise} Promise that resolves when the server is ready
 */
async function waitForServer(config) {
    const healthCheckUrl = `http://${config.hostname}:${config.port}${config.serverPingEndpoint}`;
    console.log(`Waiting for server to be available at: ${healthCheckUrl}`);

    return waitOn({
        resources: [healthCheckUrl],
        timeout: config.pingTimeout,
        log: true,
    });
}

/**
 * Run the tests
 * @param {Object} config Configuration object
 * @param {Object} options Command line options
 * @param {ChildProcess} server Server process
 */
async function runTests(config, options, server) {
    console.log('Server is ready! Running tests...');

    // Build the test command based on arguments
    const testArgs = [];
    if (options.watchMode) {
        testArgs.push('--watch');
    } else if (options.coverage) {
        testArgs.push('run', '--coverage');
    } else {
        testArgs.push('run');
    }

    // Try to run tests using the vitest binary
    const success =
        (await tryRunningWithVitestBinary(config, testArgs, options, server))
        || (await tryRunningWithVitestModule(config, testArgs, options, server));

    if (!success) {
        console.error('Could not find vitest. Make sure it is installed.');
        killServer(server);
        process.exit(1);
    }
}

/**
 * Try running tests with the vitest binary
 * @param {Object} config Configuration object
 * @param {Array} testArgs Arguments for vitest
 * @param {Object} options Command line options
 * @param {ChildProcess} server Server process
 * @returns {Promise<boolean>} True if successful, false if vitest binary not found
 */
async function tryRunningWithVitestBinary(config, testArgs, options, server) {
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

    return new Promise((resolve) => {
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
}

/**
 * Get the appropriate command and arguments for running a binary across platforms
 * @param {string} binaryPath Path to the binary
 * @param {Array} args Arguments to pass to the binary
 * @returns {Object} Object with command and args properties
 */
function getCommandForBinary(binaryPath, args) {
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
}

/**
 * Try running tests with the vitest module directly
 * @param {Object} config Configuration object
 * @param {Array} testArgs Arguments for vitest
 * @param {Object} options Command line options
 * @param {ChildProcess} server Server process
 * @returns {Promise<boolean>} True if successful, false if vitest module not found
 */
async function tryRunningWithVitestModule(config, testArgs, options, server) {
    console.log('Vitest binary not found, using fallback approach');
    const vitestPath = path.resolve(config.testDir, 'node_modules', 'vitest', 'dist', 'cli.mjs');

    if (!fs.existsSync(vitestPath)) {
        return false;
    }

    return new Promise((resolve) => {
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
}

/**
 * Main function that orchestrates the test running process
 */
async function main() {
    try {
        console.log('Starting test runner...');
        const options = parseArguments();
        const config = initializeConfig();

        console.log(`Server directory: ${config.serverDir}`);
        console.log(`Test directory: ${config.testDir}`);

        const server = startServer(config);

        await waitForServer(config);
        await runTests(config, options, server);
    } catch (error) {
        console.error('Error in test runner:', error);
        process.exit(1);
    }
}

main();
