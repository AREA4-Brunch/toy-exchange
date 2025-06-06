import { publish } from '../commands/publish';
import { publishOptions } from './config';

const main = async () => {
    const newVersion = process.argv[2];
    const options = { ...publishOptions, newVersion };
    await publish(options);
};

if (require.main === module) {
    main();
}
