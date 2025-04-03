/**
 * Asynchronously creates an input prompt for the user, allowing them to input a string.
 *
 * This function utilizes the `@inquirer/prompts` library to display a prompt with a custom message and a default value.
 * It returns the user's input as a string.
 *
 * @param {string} message - The message to display in the input prompt.
 * @param {string} defaultVal - The default value to pre-fill in the input prompt.
 * @returns {Promise<string>} A promise that resolves with the user's input.
 */
export declare function CreateInputPrompt(message: string, defaultVal: string): Promise<string>;
