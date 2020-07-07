import * as chalk from 'chalk';
import * as fuzzy from 'fuzzy';
import * as inquirer from 'inquirer';
import * as inquirerCheckboxPlusPrompt from 'inquirer-checkbox-plus-prompt';

// eslint-disable-next-line no-unused-vars
import { HevalTopping } from './heval-topping';
import { formatEuros } from './util';
// eslint-disable-next-line no-unused-vars
import { Optimizer, OptimizerResult } from './optimizer';
import { Scraper } from './scraper';

inquirer.registerPrompt('checkbox-plus', inquirerCheckboxPlusPrompt);

const createOptimizerResultConsoleOutput = (results: OptimizerResult[]) => {
  let output = '';

  output += chalk.bold('\nTulokset:\n');

  for (const result of results) {
    output += '\n';

    output += chalk.bold(result.getPizza().getDisplayName());

    output += '\n';

    const formatToppingList = (toppings: HevalTopping[]) =>
      toppings
        .sort(HevalTopping.sortAlphabetically)
        .map(topping => topping.getName())
        .join(', ');

    if (result.hasIncludedToppings()) {
      output += chalk.green(`• ${formatToppingList(result.getIncludedToppings())}`);
    }

    if (result.hasAdditionalToppings()) {
      output += chalk.gray(`, ${formatToppingList(result.getAdditionalToppings())}`);
    }

    output += '\n';

    if (result.hasMissingToppings()) {
      output += chalk.red(`+ ${formatToppingList(result.getMissingToppings())}`);
      output += '\n';
    }

    let priceString = chalk.bold(formatEuros(result.getTotalPrice()));

    if (result.getMissingToppings().length > 1) {
      priceString += ` (${formatEuros(result.getBasePrice())} + ${
        result.getMissingToppings().length
      } * ${formatEuros(HevalTopping.EXTRA_PRICE)})`;
    } else if (result.getMissingToppings().length === 1) {
      priceString += ` (${formatEuros(result.getBasePrice())} + ${formatEuros(
        HevalTopping.EXTRA_PRICE
      )})`;
    }

    output += `Hinta: ${priceString}`;

    output += '\n';
  }

  return output;
};

const exec = async () => {
  console.log(chalk.bold(chalk.underline('H E V A L   O P T I M I Z E R\n')));

  const scraper = new Scraper();

  console.log(chalk.bold('Odota hetki...'));

  console.log('');

  const dataset = await scraper.scrapeHevalDataset();

  const answers = await inquirer.prompt<{
    size: string;
    toppings: string[];
  }>([
    {
      name: 'size',
      message: 'Valitse koko',
      type: 'list',
      choices: dataset.getAvailableSizes()
    },
    {
      name: 'toppings',
      message: 'Valitse täytteet',
      type: 'checkbox-plus',
      pageSize: 10,
      searchable: true,
      choices: dataset
        .getAvailableToppings()
        .sort(HevalTopping.sortAlphabetically)
        .map(topping => ({
          name: topping.getName(),
          value: topping
        })),
      validate(answers: HevalTopping[]) {
        if (answers.length > 0) return true;
        return 'Valitse vähintään yksi (1) täyte.';
      },
      async source(_selections: HevalTopping[], input: string) {
        const filterResult = fuzzy.filter(input, dataset.getAvailableToppings(), {
          extract: topping => topping.getName()
        });
        return filterResult.map(({ original }) => original).sort(HevalTopping.sortAlphabetically);
      }
    }
  ]);

  const optimizer = new Optimizer(dataset);

  const results = optimizer.findPizzas(
    {
      size: answers.size,
      toppings: answers.toppings.map(name => dataset.findToppingByName(name))
    },
    { count: 5 }
  );

  console.log(createOptimizerResultConsoleOutput(results));
};

exec();
