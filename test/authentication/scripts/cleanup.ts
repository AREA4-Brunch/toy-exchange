import { ConfigManager } from '../shared/config-management';
import { cleanup } from '../shared/server';

const main = async (): Promise<void> => {
    const port: number = Number((await ConfigManager.getInstance().runnerScript()).server.port);
    cleanup(port);
};

main();
