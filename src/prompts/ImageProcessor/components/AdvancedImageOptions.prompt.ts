import { number, Separator, expand } from "@inquirer/prompts";
import sharp from "sharp";
import { cyanBright, gray, greenBright, italic, yellowBright } from "yoctocolors";
import { ImageOptions } from "../../../class/ImageProcessor.class.js";
import { SetWatermarkOptionsPrompt } from "./SetWatermark.prompt.js";
import { SetResizeOptionsPrompt } from "./SetResizeOptions.prompt.js";
import { SetJpegOptionsPrompt } from "./SetJpegOptions.prompt.js";
import { SetPngOptionsPrompt } from "./SetPngOptions.prompt.js";
import { SetGifOptionsPrompt } from "./SetGifOptions.prompt.js";
import { SetWebpOptionsPrompt } from "./SetWebpOptions.prompt.js";

// Mapping of image formats to their corresponding sharp options interfaces
const imageFormatOptionsMap: { [key: string]: keyof sharp.Sharp } = {
  'jpg': 'jpeg',
  'jpeg': 'jpeg',
  'png': 'png',
  'webp': 'webp',
  'gif': 'gif',
  'tiff': 'tiff',
};

enum MainOption {
  Proceed = "proceed",
  Resize = "resize",
  Watermark = "watermark",
  Advanced = "advanced",
  Quit = "quit",
  Expand = "expand",
}


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
export async function SetAdvancedImageOptionsPrompt(imageFormat: string): Promise<ImageOptions> {
  let options: ImageOptions = {};
  const sharpFormat = imageFormatOptionsMap[imageFormat];

  if (!sharpFormat) {
    console.warn(`Unsupported image format: ${imageFormat}`);
    return options as ImageOptions;
  }

  let expanded = false;
  let expandItem = { key: 'E', name: greenBright('Expand'), value: 'expand' }
  let mainOption = '';
  const msgMenu = `Configure image options: (${yellowBright(`${italic('Press Key')}`)}).\n\n ${yellowBright(`[O]`)} ${italic('Advanced Options')} ${yellowBright(`[W]`)} ${italic('Watermark')} ${yellowBright(`[R]`)} ${italic('Resize')}\n ${yellowBright(`[E]`)} ${italic('Expand Menu')} ${yellowBright(`[Q]`)} ${italic('Quit')} ${yellowBright(`[P]`)} ${italic('Proceed')} ${gray(`Task >>`)}`;
  do {
    mainOption = await expand({
      message: msgMenu,
      default: 'r',
      expanded,
      choices: [
        new Separator(cyanBright(`---------------------------`)),
        { key: 'P', name: yellowBright('Proceed the Conversion'), value: 'proceed' },
        { key: 'R', name: yellowBright('Resize'), value: 'resize' },
        { key: 'W', name: yellowBright('Watermark'), value: 'watermark' },
        { key: 'O', name: yellowBright('Advanced Options'), value: 'advanced' },
        { key: 'Q', name: cyanBright('Quit'), value: 'quit' },
        new Separator(cyanBright(`---------------------------`)),
        expandItem as any,
      ],
    }) as MainOption;

    switch (mainOption) {
      case MainOption.Expand:
        /** Expand and Collapse the menu **/
        expanded = !expanded;
        if (expanded) {
          expandItem = { key: 'E', name: cyanBright('Collapse'), value: 'expand' }
        } else {
          expandItem = { key: 'E', name: cyanBright('Expand'), value: 'expand' }
        }
        break;
      case MainOption.Resize:
        const resizeOptions = await SetResizeOptionsPrompt() as Partial<ImageOptions>;
        Object.assign(options, resizeOptions)
        break;
      case MainOption.Watermark:
        const watermarkOptions = await SetWatermarkOptionsPrompt() as Partial<ImageOptions>;
        Object.assign(options, watermarkOptions)
        break;
      case MainOption.Advanced:

        if (sharpFormat === 'jpeg') {
          const jpegOptions = await SetJpegOptionsPrompt() as Partial<ImageOptions>;
          Object.assign(options, jpegOptions)
        }
        if (sharpFormat === 'png') {
          const pngOptions = await SetPngOptionsPrompt() as Partial<ImageOptions>;
          Object.assign(options, pngOptions)
        }
        if (sharpFormat === 'webp') {
          const webpOptions = await SetWebpOptionsPrompt() as Partial<ImageOptions>;
          Object.assign(options, webpOptions)
        }
        if (sharpFormat === 'gif') {
          const gifOptions = await SetGifOptionsPrompt() as Partial<ImageOptions>;
          Object.assign(options, gifOptions)
        }
        // Add quality option for every image format
        options.quality = await number({ message: 'Image quality (1-100):', default: 80 });
        break;
      case MainOption.Proceed:
        break;
      case MainOption.Quit:
        process.exit(0);
      default:
        break;
    }
    if (mainOption === MainOption.Proceed) {
      break; // Exit the main loop if the user chooses to skip
    }

  } while (mainOption !== 'P' && mainOption !== 'Q');

  return options as ImageOptions;
}
