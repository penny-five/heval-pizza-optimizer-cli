import * as _ from 'lodash';

// eslint-disable-next-line no-unused-vars
import { HevalPizza } from './heval-pizza';
// eslint-disable-next-line no-unused-vars
import { HevalTopping } from './heval-topping';

export class HevalListedPizza implements HevalPizza {
  private readonly name: string;
  private readonly number: number;
  private readonly toppings: HevalTopping[];

  constructor(name: string, number: number, toppings: HevalTopping[]) {
    this.name = name;
    this.number = number;
    this.toppings = toppings;
  }

  getListName() {
    return `${this.number}. ${this.name}`;
  }

  getToppings() {
    return this.toppings;
  }

  getToppingsIntersection(compareTo: HevalTopping[]) {
    return _.intersectionBy(compareTo, this.toppings, topping => topping.getName());
  }
}
