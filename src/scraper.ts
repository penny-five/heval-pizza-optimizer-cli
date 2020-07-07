import * as _ from 'lodash';
import * as scrapeIt from 'scrape-it';

import { HevalDataset } from './heval-dataset';
import { HevalListedPizza } from './heval-listed-pizza';
import { HevalPizzaCategory } from './heval-pizza-category';
import { HevalTopping } from './heval-topping';
import { HevalPizzaCategoryPrice } from './heval-pizza-category-price';
import { HevalFantasiaPizza } from './heval-fantasia-pizza';

export class Scraper {
  private static SITE_URL = 'http://www.heval.fi/pizzat_uusi.php';

  private static TOPPING_ALIASES = new Map<string, string>([
    ['tuore tomaatti', 'tuore tomaattiviipale'],
    ['runsaasti katkarapuja', 'katkarapu'],
    ['pepperonimakkara', 'pepperoni'],
    ['mozarellajuusto', 'mozzarellajuusto']
  ]);

  private static TOPPING_BLACKLIST = [
    'neljällä täyteellä oman maun mukaan',
    'neljällä täytteellä oman maun mukaan'
  ];

  /**
   * Hack to build "Fantasia" category, as this information cannot be reliably scraped.
   *
   * Assume that for each pizza size the cheapest found price is the price that is also used for
   * "Fantasia" pizza.
   */
  private constructFantasiaCategory(otherCategories: HevalPizzaCategory[]) {
    const prices = otherCategories.flatMap(category => category.getAllPrices());
    const pricesBySize = _.groupBy(prices, price => price.getSize());

    const lowestPrices = Object.values(pricesBySize).map(prices => {
      return prices.sort(HevalPizzaCategoryPrice.sortByValueAsc)[0];
    });

    return new HevalPizzaCategory('Fantasia', lowestPrices, [new HevalFantasiaPizza()]);
  }

  async scrapeHevalDataset(): Promise<HevalDataset> {
    const scrapeResult = await scrapeIt<{
      categories: HevalPizzaCategory[];
    }>(Scraper.SITE_URL, {
      categories: {
        listItem: '#right-content > table:nth-of-type(n+3)',
        data: {
          name: 'tr:first-of-type td:first-of-type .lihava',
          prices: {
            listItem: 'tr:first-of-type td:nth-of-type(n+2)',
            data: {
              size: {
                selector: '.lihava',
                convert: (value: string) => value.split(' ')[0].toLowerCase()
              },
              value: {
                selector: '.lihava',
                convert: (value: string) => parseInt(value.split(' ')[1])
              }
            },
            convert: data => new HevalPizzaCategoryPrice(data.size, data.value)
          },
          pizzas: {
            listItem: 'tr:nth-of-type(n+2)',
            data: {
              name: {
                selector: '.lihava',
                convert: (value: string) => value.substr(value.indexOf('.') + 1).trim()
              },
              number: {
                selector: '.lihava',
                convert: (value: string) => value.split('.')[0]
              },
              toppings: {
                selector: 'td:first-of-type',
                convert: (value: string) => {
                  return value
                    .split('\n')[1]
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name.length > 0)
                    .map(name => Scraper.TOPPING_ALIASES.get(name) || name)
                    .filter(name => !Scraper.TOPPING_BLACKLIST.includes(name))
                    .map(name => new HevalTopping(name));
                }
              }
            },
            convert: data => new HevalListedPizza(data.name, data.number, data.toppings)
          }
        },
        convert: data => new HevalPizzaCategory(data.name, data.prices, data.pizzas)
      }
    });

    const categories = scrapeResult.data.categories;
    const fantasiaCategory = this.constructFantasiaCategory(categories);

    return new HevalDataset([...categories, fantasiaCategory]);
  }
}
