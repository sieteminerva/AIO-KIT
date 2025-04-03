import { ImageOptions } from "../../../class/ImageProcessor.class";
/**
 * Prompts the user to configure various options for PNG image processing.
 * It allows the user to set optionsn, like:
 * - progressive scan,
 * - compression level,
 * - adaptive filtering,
 * - effort,
 * - palette usage,
 * - number of colors, and
 * - dithering.
 *
 * The user can choose to skip adding more options at any time.
 *
 * @returns {Promise<ImageOptions>} A promise that resolves to an object containing the selected PNG options.
 * @example
 * ```typescript
 * const PngOptions = await SetPngOptionsPrompt();
 * console.log(PngOptions);
 * // will returns:
 *     {
 *       progressive: true,
 *       compressionLevel: 6,
 *       adaptiveFiltering: true,
 *       effort: true,
 *       palette: true,
 *       colors: 256,
 *       dither: true
 *     }
 * ```
 */
export declare function SetPngOptionsPrompt(): Promise<ImageOptions>;
