import { select } from "@inquirer/prompts";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { UTILITY_TASKS } from "../options.js";
// Task modules are imported lazily in the switch below.
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
export async function SelectUtilityPrompt(DIR, filename, options) {
    try {
        // Clear Console before executing select AIO Utility task 
        console.clear();
        const task = await select({
            message: 'Choose AIO Utility Task',
            choices: UTILITY_TASKS.map((task) => ({ name: task.name, value: task.value })),
        });
        if (task) {
            switch (task) {
                case 'image-convert': {
                    const { ImageConverterPrompt } = await import("../Image/ImageConverter.prompt.js");
                    await ImageConverterPrompt(DIR, filename);
                    break;
                }
                case 'image-optimizer': {
                    const { ImageOptimizerPrompt } = await import("../Image/ImageOptimizer.prompt.js");
                    await ImageOptimizerPrompt(DIR, filename);
                    break;
                }
                case 'file-convert': {
                    const { SelectFileConverterPrompt } = await import("../File/prompt.js");
                    await SelectFileConverterPrompt(DIR, filename, options);
                    break;
                }
                case 'compile': {
                    const { CompileDeclarationsFilesPrompt } = await import("./CompileDeclarationsFiles.prompt.js");
                    await CompileDeclarationsFilesPrompt(DIR, filename);
                    break;
                }
                case 'back': {
                    const { MainDialogPrompt } = await import("../main.prompt.js");
                    await MainDialogPrompt(filename, DIR);
                    break;
                }
                case 'quit':
                    process.exit(0);
            }
        }
        return task;
    }
    catch (error) {
        handlePromptError(error);
    }
}
