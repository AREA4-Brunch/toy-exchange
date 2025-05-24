import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import waitOn from 'wait-on';

/**
 * Configuration for the test runner
 */
export interface ITestRunnerConfig {
    port: string;
    hostname: string;
    configPath: string;
    pingTimeout: number;
    serverPingEndpoint: string;
    rootDir: string;
    serverDir: string;
    testDir: string;
    testConfigPath: string;
}

/**
 * Start the test server
 * @param config Configuration object
 * @returns Server process object
 */
export const startServer = (config: ITestRunnerConfig): ChildProcess => {
    console.log('Starting test server...');

    if (!fs.existsSync(config.serverDir)) {
        console.error(`Server directory not found: ${config.serverDir}`);
        process.exit(1);
    }

    console.log(`Starting server using npm run start:test in: ${config.serverDir}`);

    // use 'npm.cmd' on Windows, 'npm' otherwise
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    try {
        // normalize the path to avoid any Windows-specific issues
        const normalizedPath = path.normalize(config.serverDir);
        console.log(`Using normalized path: ${normalizedPath}`);

        const server = spawn(npmCmd, ['run', 'start:test'], {
            cwd: normalizedPath,
            env: process.env,
            stdio: 'inherit',
            shell: true, // use shell to handle any path issues
        });

        server.on('error', (err) => {
            console.error('Failed to start server:', err);
            process.exit(1);
        });

        server.on('exit', (code) => {
            if (code !== null && code !== 0) {
                console.error(`Server process exited with code ${code}`);
            }
        });

        setupCleanupHandlers(server);

        return server;
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

/**
 * Setup handlers for cleaning up server on exit
 * @param server Server process
 */
export const setupCleanupHandlers = (server: ChildProcess): void => {
    // Ensure server is killed on script exit
    process.on('exit', () => {
        console.log('Shutting down server...');
        killServer(server);
    });

    // Handle Ctrl+C and other termination signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
        process.on(signal as NodeJS.Signals, () => {
            console.log(`\nReceived ${signal}, shutting down...`);
            killServer(server);
            process.exit(0);
        });
    });
};

/**
 * Kill server process if it exists and is running
 * @param server Server process
 */
export const killServer = (server: ChildProcess): void => {
    if (server && !server.killed) {
        server.kill();
    }
};

/**
 * Wait for the server to be ready
 * @param config Configuration object
 * @returns Promise that resolves when the server is ready
 */
export const waitForServer = async (config: ITestRunnerConfig): Promise<void> => {
    const healthCheckUrl = `http://${config.hostname}:${config.port}${config.serverPingEndpoint}`;
    console.log(`Waiting for server to be available at: ${healthCheckUrl}`);

    await waitOn({
        resources: [healthCheckUrl],
        timeout: config.pingTimeout,
        log: true,
    });
};
