import { checkbox } from "@inquirer/prompts";
import { extname, join } from "node:path";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
import { yellowBright } from "yoctocolors";
export async function SelectTextFilesPrompt(folder, engine) {
    /**
     * Creates a prompt to select files from a given folder.
     *
     * This function displays a checkbox prompt allowing the user to select multiple files from a list of files in a specified folder.
     * It validates the selected files based on the provided engine and ensures that the selected files are text files.
     *
     * @param folder - An array of Dirent objects representing the files in the folder.
     * @param engine - The type of text processing engine to use, which determines the validation rules.
     * @returns A promise that resolves to an array of selected file paths.
     * @example
     * ```typescript
     * const selectedFiles = await CreateSelectFilesPrompt(folderContent, 'merge');
     * ```
     */
    try {
        if (folder.length === 0) {
            console.log(yellowBright('file not found!'));
            return [];
        }
        const choices = folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) }));
        const files = await checkbox({
            message: 'Select files to process?\n',
            choices,
            validate(choices) {
                return textFilesValidation(choices, engine);
            },
        });
        return files;
    }
    catch (error) {
        handlePromptError(error);
    }
}
/**
 * Validates the selected files based on the engine type and file extensions.
 *
 * This function checks if the user has selected at least one file,
 * verifies the number of selected files against the allowed limit based on the engine,
 * and ensures that all selected files have allowed text file extensions.
 *
 * @param files - An array of selected file paths.
 * @param engine - The type of text processing engine, which determines the validation rules.
 * @returns `true` if the files are valid, or an error message string if not.
 * @example
 * ```typescript
 * // Example usage within the checkbox prompt's validate function:
 * const files = await checkbox({
 *   message: 'Select files to process?',
 *   choices: [...],
 *   validate(choices) {
 *     return textFilesValidation(choices, 'merge');
 *   },
 * });
 *
 * // Example of how the validation rules work:
 * // For 'merge' or 'purify' engine, any number of files is allowed.
 * // For 'compare' engine, only 2 files are allowed.
 * // For any other engine, only 1 file is allowed.
 * // Only files with extensions .txt, .pdf, .doc, .docx, .md, .rtf are allowed.
 *
 * // If the user selects no files, it returns 'You must select a file'.
 * // If the user selects more than the allowed number of files, it returns 'You only can select at max [number] files'.
 * // If the user selects a file with an invalid extension, it returns '[extension] is not a text file. Only text files are allowed!'.
 * ```
 */
function textFilesValidation(files, engine) {
    // must select a file
    if (files.length === 0) {
        return 'You must select a file';
    }
    // set validation how many files selected are allowed!
    let totalAllowedFiles = 1;
    switch (engine) {
        case 'merge':
        case 'purify':
            totalAllowedFiles = Number.MAX_VALUE; // means not limited
            break;
        case 'compare':
            totalAllowedFiles = 2;
            break;
        default:
            totalAllowedFiles = 1;
            break;
    }
    if (files.length > totalAllowedFiles) {
        return `You only can select at max ${totalAllowedFiles} files`;
    }
    // only can select text files
    const allowed_extensions = [
        '.txt', '.pdf', '.doc',
        '.docx', '.md', '.rtf',
    ];
    for (const file of files) {
        const file_ext = extname(file.name).toLowerCase();
        if (!allowed_extensions.includes(file_ext)) {
            return file_ext + ' is not a text file. Only text files are allowed!';
        }
    }
    return true;
}
