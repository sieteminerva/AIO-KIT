import { input } from "@inquirer/prompts";
import { basename, extname } from "path";
import { handlePromptError } from "../../ErrorHandler.prompt.js";

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
export async function WriteImageNamePrompt(filepath: string, ext: string): Promise<string | undefined> {
  try {
    const filename = basename(filepath, extname(filepath));
    const defaultName = filename + '_converted' + ext;

    let inputName = await input({
      message: 'Enter the name of converted file\'s.',
      default: defaultName,
    });

    if (inputName) {
      // Check if the input name has an extension or if the extension is different from the desired one.
      if (extname(inputName) === '' || !extname(inputName) || extname(inputName) !== ext) {
        // If no extension or incorrect extension, append the correct extension.
        inputName = inputName + ext;
      }
      return inputName;
    }
  } catch (error) {
    handlePromptError(error);
  }

}
