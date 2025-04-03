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
export declare function SetResizeOptionsPrompt(): Promise<ImageOptions>;
