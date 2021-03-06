// eslint-disable-next-line no-unused-vars
import { HevalTopping } from './heval-topping';

export type HevalPizzaSize = string;

export interface HevalPizza {
  getDisplayName(): string;

  getToppings(): HevalTopping[];

  getToppingsIntersection(compareTo: HevalTopping[]): HevalTopping[];
}
