import { AioTextProcessorMethods } from "../../../class/TextProcessor.class.js";
/**
 * Generates a default filename based on the provided filepath, engine, and quantity.
 *
 * @param {string} filepath - The path of the file.
 * @param {AioTextProcessorMethods} engine - The engine used for processing.
 * @param {number} [qty] - The quantity of files to generate names for. If greater than 0, an array of filenames is returned.
 * @returns {string | string[]} - The default filename or an array of default filenames.
 *
 * @example
 * // Returns "translate_myFile.txt"
 * SetDefaultFilename("myFile.docx", "translate");
 *
 * @example
 * // Returns ["myFile_translate_1.txt", "myFile_translate_2.txt", "myFile_translate_3.txt"]
 * SetDefaultFilename("myFile.pdf", "translate", 3);
 *
 * @remarks
 * - If the file extension is 'docx' or 'pdf', it's temporarily changed to '.txt'.
 * - If `qty` is greater than 0, it generates an array of filenames with an index.
 * - Otherwise, it generates a single filename.
 */
export declare function SetDefaultFilename(filepath: string, engine: AioTextProcessorMethods, qty?: number): string;
/**
 * Prompts the user to confirm if they want to save the content to a file and, if so, to enter the file's name.
 *
 * @param {string | string[]} filepath - The path of the file or an array of file paths.
 * @param {string} engine - The engine used for processing.
 * @param {boolean | number} [multiple=false] - Indicates if multiple files are being processed. If a number, it represents the quantity of files.
 * @returns {Promise<string | undefined>} - The filename entered by the user, or undefined if the user chooses not to save.
 *
 * @example
 * // Prompts the user to confirm saving and enter a filename.
 * // If the user confirms and enters "myOutput.txt", it returns "myOutput.txt".
 * // If the user declines, it returns undefined.
 * await CreateWriteFilePrompt("myInput.txt", "translate");
 *
 * @example
 * // Prompts the user to confirm saving and suggests default filenames based on the quantity.
 * // If the user confirms, it returns the filename entered by the user.
 * // If the user declines, it returns undefined.
 * await CreateWriteFilePrompt("myInput.pdf", "translate", 3);
 */
export declare function WriteTextFilesPrompt(filepath: string | string[], engine: AioTextProcessorMethods, multiple?: boolean | number): Promise<string | undefined>;
