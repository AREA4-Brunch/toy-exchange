import { IDomainEvent } from '../events/domain-event.interface.ts';
import { Identifier } from '../value-objects/identifier.ts';
import { BasicEntity } from './basic-entity.base.ts';

export abstract class TrackableEntity<
    TId extends Identifier<unknown>,
    TProps,
> extends BasicEntity<TId, TProps> {
    protected domainEvents: IDomainEvent[] = [];

    constructor(id: TId, props: TProps = {} as TProps) {
        super(id, props);
    }

    public addDomainEvent(domainEvent: IDomainEvent): void {
        this.domainEvents.push(domainEvent);
    }

    public clearEvents(): void {
        this.domainEvents = [];
    }
}
