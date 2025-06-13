import { IComparable } from '../../common/comparable.interface';
import { Identifier } from '../value-objects/identifier';
import { IIdentifiable } from './identifiable.interface';

// prettier-ignore
export interface IEntity<TId extends Identifier<unknown>>
    extends IIdentifiable<TId>, IComparable<IEntity<TId>> { }

export abstract class Entity<TId extends Identifier<unknown>>
    implements IEntity<TId>
{
    constructor(public readonly id: TId) {}

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
}
