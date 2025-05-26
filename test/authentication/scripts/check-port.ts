/**
 * basically equivalent to:
 * netstat -ano | findstr :3001
 * but loads in the port from the config file
 */

import { ConfigManager } from '../shared/config-management';
import { checkPortAvailability } from '../shared/server';

const main = async (): Promise<void> => {
    const port: number = Number((await ConfigManager.getInstance().runnerScript()).server.port);
    checkPortAvailability(port)
        .then((wasAvailable: boolean) => {
            if (wasAvailable) process.exit(0);
            else process.exit(1);
        })
        .catch((err: Error) => {
            console.error(`Error checking port: ${err.message}`);
            process.exit(1);
        });
};

main();
