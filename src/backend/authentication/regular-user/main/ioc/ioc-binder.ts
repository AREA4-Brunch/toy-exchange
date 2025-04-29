import { Container, ContainerModule } from 'inversify';
import { IIocBinder } from '../../../shared/main/ioc/ioc-binder.interface.ts';

const containerModules: ContainerModule[] = [];

export const binder: IIocBinder = {
    bind: (container: Container) => {
        containerModules.forEach((module) => container.load(module));
    },
};
