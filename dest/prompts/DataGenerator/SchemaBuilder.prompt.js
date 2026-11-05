import { input, rawlist, Separator, select } from "@inquirer/prompts";
import { AioDataGenerator } from "../../class/DataGenerator.class.js";
import { writeFileTo } from "../../lib/scripts/util.js";
/**
 * `SchemaBuilderPrompt` is an asynchronous function that guides the user through the process of creating a custom data schema.
 * It allows the user to define keys and their corresponding data types, and then generates a specified quantity of data based on this schema.
 *
 * @param {string} [DIR] - An optional directory path where the generated data file will be saved. If not provided, it defaults to the current working directory.
 *
 * @returns {Promise<any>} - Returns a promise that resolves with the generated schema object.
 *
 * @example
 * // Example usage:
 * SchemaBuilderPrompt('./output').then(schema => {
 *   console.log('Generated Schema:', schema);
 * });
 *
 * // This will prompt the user to define a schema, generate data based on it, and save the data to a JSON file in the './output' directory.
 */
export async function SchemaBuilderPrompt(DIR) {
    const engine = new AioDataGenerator();
    const schema = {};
    let addMore = true;
    // generate dynamic input based on user input
    while (addMore) {
        const schemaKey = await input({ message: 'Set key name (e.g., name, email, age)' });
        const schemaType = await rawlist({
            message: 'set schema type',
            choices: [
                { name: 'key', value: 'random.uuid()' },
                { name: 'username', value: 'name.findName()' },
                { name: 'email', value: 'internet.email()' },
                { name: 'address', value: 'address.streetAddress()' },
                { name: 'short paragraph', value: 'lorem.paragraph()' },
                { name: 'long paragraph', value: 'lorem.paragraphs()' },
                { name: 'date', value: 'date.past()' },
                { name: 'price', value: 'finance.amount()' },
                { name: 'image Url', value: 'image.imageUrl()' },
                { name: 'phone number', value: 'phone.phoneNumber()' },
                new Separator(),
                { name: 'custom', value: 'custom' },
            ]
        });
        if (schemaType === 'custom') {
            const customType = await input({ message: 'Enter custom type (e.g., string, number, boolean)' });
            schema[schemaKey] = customType;
        }
        else {
            schema[schemaKey] = schemaType;
        }
        const selectCmd = await select({
            message: '', choices: [
                { name: 'Add new key', value: 'add' },
                { name: 'Done', value: 'done' }
            ]
        });
        addMore = selectCmd === 'add';
    }
    const qty = await input({ 'message': 'How many item you want to generate?', default: '10' });
    const fileName = await input({ message: 'Enter file name', default: 'custom_data' });
    const data = engine.generateData('custom', Number(qty), false, false, schema);
    // console.log(schema);
    // console.log('Custom Schema Data:', data);
    const outputPath = DIR ? DIR : process.cwd();
    // console.log(outputPath);
    writeFileTo(`${outputPath}\\${fileName}.json`, data);
    return schema;
}
