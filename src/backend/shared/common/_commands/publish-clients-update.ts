import { publishClientsUpdate } from '../commands/publish-clients-update';
import { publishOptions } from './config';

const main = async () => {
    try {
        const optionalVersion: string | undefined = process.argv[2];
        publishClientsUpdate({
            ...publishOptions,
            newVersion: optionalVersion,
        });
    } catch (error) {
        console.error('❌ Client update process failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    main();
}
