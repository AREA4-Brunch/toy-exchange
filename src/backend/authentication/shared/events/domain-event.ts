import { Identifier } from '../value-objects/identifier';
import { IDomainEvent } from './domain-event.interface';

export abstract class DomainEvent implements IDomainEvent {
    constructor(
        public readonly id: Identifier<string>,
        public readonly name: string,
        public readonly occurredOn: Date,
    ) {}
}
