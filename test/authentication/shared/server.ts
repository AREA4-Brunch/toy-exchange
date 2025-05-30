import { ChildProcess, exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import waitOn from 'wait-on';
import defaultConfig from '../config/default.config';
import { IServerRunnerConfig } from './config.interface';

/**
 * Initialize configuration and environment variables
 * @returns Configuration object
 */
export const initializeServerConfig = (): IServerRunnerConfig => {
    const config: IServerRunnerConfig = defaultConfig.runnerScript.server;
    console.info(`Server config path: ${config.configPath}`);
    // Set environment variables for child processes
    process.env.NODE_ENV = 'test';
    process.env.PORT = `${config.port}`;
    process.env.HOSTNAME = config.hostname;
    process.env.APP_CONFIG = config.configPath;
    return config;
};

/**
 * Start the test server
 * @param config Configuration object
 * @returns Server process object
 */
export const startServer = (config: IServerRunnerConfig): ChildProcess => {
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

        setupCleanupHandlers(server, config.port);

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
export const setupCleanupHandlers = (server: ChildProcess, port: number): void => {
    // Ensure server is killed on script exit
    process.on('exit', async () => {
        console.log('Shutting down server...');
        await killServer(server, port);
    });

    // Handle Ctrl+C and other termination signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
        process.on(signal as NodeJS.Signals, async () => {
            console.log(`\nReceived ${signal}, shutting down...`);
            await killServer(server, port);
            process.exit(0);
        });
    });
};

/**
 * Kill server process if it exists and is running
 * @param server Server process
 */
export const killServer = async (server: ChildProcess, port: number): Promise<void> => {
    if (!server) return;

    console.log('Terminating server process...');

    // On Windows, we need to use SIGTERM first then force kill if needed
    if (process.platform === 'win32') {
        try {
            // First try graceful termination
            server.kill('SIGTERM');

            // Force kill after a short delay if still running
            if (!server.killed) {
                await new Promise(() =>
                    setTimeout(() => {
                        if (!server.killed) {
                            server.kill('SIGKILL');
                        }
                    }, 1200),
                );
            }
        } catch (error) {
            console.error('Error killing server process:', error);
        }
    } else {
        // On Unix systems
        try {
            server.kill('SIGTERM');
        } catch (error) {
            console.error('Error killing server process:', error);
        }
    }

    if (!(await isPortAvailable(port))) {
        await cleanup(port);
        console.log(`✅ Server on port ${port} has been successfully killed.`);
    }
};

/**
 * Wait for the server to be ready
 * @param config Configuration object
 * @returns Promise that resolves when the server is ready
 */
export const waitForServer = async (config: IServerRunnerConfig): Promise<void> => {
    const healthCheckUrl = `http://${config.hostname}:${config.port}${config.serverPingEndpoint}`;
    console.log(`Waiting for server to be available at: ${healthCheckUrl}`);

    await waitOn({
        resources: [healthCheckUrl],
        timeout: config.pingTimeout,
        log: true,
    });
};

export const cleanup = (port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        exec(`npx cross-env kill-port ${port}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error killing port ${port}:`, error);
                reject(error);
                return;
            }
            console.log(`✅ Port ${port} killed successfully.`);
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);
            resolve();
        });
    });
};

export const isPortAvailable = async (port: number): Promise<boolean> => {
    // there are no type definitions for detect-port-alt
    const detectPort = require('detect-port-alt') as (port: number) => Promise<number>;

    return detectPort(port).then((availablePort: number) => {
        if (availablePort === port) {
            console.log(`✅ Port ${port} is available`);
        } else {
            console.log(`❌ Port ${port} is in use`);
        }
        return availablePort === port;
    });
};
