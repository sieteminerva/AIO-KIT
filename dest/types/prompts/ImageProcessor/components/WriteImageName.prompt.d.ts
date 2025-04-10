/**
 * Prompts the user to enter a name for the converted image file.
 *
 * This function takes the original filepath and the desired extension as input.
 * It extracts the base filename from the filepath and constructs a default name
 * by appending "_converted" and the desired extension.
 * It then prompts the user to enter a name, providing the default name as a suggestion.
 * If the user's input doesn't include the correct extension, it automatically appends it.
 *
 * @param {string} filepath - The original filepath of the image.
 * @param {string} ext - The desired extension for the converted image (e.g., ".png", ".jpg").
 * @returns {Promise<string | undefined>} The name of the converted file, or undefined if an error occurs.
 * @throws {Error} Throws an error if there is an issue with the prompt or file operations.
 * @example
 * ```typescript
 *  const convertedName = await WriteImageNamePrompt('/path/to/image.jpg', '.png');
 * ```
 */
export declare function WriteImageNamePrompt(filepath: string, ext: string): Promise<string | undefined>;
