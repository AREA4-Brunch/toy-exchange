import { publish } from 'common/dist/commands/publish';
import { publishInterfacesOptions } from './config';

const main = async () => {
    const newVersion = process.argv[2];
    const options = { ...publishInterfacesOptions, newVersion };
    await publish(options);
};

if (require.main === module) {
    main();
}
