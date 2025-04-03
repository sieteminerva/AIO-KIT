import { ImageOptions } from "../../../class/ImageProcessor.class.js";
/**
 * Displays a prompt to configure advanced image options based on the given image format.
 *
 * @param imageFormat - The format of the image (e.g., 'jpg', 'png', 'gif').
 * @returns A promise that resolves to an object containing the configured image options.
 *
 * The function provides a menu-driven interface allowing users to select and configure
 * image processing options such as resizing, adding watermarks, and advanced options
 * specific to the image format. The user can expand or collapse the menu for more options,
 * proceed with the conversion, or quit the prompt. The function also warns if the given
 * image format is unsupported.
 *  * @example
 * ```typescript
 * await SetAdvancedImageOptionsPrompt('jpg');
 * ```
 */
export declare function SetAdvancedImageOptionsPrompt(imageFormat: string): Promise<ImageOptions>;
