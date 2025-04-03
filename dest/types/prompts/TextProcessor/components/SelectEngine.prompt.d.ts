import { AioTextProcessorMethods } from "../../../class/TextProcessor.class.js";
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
export declare function CreateSelectEnginePrompt(): Promise<AioTextProcessorMethods | string | undefined>;
