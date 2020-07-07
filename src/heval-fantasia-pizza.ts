// eslint-disable-next-line no-unused-vars
import { HevalPizza } from './heval-pizza';
// eslint-disable-next-line no-unused-vars
import { HevalTopping } from './heval-topping';

export class HevalFantasiaPizza implements HevalPizza {
  getListName(): string {
    return 'Fantasia (4 täytettä)';
  }

  getToppings() {
    return [];
  }

  getToppingsIntersection(compareTo: HevalTopping[]): HevalTopping[] {
    return compareTo.slice(0, 4);
  }
}
