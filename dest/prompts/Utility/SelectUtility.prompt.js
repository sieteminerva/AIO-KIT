import { select } from "@inquirer/prompts";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { UTILITY_TASKS } from "../options.js";
import { SelectFileConverterPrompt } from "../FileConverter/prompt.js";
import { CompileDeclarationsFilesPrompt } from "./CompileDeclarationsFiles.prompt.js";
import { MainDialogPrompt } from "../main.prompt.js";
import { ImageConverterPrompt } from "../ImageProcessor/ImageConverter.prompt.js";
import { ImageOptimizerPrompt } from "../ImageProcessor/ImageOptimizer.prompt.js";
/**
 * Displays a prompt to select an AIO utility task and executes the corresponding action.
 *
 * This function presents a list of available utility tasks to the user, allowing them to choose
 * one. Based on the selection, it invokes the appropriate function to handle the task.
 * After the task is completed or if an error occurs, it recursively calls itself to display the
 * utility selection prompt again.
 *
 * @param DIR - The directory path where the utility task should operate.
 * @param filename - An optional filename that might be required by some utility tasks.
 *
 * @example
 * // Example usage: SelectUtilityPrompt('/path/to/directory', 'example.txt');
 */
export async function SelectUtilityPrompt(DIR, filename) {
    try {
        const task = await select({
            message: 'Choose AIO Utility Task',
            choices: UTILITY_TASKS.map((task) => ({ name: task.name, value: task.value })),
        });
        if (task) {
            switch (task) {
                case 'image-convert':
                    await ImageConverterPrompt(DIR, filename);
                    break;
                case 'image-optimizer':
                    await ImageOptimizerPrompt(DIR, filename);
                    break;
                case 'file-convert':
                    await SelectFileConverterPrompt(DIR, filename);
                    break;
                case 'compile':
                    await CompileDeclarationsFilesPrompt(DIR, filename);
                    break;
                case 'back':
                    await MainDialogPrompt(filename, DIR);
                    break;
                case 'quit':
                    process.exit(0);
            }
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await SelectUtilityPrompt(DIR, filename);
    }
}
