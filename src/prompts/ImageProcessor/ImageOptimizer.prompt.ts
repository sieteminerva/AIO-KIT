import { number, select } from "@inquirer/prompts";
import { extname, join, resolve } from "path";
import { greenBright } from "yoctocolors";
import { AioImageProcessor, ImageOptions } from "../../class/ImageProcessor.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { SelectImageFilesPrompt } from "./components/SelectImageFiles.prompt.js";
import { SetWatermarkOptionsPrompt } from "./components/SetWatermark.prompt.js";
import { SetResizeOptionsPrompt } from "./components/SetResizeOptions.prompt.js";
import { Dirent } from "fs";


/**
 * Orchestrates the image optimization process, guiding the user through various settings and options.
 * It handles: 
 * - file selection, 
 * - format conversion, 
 * - resizing, 
 * - watermarking, and 
 * - quality adjustments.
 *
 * @param {string} filepath - The path to the directory containing the images to be optimized.
 * @param {string} [filename=''] - An optional filename to further specify the target directory.
 * @returns {Promise<void>} - Resolves when the optimization process is complete.
 */
export async function ImageOptimizerPrompt(filepath: string, filename: string = ''): Promise<void> {
  try {
    let options: ImageOptions = {
      // tell early that it is the optimization tasks
      optimize: true,
      // set filename `suffix`
      suffix: 'optimized'
    };

    const DIR = filepath
      ? resolve(join(process.cwd(), filepath, filename))
      : join(process.cwd());

    const converter = new AioImageProcessor();

    const settings = converter.settings;
    // set output `Format`
    const imageOutputFormat = await select({
      message: 'Select Output Image Format:',
      choices: [
        { name: 'webp', value: 'webp' },
        { name: 'png', value: 'png' }

      ]
    });

    // search for images in `process.cwd()` with filtered extensions
    const imageToSearch = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.tiff'];
    const folder = await converter.search(DIR, imageToSearch, false) as Dirent[];
    const fileSelected = await SelectImageFilesPrompt(folder);

    // set `Resize` options
    const resizeOptions = await SetResizeOptionsPrompt();

    // set `Watermark` options
    const watermarkOptions = await SetWatermarkOptionsPrompt();

    Object.assign(options, watermarkOptions, resizeOptions);

    // set image `Quality`
    options.quality = await number({
      message: 'the `Image Quality` is set to 70, do you need to change it? (1-100)',

      default: 70,
    });

    if (Array.isArray(fileSelected) && fileSelected.length > 0) {
      for (const filepath of fileSelected) {
        // convert extension to format
        const ext = extname(filepath).slice(1);

        // set the optimization options
        if (ext === 'jpeg' || ext === 'jpg') {
          options.mozjpeg = true;
          options.progressive = true;
        } else if (ext === 'png' || imageOutputFormat === 'png') {
          options.compressionLevel = 8;
          options.progressive = true;
          options.force = imageOutputFormat === 'png' ? true : false;
        } else if (ext === 'webp' || imageOutputFormat === 'webp') {
          options.nearLossless = true;
          options.effort = 6;
          options.force = imageOutputFormat === 'webp' ? true : false;
        }

        // console.log('filepath input =>', filepath);
        await converter.img(filepath).toImg(imageOutputFormat as any, options);

      }

      const msg = greenBright(`${fileSelected.length} files successfully converted.`);
      console.log(msg);
    }

  } catch (error) {

    handlePromptError(error);
  } finally {
    await ImageOptimizerPrompt(filepath, filename);
  }
}
