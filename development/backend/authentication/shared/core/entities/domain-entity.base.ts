import { Identifier } from '../value-objects/identifier';
import { ITrackableEntity, TrackableEntity } from './trackable-entity';

export interface IDomainEntityProps {
    createdAt: Date;
    modifiedAt: Date;
    version: number;
}

export interface IDomainEntity<TId extends Identifier<unknown>>
    extends ITrackableEntity<TId> {
    createdAt: Date;
    modifiedAt: Date;
    version: number;
}

export class DomainEntity<
        TId extends Identifier<unknown>,
        TProps extends IDomainEntityProps,
    >
    extends TrackableEntity<TId>
    implements IDomainEntity<TId>
{
    constructor(
        id: TId,
        protected props: TProps,
    ) {
        super(id);
    }

    public get createdAt(): Date {
        return this.props.createdAt;
    }

    public get modifiedAt(): Date {
        return this.props.modifiedAt;
    }

    public get version(): number {
        return this.props.version;
    }

    protected updateState<K extends keyof TProps>(
        property: K,
        value: TProps[K],
        validator?: (props: TProps) => void,
    ): void {
        const updatedProps = {
            ...this.props,
            [property]: value,
            modifiedAt: new Date(),
            version: this.props.version + 1,
        } as TProps;

        validator?.(updatedProps);
        this.props = updatedProps;
    }

    protected updateMultipleStates(
        updates: Partial<TProps>,
        validator?: (props: TProps) => void,
        allowSetModifiedAt: boolean = false,
        allowSetVersion: boolean = false,
    ): void {
        const updatedProps = {
            ...this.props,
            ...updates,
            ...(allowSetModifiedAt ? {} : { modifiedAt: new Date() }),
            ...(allowSetVersion ? {} : { version: this.props.version + 1 }),
        } as TProps;

        validator?.(updatedProps);
        this.props = updatedProps;
    }
}
