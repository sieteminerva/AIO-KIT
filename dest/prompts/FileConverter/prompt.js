import { select } from "@inquirer/prompts";
import { FileConverterPrompt } from "./FileConverter.prompt.js";
import { UTIL_TYPES } from "../options.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { MainDialogPrompt } from "../main.prompt.js";
/**
 * Presents a selection prompt to the user for choosing a file conversion task.
 *
 * This function displays a list of available file conversion options, including
 * converting between JSON, CSV, and YAML formats. It also provides options to
 * navigate back to the main menu or quit the application.
 *
 * @param DIR - The current directory path.
 * @param filename - The current filename (not directly used in this function, but passed for consistency).
 *
 * @example
 * ```typescript
 * await SelectFileConverterPrompt('/path/to/directory', 'example.txt');
 * ```
 */
export async function SelectFileConverterPrompt(DIR, filename) {
    try {
        const task = await select({
            message: 'Choose File to Convert',
            choices: UTIL_TYPES.map((menu) => ({ name: menu.name, value: menu.value })),
        });
        switch (task) {
            case 'json to csv':
                FileConverterPrompt('.json', '.csv');
                break;
            case 'csv to json':
                FileConverterPrompt('.csv', '.json');
                break;
            case 'json to yaml':
                FileConverterPrompt('.json', '.yaml');
                break;
            case 'yaml to json':
                FileConverterPrompt('.yaml', '.json');
                break;
            case 'csv to yaml':
                FileConverterPrompt('.csv', '.yaml');
                break;
            case 'yaml to csv':
                FileConverterPrompt('.yaml', '.csv');
                break;
            case 'back':
                await MainDialogPrompt(DIR);
                break;
            case 'quit':
                process.exit(0);
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await SelectFileConverterPrompt(DIR, filename);
    }
}
