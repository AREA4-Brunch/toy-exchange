import { Identifier } from '../value-objects/identifier';

export interface IDomainEvent {
    readonly id: Identifier<string>;
    readonly name: string;
    readonly occurredOn: Date;
}
