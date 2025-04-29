import { Container } from 'inversify';

export interface IIocBinder {
    bind(container: Container): void;
}
