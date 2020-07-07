// eslint-disable-next-line no-unused-vars
import { HevalPizzaSize } from './heval-pizza';
import { formatEuros } from './util';

export class HevalPizzaCategoryPrice {
  private readonly size: HevalPizzaSize;
  private readonly value: number;

  constructor(size: HevalPizzaSize, value: number) {
    this.size = size;
    this.value = value;
  }

  getSize() {
    return this.size;
  }

  isSize(size: HevalPizzaSize) {
    return this.size === size;
  }

  getValue() {
    return this.value;
  }

  getFormattedValue() {
    return formatEuros(this.value);
  }

  static sortByValueAsc(first: HevalPizzaCategoryPrice, second: HevalPizzaCategoryPrice) {
    return second.getValue() - first.getValue();
  }

  static sortByValueDesc(first: HevalPizzaCategoryPrice, second: HevalPizzaCategoryPrice) {
    return first.getValue() - second.getValue();
  }
}
