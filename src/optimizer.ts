import * as _ from 'lodash';

// eslint-disable-next-line no-unused-vars
import { HevalPizza, HevalPizzaSize } from './heval-pizza';
// eslint-disable-next-line no-unused-vars
import { HevalTopping } from './heval-topping';
// eslint-disable-next-line no-unused-vars
import { HevalDataset } from './heval-dataset';

export interface OptimizerCriteria {
  size: HevalPizzaSize;
  toppings: HevalTopping[];
}

export interface OptimizerResultParams {
  pizza: HevalPizza;
  includedToppings: HevalTopping[];
  missingToppings: HevalTopping[];
  additionalToppings: HevalTopping[];
  price: {
    basePrice: number;
    extraToppingsPrice: number;
    totalPrice: number;
  };
}

export class OptimizerResult {
  private readonly pizza: HevalPizza;
  private readonly includedToppings: HevalTopping[];
  private readonly missingToppings: HevalTopping[];
  private readonly additionalToppings: HevalTopping[];
  private readonly basePrice: number;
  private readonly extraToppingsPrice: number;
  private readonly totalPrice: number;

  constructor(params: OptimizerResultParams) {
    this.pizza = params.pizza;
    this.includedToppings = params.includedToppings;
    this.missingToppings = params.missingToppings;
    this.additionalToppings = params.additionalToppings;
    this.basePrice = params.price.basePrice;
    this.extraToppingsPrice = params.price.extraToppingsPrice;
    this.totalPrice = params.price.totalPrice;
  }

  getPizza() {
    return this.pizza;
  }

  hasIncludedToppings() {
    return this.includedToppings.length > 0;
  }

  getIncludedToppings() {
    return this.includedToppings;
  }

  hasMissingToppings() {
    return this.missingToppings.length > 0;
  }

  getMissingToppings() {
    return this.missingToppings;
  }

  hasAdditionalToppings() {
    return this.additionalToppings.length > 0;
  }

  getAdditionalToppings() {
    return this.additionalToppings;
  }

  getBasePrice() {
    return this.basePrice;
  }

  getExtraToppingsPrice() {
    return this.extraToppingsPrice;
  }

  getTotalPrice() {
    return this.totalPrice;
  }

  static sortByPriority = (first: OptimizerResult, second: OptimizerResult) => {
    if (first.totalPrice !== second.totalPrice) {
      return first.totalPrice - second.totalPrice;
    }
    if (first.includedToppings.length !== second.includedToppings.length) {
      return second.includedToppings.length - first.includedToppings.length;
    }
    return second.additionalToppings.length - first.additionalToppings.length;
  };
}

export class Optimizer {
  constructor(private dataset: HevalDataset) {}

  findPizzas(criteria: OptimizerCriteria, params?: { count: number }): OptimizerResult[] {
    const results: OptimizerResult[] = [];

    for (const category of this.dataset.getCategories()) {
      for (const pizza of category.getAllPizzas()) {
        const includedToppings = pizza.getToppingsIntersection(criteria.toppings);
        const missingToppings = _.difference(criteria.toppings, includedToppings);
        const additionalToppings = _.difference(pizza.getToppings(), includedToppings);

        const basePrice = category.findPrice(criteria.size);

        if (basePrice == null) {
          /**
           * Ignore pizzas that are not available in requested size.
           */
          continue;
        }

        const extraToppingsPrice = HevalTopping.EXTRA_PRICE * missingToppings.length;
        const totalPrice = basePrice.getValue() + extraToppingsPrice;

        results.push(
          new OptimizerResult({
            pizza,
            includedToppings: includedToppings,
            missingToppings: missingToppings,
            additionalToppings: additionalToppings,
            price: {
              basePrice: basePrice.getValue(),
              extraToppingsPrice,
              totalPrice
            }
          })
        );
      }
    }

    results.sort(OptimizerResult.sortByPriority);

    return results.slice(0, params?.count ?? 5);
  }
}
