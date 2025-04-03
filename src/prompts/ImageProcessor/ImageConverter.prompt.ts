import { select } from "@inquirer/prompts";
import { dirname, join, resolve } from "path";
import { greenBright } from "yoctocolors";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { AioImageProcessor } from "../../class/ImageProcessor.class.js";
import { IMAGE_FORMATS } from "../options.js";
import { SetAdvancedImageOptionsPrompt } from "./components/AdvancedImageOptions.prompt.js";
import { SelectImageFilesPrompt } from "./components/SelectImageFiles.prompt.js";
import { WriteImageNamePrompt } from "./components/WriteImageName.prompt.js";
import { Dirent } from "fs";


/**
 * Orchestrates the image conversion process, guiding the user through: 
 * - `selecting files`,
 * - choosing `output format`, 
 * - setting `advanced options`, and 
 * - specifying `output names`.
 *
 * @param {string} filepath - The path to the directory containing the images.
 *                             If empty, defaults to the current working directory.
 * @param {string} filename - The name of the file or directory within the filepath.
 *                            If filepath is empty, this parameter is ignored.
 * @returns {Promise<void>} - Resolves when the conversion process is complete.
 */
export async function ImageConverterPrompt(filepath: string, filename: string): Promise<void> {

  try {
    const DIR = filepath
      ? resolve(join(process.cwd(), filepath, filename))
      : join(process.cwd());

    // 1. Initialize the image converter.
    const converter = new AioImageProcessor();

    // 2. Search for available image files in the specified directory.
    const folder = await converter.search(DIR, IMAGE_FORMATS, false) as Dirent[];
    console.log(`Found file :`, greenBright(`${folder.length} image files`));
    // console.log(`Found files:`, folder); // Debugging

    // 3. Prompt the user to select image files for conversion.
    const fileSelected = await SelectImageFilesPrompt(folder);
    // console.log(`Selected Files:`, fileSelected); // Debugging

    if (Array.isArray(fileSelected) && fileSelected.length > 0) {

      // 4. Prompt the user to select the desired output image format.
      const imageOutputFormat = await select({
        message: 'Select Image Output Format.', // TODO add `back & quit` to menu item
        choices: IMAGE_FORMATS.map((ext) => ({ name: ext, value: ext })),
      });
      //console.log(`Output Format:`, imageOutputFormat); // Debugging

      for (const filepath of fileSelected) {
        //console.log('inProcess File', filepath) // Debugging

        // 5. Prompt the user to set advanced image conversion options.
        const options = await SetAdvancedImageOptionsPrompt(imageOutputFormat);
        // console.log("Image Options :", options);
        options.suffix = 'converted';
        // 6. Prompt the user to confirm or modify the output file name.
        const outputExt = '.' + imageOutputFormat
        const outputName = await WriteImageNamePrompt(filepath, outputExt);
        // console.log("outputName :", outputName)
        if (outputName) {
          // 7. Determine the output directory and construct the full output path.
          const outputDir = dirname(filepath);
          // console.log("outputDir :", outputDir)
          const outputPath = join(outputDir, outputName as string);
          // console.log("Prompt       => outputPath :", outputPath)
          await converter.img(filepath).toImg(outputPath, options);
        }

      }
      // 8. Notify the user that the conversion process is complete.
      const msg = greenBright(`${fileSelected.length} files successfully converted.`);
      console.log(msg);
    }
  } catch (error) {
    handlePromptError(error);
  } finally {
    // 9. Restart the prompt after the process is complete or an error occurs.
    await ImageConverterPrompt(filepath, filename);
  }
}
