import * as _ from 'lodash';

// eslint-disable-next-line no-unused-vars
import { HevalPizzaCategory } from './heval-pizza-category';
// eslint-disable-next-line no-unused-vars
import { HevalTopping } from './heval-topping';

export class HevalDataset {
  private readonly categories: HevalPizzaCategory[];

  constructor(categories: HevalPizzaCategory[]) {
    this.categories = categories;
  }

  getCategories() {
    return this.categories;
  }

  getAvailableToppings(): HevalTopping[] {
    const toppings = this.categories
      .flatMap(category => category.getAllPizzas())
      .flatMap(pizza => pizza.getToppings());

    return _.uniqBy(toppings, topping => topping.getName());
  }

  findToppingByName(name: string) {
    return this.getAvailableToppings().find(topping => topping.getName() === name);
  }

  getAvailableSizes() {
    return [...new Set(this.categories.flatMap(category => category.getAvailableSizes()))];
  }
}
