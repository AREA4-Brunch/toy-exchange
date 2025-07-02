import { DependencyContainer, InjectionToken } from 'tsyringe';

export interface IInitializer<TConfig> {
    initialize(container: DependencyContainer, config: TConfig): Promise<void>;
}

export class CompositeInitializer<TConfig> implements IInitializer<TConfig> {
    public async initialize(
        container: DependencyContainer,
        config: TConfig,
    ): Promise<void> {}

    /**
     * @param inits List of initializers groups, groups are initialized as async
     *              but initializers within a group are initialized as sync in
     *              given order.
     */
    protected async initChildrenInParallel(
        container: DependencyContainer,
        inits: [
            DependencyContainer,
            InjectionToken<IInitializer<any>>,
            any,
        ][][],
    ): Promise<void> {
        // now can resolve after its dependencies were registered via bind()
        await Promise.all(
            inits.map(async (syncGroup) => {
                syncGroup.forEach(async ([childContainer, ioc, iocConfig]) => {
                    await container
                        .resolve<IInitializer<any>>(ioc)
                        .initialize(childContainer, iocConfig);
                });
            }),
        );
    }
}
