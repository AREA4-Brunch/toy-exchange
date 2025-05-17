import { IValidateable } from '../../common/validateable.interface';
import { Identifier } from '../value-objects/identifier';
import { IEntity } from './entity.interface';

export abstract class BasicEntity<TId extends Identifier<unknown>, TProps>
    implements IEntity<TId>, IValidateable<TProps>
{
    constructor(
        public readonly id: TId,
        protected props: TProps = {} as TProps,
    ) {}

    public equals(other?: IEntity<TId>): boolean {
        if (other === null || other === undefined) {
            return false;
        }
        if (this === other) {
            return true;
        }
        if (!(other instanceof this.constructor)) {
            return false;
        }
        return this.id.equals(other.id);
    }

    public validate(value: TProps): void {}
}
