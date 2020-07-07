// eslint-disable-next-line no-unused-vars
import { HevalPizza, HevalPizzaSize } from './heval-pizza';
// eslint-disable-next-line no-unused-vars
import { HevalPizzaCategoryPrice } from './heval-pizza-category-price';

export class HevalPizzaCategory {
  private readonly name: string;
  private readonly prices: HevalPizzaCategoryPrice[];
  private readonly pizzas: HevalPizza[];

  constructor(name: string, prices: HevalPizzaCategoryPrice[], pizzas: HevalPizza[]) {
    this.name = name;
    this.prices = prices;
    this.pizzas = pizzas;
  }

  getName() {
    return this.name;
  }

  getAllPrices() {
    return this.prices;
  }

  findPrice(size: HevalPizzaSize) {
    return this.prices.find(price => price.isSize(size));
  }

  getAvailableSizes() {
    return this.prices.map(price => price.getSize());
  }

  getAllPizzas() {
    return this.pizzas;
  }
}
