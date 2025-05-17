export abstract class IocInitializer<TConfig> {
    abstract initialize(config: TConfig): Promise<void>;
}
