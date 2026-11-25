import { confirm, input } from "@inquirer/prompts";
import { basename, extname } from "path";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
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
export function SetDefaultFilename(filepath: string, engine: AioTextProcessorMethods, qty?: number): string {

  let defaultName: string | string[] = '';
  let ext = extname(filepath as string);
  const selectedFilename = basename(filepath as string, ext);
  // temporary fix so the result can be read not flagged as 
  // corrupt files by the software
  if (ext === 'docx' || ext === '.pdf') {
    // selectedFilename.replace(ext, '.txt');
    ext = '.txt';
  }
  if (qty as number > 0) {
    defaultName = [];
    for (let i = 0; i < (qty as number); i++) {
      const indexName = `${selectedFilename}_${engine}_${i + 1}${ext}`;
      defaultName.push(indexName);
    }
    console.log(defaultName);
  } else {
    defaultName = `${engine}_${selectedFilename}${ext}`;
  }

  return defaultName as any;
}

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

export async function WriteTextFilesPrompt(filepath: string | string[], engine: AioTextProcessorMethods, multiple: boolean | number = false): Promise<string | undefined> {
  try {
    // console.log('multiple', multiple);
    const confirmWrite = await confirm({
      message: 'Would you like to save the content to a file?',
      default: true,
      transformer: (answer) => (answer ? 'Yes' : 'No'),
    });
    console.log('filepath :', filepath);
    if (confirmWrite) {
      const inputName = await input({
        message: 'Enter the file\'s name.',
        default: multiple ? SetDefaultFilename(filepath as any, engine, multiple as number) : SetDefaultFilename(filepath as any, engine),
      });
      //console.log('inputName :', inputName);
      return inputName;
    } else {
      return;
    }
  } catch (error) {
    handlePromptError(error);
  }

}
