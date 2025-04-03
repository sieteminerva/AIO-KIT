import { checkbox } from "@inquirer/prompts";
import { greenBright } from "yoctocolors";
import { join } from "path";
import { AioFileConverter } from "../../class/FileConverter.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { Dirent } from "fs";

/**
 * Prompts the user to select files for conversion and then converts them to the specified format.
 *
 * This function first searches for files in the current working directory that match the `toExt` extension.
 * It then presents the user with a checkbox prompt to select which files they want to convert.
 * After the user makes their selection, the function iterates through the selected files,
 * reads their content based on the `fromExt` extension, converts the content to the `toExt` format,
 * and writes the converted content to a new file with the updated extension.
 *
 * @param fromExt - The original file extension (e.g., '.yaml', '.csv', '.json').
 * @param toExt - The target file extension to convert to (e.g., '.csv', '.yaml', '.json').
 *
 * @example FileConverterPrompt('.yaml', '.csv') // Convert all selected .yaml files to .csv
 */
export async function FileConverterPrompt(fromExt: string, toExt: string) {
  try {
    const DIR = process.cwd();
    const converter = new AioFileConverter();
    const folder = await converter.search(DIR, toExt, false) as Dirent[];
    // console.log(`Found files:`, folder); // Debugging
    const fileSelected = await checkbox({
      message: 'Select files to convert\n',
      choices: folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) }))
    });
    if (Array.isArray(fileSelected) && fileSelected.length > 0) {
      // console.log('File Selected : ', fileSelected);
      for (const filepath of fileSelected) {
        let file;

        // console.log(`Processing file: ${filepath}`); // Debugging
        switch (fromExt) {
          case '.yaml':
            file = await converter.yaml(filepath);
            break;
          case '.csv':
            file = await converter.csv(filepath);
            break;
          default:
            file = await converter.json(filepath);
            break;
        }
        // console.log(`=== json:`, file.content); //Debugging
        switch (toExt) {
          case '.csv':
            file.toCsv();
            break;
          case '.yaml':
            file.toYaml();
            break;
          default:
            file.toJson();
            break;
        }
        // console.log(`=== csv:`, file.content); //Debugging
        await converter.write(filepath.replace(fromExt, toExt), file.content as any);
      };
    }
    const msg = greenBright(`${fileSelected.length} files successfully converted to '${toExt}'`);
    console.log(msg);
  } catch (error) {
    handlePromptError(error);
  }
}
