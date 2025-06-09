import { IPublishOptions, publish } from 'common/dist/commands/publish';
import { publishOptions } from './config';

const main = async () => {
    const newVersion = process.argv[2];
    const options: IPublishOptions = {
        ...publishOptions,
        clientProjects: [],
        newVersion,
    };
    await publish(options);
};

if (require.main === module) {
    main();
}
