import { IDomainEvent } from '../events/domain-event.interface';
import { Identifier } from '../value-objects/identifier';
import { Entity, IEntity } from './entity.base';

export interface ITrackableEntity<TId extends Identifier<unknown>>
    extends IEntity<TId> {
    addDomainEvent(domainEvent: IDomainEvent): void;
    clearEvents(): void;
    getDomainEvents(): IDomainEvent[];
}

export abstract class TrackableEntity<TId extends Identifier<unknown>>
    extends Entity<TId>
    implements ITrackableEntity<TId>
{
    protected domainEvents: IDomainEvent[] = [];

    constructor(id: TId) {
        super(id);
    }

    public addDomainEvent(domainEvent: IDomainEvent): void {
        this.domainEvents.push(domainEvent);
    }

    public clearEvents(): void {
        this.domainEvents = [];
    }

    public getDomainEvents(): IDomainEvent[] {
        return [...this.domainEvents];
    }
}
