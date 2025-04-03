import { input, confirm, select, Separator } from "@inquirer/prompts";
import { greenBright, yellow, yellowBright } from 'yoctocolors';
import { join } from "path";
import { AioDataGenerator } from "../../class/DataGenerator.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { DATA_TYPES } from "../options.js";
import { writeFileTo } from "../../lib/scripts/util.js";
import { SchemaBuilderPrompt } from "./ScemaBuilder.prompt.js";
import { MainDialogPrompt } from "../main.prompt.js";
/**
 * `DataGeneratorPrompt` is an asynchronous function that orchestrates the process of generating data based on user input.
 * It presents a series of interactive prompts to the user, allowing them to choose a data type, specify the number of items to generate,
 * and configure options such as unique IDs and indexes.
 *
 * The function supports generating data from predefined types or using a custom schema defined through the `SchemaBuilderPrompt`.
 * It also handles navigation back to the main menu or quitting the application.
 *
 * @param DIR - The destination directory where the generated data will be saved. If not provided, it defaults to the current working directory.
 * @param schema - An optional schema object that defines the structure of the data to be generated. If provided, the data will be generated according to this schema.
 *
 * @returns A promise that resolves when the data generation process is complete or when the user navigates back or quits.
 *
 * @example
 * ```typescript
 * // Example 1: Generate 10 items of 'user' data type in the './data' directory.
 * await DataGeneratorPrompt('./data');
 *
 * // Example 2: Generate data based on a custom schema in the './output' directory.
 * const customSchema = {
 *   firstName: 'string',
 *   lastName: 'string',
 *   email: 'string',
 *   age: 'number'
 * };
 * await DataGeneratorPrompt('./output', customSchema);
 *
 * // Example 3: Generate data with default settings in the current working directory.
 * await DataGeneratorPrompt();
 * ```
 *
 * @remarks
 * - If the user selects 'custom', it navigates to the `SchemaBuilderPrompt` to define a custom schema.
 * - If the user selects 'back', it navigates to the `MainDialogPrompt`.
 * - If the user selects 'quit', the application exits.
 */
export async function DataGeneratorPrompt(DIR, schema) {
    const engine = new AioDataGenerator();
    try {
        const DEST_DIR = process.cwd();
        const DEST = DIR ? DIR : DEST_DIR;
        console.log('destination path: %s', DEST);
        // Mods data type array add custom and separator as choices
        const choices = [
            ...DATA_TYPES.map((menu) => ({ name: menu.name, value: menu.value })),
            new Separator(yellow('--------------------------')), // Add the separator here
            { name: `Custom ${greenBright(' [Schema Builder]')}`, value: 'custom' },
            { value: 'back', name: `Back to ${yellowBright('[Start]')}` },
            { value: 'quit', name: `${yellowBright('[Quit]')}` },
        ];
        const dataType = await select({
            message: 'Choose which type data of will be generated',
            choices
        });
        if (dataType === 'custom') {
            return await SchemaBuilderPrompt(DEST);
        }
        else if (dataType === 'back') {
            await MainDialogPrompt(DEST);
        }
        else if (dataType === 'quit') {
            process.exit(0);
        }
        else {
            // console.log('Data Type: ', dataType)
            const total = await input({ message: 'How many item do you want to add?', default: '15' });
            const useKey = await confirm({ message: 'Generate random unique ID?', default: true });
            const useIndex = await confirm({ message: 'Generate index?', default: false });
            const filename = await input({ message: 'Output Filename?', default: dataType });
            const data = engine.generateData(dataType, parseInt(total), useKey, useIndex, schema);
            const path = join(DEST, `${filename}.json`);
            // console.log(data)
            writeFileTo(path, data);
            console.log(greenBright(`Generating ${total} items of ${dataType} complete!`));
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await DataGeneratorPrompt(DIR, schema);
    }
}
