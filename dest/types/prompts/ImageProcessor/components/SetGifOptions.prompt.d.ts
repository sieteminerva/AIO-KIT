import { ImageOptions } from "../../../class/ImageProcessor.class";
/**
 * Prompts the user to set various options for GIF image processing.
 * It allows the user to configure settings, like:
 * - palette reuse,
 * - progressive rendering,
 * - color count,
 * - effort level,
 * - dithering,
 * - inter-frame/palette error,
 * - loop count, and
 * - frame delay.
 *
 * @returns {Promise<ImageOptions>} A promise that resolves to an object containing the selected GIF options.
 * @example
 * ```typescript
 * const gifOptions = await SetGifOptionsPrompt();
 * console.log(gifOptions);
 * // will returns:
 *     {
 *       reuse: true,
 *       progressive: true,
 *       colors: 256,
 *       effort: 4,
 *       dither: 0,
 *       interFrameMaxError: 0,
 *       interPaletteMaxError: 0,
 *       loop: 0,
 *       delay: 0
 *     }
 * ```
 */
export declare function SetGifOptionsPrompt(): Promise<ImageOptions>;
