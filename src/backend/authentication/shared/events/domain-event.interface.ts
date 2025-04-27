import { Identifier } from '../value-objects/identifier.ts';

export interface IDomainEvent {
    readonly id: Identifier<string>;
    readonly name: string;
    readonly occurredOn: Date;
}
