import { Identifier } from '../value-objects/identifier.ts';
import { TrackableEntity } from './trackable-entity.ts';

export interface TimestampedProps {
    createdAt: Date;
    modifiedAt: Date;
    version: number;
}

export abstract class Entity<
    TId extends Identifier<unknown>,
    TProps extends TimestampedProps,
> extends TrackableEntity<TId, TProps> {
    constructor(id: TId, props: TProps) {
        super(id, props);
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
        validate: boolean = true,
    ): void {
        const updatedProps = {
            ...this.props,
            [property]: value,
            modifiedAt: new Date(),
            version: this.props.version + 1,
        } as TProps;

        if (validate) {
            this.validate(updatedProps);
        }
        this.props = updatedProps;
    }

    protected updateMultipleStates(
        updates: Partial<TProps>,
        validate: boolean = true,
        excludeModifiedAt: boolean = false,
        excludeVersion: boolean = false,
    ): void {
        const updatedProps = {
            ...this.props,
            ...updates,
            ...(excludeModifiedAt ? {} : { modifiedAt: new Date() }),
            ...(excludeVersion ? {} : { version: this.props.version + 1 }),
        } as TProps;

        if (validate) {
            this.validate(updatedProps);
        }
        this.props = updatedProps;
    }
}
