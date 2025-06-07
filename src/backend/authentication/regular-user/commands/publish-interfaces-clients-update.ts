import { publishClientsUpdate } from 'common/dist/commands/publish-clients-update';
import { publishInterfacesOptions } from './config';

const main = async () => {
    try {
        const optionalVersion: string | undefined = process.argv[2];
        publishClientsUpdate({
            ...publishInterfacesOptions,
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
