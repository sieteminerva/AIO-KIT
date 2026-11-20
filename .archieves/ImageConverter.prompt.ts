import { checkbox } from "@inquirer/prompts";
import { greenBright } from "yoctocolors";
import { join } from "path";

import { AioImageConverter, ImageOptions } from "../../class/ImageConverter.class.js";
import { handlePromptError } from "../../prompts/ErrorHandler.prompt.js";
import { setImageOptionsPrompt } from "./SetImageOptions.js";


export async function imageConverterPromptV1(fromExt: string, toExt: string) {
  try {
    const DIR = process.cwd();
    const converter = new AioImageConverter();
    const folder = await converter.search(DIR, fromExt, false);
    // console.log(`Found files:`, folder); // Debugging
    const fileSelected = await checkbox({
      message: 'select file in folder',
      choices: folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) }))
    });
    if (Array.isArray(fileSelected) && fileSelected.length > 0) {
      // console.log('File Selected : ', fileSelected);
      for (const filepath of fileSelected) {
        let file;
        if (['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif'].includes(fromExt)) {
          // implements image conversions
          // insert prompt to add options
          const options = await setImageOptionsPrompt(fromExt);
          const outputDir = undefined;
          switch (toExt) {
            case '.jpg':
              await converter.img(filepath).toImg(toExt, outputDir, options as ImageOptions);
              break;
            case '.png':
              await converter.img(filepath).toImg(toExt, outputDir, options as ImageOptions);
              break;
            case '.webp':
              await converter.img(filepath).toImg(toExt, outputDir, options as ImageOptions);
              break;
            case '.gif':
              await converter.img(filepath).toImg(toExt, outputDir, options as ImageOptions);
              break;
            case '.tiff':
              await converter.img(filepath).toImg(toExt, outputDir, options as ImageOptions);
              break;
            default:
              console.warn(`Unsupported image conversion: ${fromExt} to ${toExt}`);
              break;
          }
        }
      };
    }
    const msg = greenBright(`${fileSelected.length} files successfully converted to '${toExt}'`);
    console.log(msg);
  } catch (error) {
    handlePromptError(error);
  }
}