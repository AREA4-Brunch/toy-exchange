import { DependencyContainer } from 'tsyringe';

export interface IIoCBinder<TConfig> {
    bind(container: DependencyContainer, config: TConfig): void | Promise<void>;
}
