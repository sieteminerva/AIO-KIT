import { number, confirm } from "@inquirer/prompts";
import { ImageOptions } from "../../../class/ImageProcessor.class";


/**
 * Prompts the user to set image resize options.
 *
 * This function interacts with the user through the command line to determine
 * whether they want to resize an image and, if so, what the new dimensions
 * should be and whether to crop it to a square.
 *
 * @returns {Promise<ImageOptions>} A promise that resolves to an `ImageOptions` object
 *   containing the user's choices for image resizing.
 *   - `resize`: A boolean indicating whether to resize the image.
 *   - `maxWidth`: The maximum width for the resized image (only if `resize` is true).
 *   - `squared`: A boolean indicating whether to crop the image to a square (only if `resize` is true).
 *  * @example 
 * ```typescript
 * const ResizeOptions = await SetResizeOptionsPrompt();
 * console.log(ResizeOptions);
 * // will returns: 
 *     { 
 *       resize: true,
 *       maxWidth: 6,
 *       squared: true,
 *     }
 * ```
 */
export async function SetResizeOptionsPrompt(): Promise<ImageOptions> {
  const options: ImageOptions = {};
  options.resize = await confirm({ message: 'Do you want to resize the image?', default: false });
  if (options.resize) {
    options.maxWidth = await number({ message: 'Set new `Image Width` for optimizing the output', default: 1000 });
    options.squared = await confirm({ message: 'Would you like to crop the image? (1:1 ratio)', default: false });
  }
  return options;
}
