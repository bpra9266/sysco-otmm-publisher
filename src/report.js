import pino from "pino";
import * as fs from "fs";
import axiosRetry from 'axios-retry';
import { createObjectCsvWriter } from "csv-writer";
import axios from 'axios';

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const finalData = [];
const csvWriter = createObjectCsvWriter({
    path: 'output.csv',
    header: [
      { id: 'recipeName', title: 'Recipe Name' },
      { id: 'wpid', title: 'Recipe Id' },
      { id: 'ingredientTitle', title: 'Ingredient Title' },
      { id: 'subtitle', title: 'subtitle' },
      { id: 'ingredient', title: 'ingredient' },
      { id: 'supc', title: 'supcs' },
      { id: 'cuisine', title: 'cuisine' },
    ]
  });

export const reportGenerator = () => {
  logger.info("start report generating");
  const recipes = JSON.parse(fs.readFileSync('./recipes-report.json', 'utf8'));
  // read the data from the JSON file
  for (const recipe of recipes) {
    const data = recipe.data;
    const metaData = recipe.metadata;
    const ingredients = data.ingredients;
    for (const ingredient of ingredients) {
      const title = ingredient.title;
      const items = ingredient.ingredient_items;
      for (let item of items) {
        const subTitle = item.subtitle
        const ingredientList = item.ingredient_list;
        for (let list of ingredientList) {
          // if (list.supc_data === null || list.supc_data.length === 0) {
          const response = {
            ingredient: list.ingredient,
            recipeName: data.title,
            wpid: metaData.wpid,
            subtitle: subTitle,
            ingredientTitle: title,
            supc: list.supc_data.join(', '),
            cuisine: metaData.cuisines.map((cuisine) => cuisine.value).join(', '),
          }

          finalData.push(response);
          // }
        }

      }
    }
  }

  csvWriter
    .writeRecords(finalData)
    .then(() => console.log('CSV file has been written successfully'))
    .catch((err) => console.error(err));
}


reportGenerator();
