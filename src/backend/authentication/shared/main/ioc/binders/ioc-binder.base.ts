import { DependencyContainer } from 'tsyringe';

export abstract class IocBinder<TConfig> {
    abstract bind(container: DependencyContainer, config: TConfig): void;
}
