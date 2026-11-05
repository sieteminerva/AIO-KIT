import { checkbox } from "@inquirer/prompts";
import { gray, greenBright, yellowBright } from "yoctocolors";
import { extname, join } from "path";
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
export async function FileConverterPrompt(fromExt: string, toExt: string, options?: any) {
  try {
    const DIR = process.cwd();
    const converter = new AioFileConverter();
    const folder = await converter.search(DIR) as Dirent[];
    // console.log(`Found files:`, folder); // Debugging

    // Clear console before executing checkbox file selector
    // console.clear();

    const fileSelected = await checkbox({
      message: 'Select file(s) to convert\n',
      choices: folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) })),
      validate(choices) {
        return converterFilesValidation(choices as any, fromExt);
      },
    });
    if (Array.isArray(fileSelected) && fileSelected.length > 0) {
      // console.log('File Selected : ', fileSelected);
      console.clear();
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
          case '.html':
            file = await converter.html(filepath, options);
            break;
          case '.md':
            file = await converter.md(filepath);
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
          case '.json':
            file.toJson();
            break;
          case '.md':
            file.toMd();
            break;
          case '.html':
            file.toHtml();
            break;
        }
        // console.log(`=== csv:`, file.content); //Debugging
        await converter.write(filepath.replace(fromExt, toExt), file.content as any);

        const msg2 = gray(`${filepath}`)
        console.log('Converting:', msg2);
      };
    }
    const msg = greenBright(`${fileSelected.length} file(s) successfully converted to '${toExt}'`);
    const msg2 = yellowBright(`\n\nSelect another files or 'Ctrl + C' to Quit!\n`)
    console.log(msg, msg2);
    return fileSelected;
  } catch (error) {
    handlePromptError(error);
  } finally {
    await FileConverterPrompt(fromExt, toExt)
  }
}

function converterFilesValidation(files: File[], fromExt: string) {
  // must select a file
  if (files.length === 0) {
    return 'You must select at least a file';
  }

  // only with `fromExt` files are allowed to select
  for (const file of files) {
    const file_ext = extname(file.name).toLowerCase();
    if (file_ext !== fromExt) {
      return file.name + ` is not a ${fromExt} file. Only ${fromExt} files are allowed!`;
    }
  }

  return true;
}