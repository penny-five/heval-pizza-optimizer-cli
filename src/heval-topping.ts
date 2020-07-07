export class HevalTopping {
  static readonly EXTRA_PRICE = 1.5;

  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  static sortAlphabetically(first: HevalTopping, second: HevalTopping) {
    return first.getName().localeCompare(second.getName());
  }
}
