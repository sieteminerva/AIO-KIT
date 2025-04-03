import { ImageOptions } from "../../../class/ImageProcessor.class";
/**
 * Prompts the user to configure various options for WebP image processing.
 * It allows the user to select and set options, like:
 *  - alpha quality,
 *  - lossless compression,
 *  - near-lossless compression,
 *  - smart subsampling,
 *  - effort level,
 *  - min size,
 *  - mixed mode,
 *  - preset,
 *  - loop count, and
 *  - delay between animation frames.
 *
 * @returns {Promise<ImageOptions>} A promise that resolves with an object containing the selected WebP options.
 *  * ```typescript
 * const WebpOptions = await SetWebpOptionsPrompt();
 * console.log(WebpOptions);
 * // will returns:
 *     {
 *        alphaQuality: 100,
 *        lossless: false,
 *        nearLossless: false,
 *        smartSubsample: false,
 *        effort: 4,
 *        minSize: false,
 *        mixed: false,
 *        preset: 'default',
 *        loop: 0,
 *        delay: '',
 *     }
 * ```
 */
export declare function SetWebpOptionsPrompt(): Promise<ImageOptions>;
