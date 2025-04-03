import { select } from "@inquirer/prompts";
import { TEXT_PROCESSOR_TASKS } from "../../options.js";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
import { redBright } from "yoctocolors";
import { isOnline } from "../../../lib/scripts/util.js";
import { MainDialogPrompt } from "../../main.prompt.js";
/**
 * Presents a selection prompt to the user, allowing them to choose a text processing task.
 *
 * This function checks for internet connectivity and disables the 'translate' and 'summarized' options if offline.
 * It uses the `@inquirer/prompts` library for the interactive selection.
 *
 * @returns {Promise<AioTextProcessorMethods | string | undefined>} A promise that resolves to:
 *   - An `AioTextProcessorMethods` enum value representing the selected task.
 *   - The string 'back' if the user chooses to go back to the main menu.
 *   - The string 'quit' if the user chooses to quit the application.
 *   - `undefined` if an error occurs during the prompt.
 *
 * @example
 * // Example usage:
 * const selectedTask = await CreateSelectEnginePrompt();
 * if (typeof selectedTask === 'string') {
 *   console.log(`User selected: ${selectedTask}`);
 * }
 */
export async function CreateSelectEnginePrompt() {
    const online = await isOnline();
    const msg = `'Translate & Summarize features are '${redBright('DISABLED')},\nbecause your not connected to the Internet!'`;
    if (!online)
        console.log(msg);
    try {
        const selected = await select({
            message: "Select what you want to do with text data?",
            choices: TEXT_PROCESSOR_TASKS.map((menu) => ({
                name: menu.name,
                value: menu.value,
                disabled: !online && (menu.value === 'translate' || menu.value === 'summarized'),
            }))
        });
        if (selected === 'back') {
            const DIR = process.cwd();
            await MainDialogPrompt(DIR);
        }
        else if (selected === 'quit') {
            process.exit(0);
        }
        else {
            return selected;
        }
    }
    catch (error) {
        handlePromptError(error);
    }
}
