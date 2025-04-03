import { extname, join } from "path";
import { yellowBright } from "yoctocolors";
import { checkbox } from "@inquirer/prompts";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
import { IMAGE_FORMATS } from "../../options.js";
/**
 * Prompts the user to select image files from a given folder.
 *
 * @param {Dirent[]} folder - Array of Dirent objects representing the files in the folder.
 * @returns {Promise<string[] | undefined>} - A promise that resolves to an array of selected file paths or undefined if an error occurs.
 * The prompt allows the user to choose from a list of available image files.
 * If the folder is empty, logs a message and returns an empty array.
 * Uses a checkbox prompt to display file choices and validates them using `imageFilesValidation`.
 * Handles any errors by invoking `handlePromptError`.
 * @example
 * ```typescript
 * await SelectImageFilesPrompt([{ name: 'image1.jpg', path: '/path/to/image1.jpg' }]);
 * ```
 */
export async function SelectImageFilesPrompt(folder) {
    try {
        if (folder.length === 0) {
            console.log(yellowBright('file not found!'));
            return [];
        }
        const choices = folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) }));
        const files = await checkbox({
            message: 'Select image files to process?\n',
            choices,
            validate(choices) {
                return imageFilesValidation(choices);
            },
        });
        return files;
    }
    catch (error) {
        handlePromptError(error);
    }
}
/**
 * Validates the selected image files from the user.
 * Returns true if all selected files are valid, otherwise returns an error message.
 * A file is considered valid if it has an extension that is included in the IMAGE_FORMATS array.
 */
function imageFilesValidation(files) {
    // must select a file
    if (files.length === 0) {
        return 'You must select a file';
    }
    for (const file of files) {
        const file_ext = extname(file.name).toLowerCase().substring(1);
        if (!IMAGE_FORMATS.includes(file_ext)) {
            return file_ext + ' is not an image file. Only image files are allowed!';
        }
    }
    return true;
}
