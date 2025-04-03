import { ImageOptions } from "../../../class/ImageProcessor.class";
/**
 * Prompts the user to set various JPEG image processing options.
 *
 * This function presents a series of interactive prompts to the user, allowing them to configure
 * different aspects of JPEG image optimization and encoding. It supports options, like:
 * - progressive,
 * - chromaSubsampling,
 * - trellisQuantization,
 * - overshootDeringing,
 * - optimizeScans,
 * - optimizeCoding,
 * - quantizationTable,
 * - mozjpeg
 *
 * The user can choose to skip options or add more until they are satisfied with their configuration.
 *
 * @returns {Promise<ImageOptions>} A promise that resolves with an object containing the selected JPEG options.
 * @throws {Error} Throws an error if the user does not select an option or if an invalid input is provided.
 *  * @example
 * ```typescript
 * const JpegOptions = await SetJpegOptionsPrompt();
 * console.log(JpegOptions);
 * // will returns:
 *     {
 *       progressive: ,
 *         chromaSubsampling: '4:2:0',
 *         trellisQuantization: false,
 *         overshootDeringing: false,
 *         optimizeScans: false,
 *         optimizeCoding: false,
 *         quantizationTable: 0 ,
 *         mozjpeg: true,
 *     }
 * ```
 */
export declare function SetJpegOptionsPrompt(): Promise<ImageOptions>;
