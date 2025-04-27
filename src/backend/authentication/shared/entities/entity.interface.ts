import { IComparable } from '../common/comparable.interface.ts';
import { IIdentifiable } from './identifiable.interface.ts';

export interface IEntity<T> extends IIdentifiable<T>, IComparable<IEntity<T>> {}
