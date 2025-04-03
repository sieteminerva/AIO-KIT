import { select } from "@inquirer/prompts";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { ImageOptimizerPrompt } from "./ImageOptimizer.prompt.js";
import { ImageConverterPrompt } from "./ImageConverter.prompt.js";
import { SelectUtilityPrompt } from "../Utility/SelectUtility.prompt.js";
import { yellowBright } from "yoctocolors";
/**
 * Displays a dialog to select an `image processing` task.
 *
 * This function presents a menu to the user, allowing them to choose between
 * optimizing an image, converting an image, returning to the utility menu, or quitting.
 * @param filename - The name of the file being processed.
 * @param DIR - The directory where the file is located.
 */
export async function SelectImageTaskDialog(filename, DIR) {
    try {
        const menu = await select({
            message: 'Select task you wanted to run?',
            choices: [
                { name: 'Image Optimizer', value: 'optimize' },
                { name: 'Image Converter', value: 'convert' },
                { name: `Back to ${yellowBright('[Utility]')}`, value: 'back' },
                { name: 'Quit', value: 'quit' }
            ]
        });
        if (menu === "optimize")
            await ImageOptimizerPrompt(DIR, filename);
        else if (menu === 'convert')
            await ImageConverterPrompt(DIR, filename);
        else if (menu === 'back')
            await SelectUtilityPrompt(DIR, filename);
        else if (menu === 'quit')
            process.exit(0);
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await SelectImageTaskDialog(filename, DIR);
    }
}
