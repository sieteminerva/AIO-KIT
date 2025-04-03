import { input } from "@inquirer/prompts";
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
export async function CreateInputPrompt(message, defaultVal) {
    const msgs = [
        { message: 'Fill what do you want to find?', default: 'one' }
    ];
    const inputPrompt = await input({ message, default: defaultVal });
    return inputPrompt;
}
