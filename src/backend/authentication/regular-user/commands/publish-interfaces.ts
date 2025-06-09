import { publish } from 'common/dist/commands/publish';
import {
    publishInterfacesOptions,
    selfPublishInterfacesOptions,
} from './config';

const main = async () => {
    const version: string | undefined = process.argv
        .find((arg) => arg.startsWith('--version='))
        ?.substring('--version='.length);
    const publishType = process.argv
        .find((arg) => arg.startsWith('--publish-type='))
        ?.substring('--publish-type='.length);

    console.log(`argv: ${JSON.stringify(process.argv)}`);
    console.log(`version: ${JSON.stringify(version)}`);
    console.log(`publishType: ${JSON.stringify(publishType)}`);

    const options =
        publishType === 'all'
            ? { ...publishInterfacesOptions, newVersion: version }
            : {
                  ...selfPublishInterfacesOptions,
                  newVersion: version,
              };
    await publish(options);
};

if (require.main === module) {
    main();
}
