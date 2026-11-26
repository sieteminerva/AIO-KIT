import { input } from "@inquirer/prompts";
import { extname, resolve } from "node:path";
import { existsSync } from "node:fs";
import { greenBright, red, yellowBright } from "yoctocolors";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { AioImageProcessor } from "../../class/ImageProcessor.class.js";
import { SelectImageFilesPrompt } from "../Image/components/SelectImageFiles.prompt.js";
import { SetGifOptionsPrompt } from "../Image/components/SetGifOptions.prompt.js";
import { SetWatermarkOptionsPrompt } from "../Image/components/SetWatermark.prompt.js";
import { IMAGE_FORMATS } from "../options.js";

/** Sentinel choice injected by `SelectImageFilesPrompt` to toggle all files. */
const SELECT_ALL = 'TRIGGER_SELECT_ALL';

/**
 * Stitches selected images into one animated GIF.
 *
 * Chain: search images → select frames (order follows the file list) → set delay,
 * loop and output name → `AioImageProcessor.gif()` writes the GIF into `process.cwd()`.
 *
 * @param {string} [filepath] - Directory to search. Relative paths resolve against
 * `process.cwd()`; an absolute path (as passed by menu dialogs) is used as-is.
 * @param {string} [filename=''] - Optional sub-path appended to `filepath`.
 * @returns {Promise<void>} Resolves when the GIF has been written.
 *
 * @example
 * ```bash
 *
 *    // Stitch the images in ./frames into an animated GIF:
 *    aio generator --path ./frames
 *
 * ```
 */
export async function GifStitcherPrompt(filepath?: string, filename: string = ''): Promise<void> {
  try {
    const DIR = filepath
      ? resolve(filepath, filename)
      : process.cwd();

    const converter = new AioImageProcessor();
    const folder = await converter.search(DIR, IMAGE_FORMATS, false);

    if (!folder || folder.length === 0) {
      console.log(red(`No image files found in ${DIR}`));
      return;
    }

    console.log(`Found image : ${greenBright(`${folder.length} file(s)`)} in ${DIR}`);

    const picked = await SelectImageFilesPrompt(folder);
    // drop the SELECT ALL sentinel so it never reaches the processor
    const frames = (picked ?? []).filter((file) => file !== SELECT_ALL);

    if (frames.length === 0) {
      console.log(red('No image files selected for the GIF.'));
      return;
    }

    if (frames.length < 2) {
      console.log(yellowBright('Only one frame selected — the GIF will not animate.'));
    }

    // same option dialog used by the image converter/optimizer, so the flow stays generic
    const options = await SetGifOptionsPrompt();

    // watermark applies to every frame of the GIF
    const watermarkOptions = await SetWatermarkOptionsPrompt();
    Object.assign(options, watermarkOptions);

    const outputName = await input({
      message: 'Output filename:',
      default: 'animated.gif',
    });

    const name = extname(outputName) ? outputName : `${outputName}.gif`;
    const outputPath = resolve(process.cwd(), name);

    // resolve `frames` order note: the list follows the search result (alphabetical),
    // so a numeric prefix such as 01-, 02- keeps the intended sequence.
    console.log(`Stitching ${yellowBright(`${frames.length} frame(s)`)} -> ${outputPath}`);

    await converter.gif(frames, outputPath, options);

    if (!existsSync(outputPath)) {
      console.log(red('GIF was not created.'));
      return;
    }

    console.log(greenBright(`Animated GIF saved: ${outputPath}`));
  } catch (error) {
    handlePromptError(error);
  }
}
