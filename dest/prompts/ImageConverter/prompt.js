import { select } from "@inquirer/prompts";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { ImageOptimizerPrompt } from "./imageOptimizer.prompt.js";
import { ImageConverterPrompt } from "./imageConverter.prompt.js";
import { SelectUtilityPrompt } from "../Utility/SelectUtility.prompt.js";
import { yellowBright } from "yoctocolors";
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
