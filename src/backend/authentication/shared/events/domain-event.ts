import { Identifier } from '../value-objects/identifier.ts';
import { IDomainEvent } from './domain-event.interface.ts';

export abstract class DomainEvent implements IDomainEvent {
    constructor(
        public readonly id: Identifier<string>,
        public readonly name: string,
        public readonly occurredOn: Date,
    ) {}
}
