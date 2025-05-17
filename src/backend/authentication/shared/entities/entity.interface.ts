import { IComparable } from '../common/comparable.interface';
import { IIdentifiable } from './identifiable.interface';

export interface IEntity<T> extends IIdentifiable<T>, IComparable<IEntity<T>> {}
