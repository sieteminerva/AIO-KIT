import { select, Separator, number, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
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
export async function SetPngOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for PNG',
            choices: [
                { name: 'progressive', value: 'progressive' },
                { name: 'compressionLevel', value: 'compressionLevel' },
                { name: 'adaptiveFiltering', value: 'adaptiveFiltering' },
                { name: 'effort', value: 'effort' },
                { name: 'palette', value: 'palette' },
                { name: 'colors', value: 'colors' },
                { name: 'dither', value: 'dither' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            /**
             * Enables or disables progressive (interlace) scan for the PNG image.
             */
            case 'progressive':
                options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
                break;
            /**
             * Sets the zlib compression level for the PNG image.
             * The compression level ranges from 0 (no compression) to 9 (maximum compression).
             */
            case 'compressionLevel':
                options.compressionLevel = await number({ message: 'zlib compression level (0-9):', default: 6 });
                break;
            /**
             * Enables or disables adaptive row filtering for the PNG image.
             */
            case 'adaptiveFiltering':
                options.adaptiveFiltering = await confirm({ message: 'Use adaptive row filtering?', default: false });
                break;
            /**
             * Sets the level of CPU effort to reduce the file size of the PNG image.
             * The effort level ranges from 1 (lowest effort) to 10 (highest effort).
             */
            case 'effort':
                options.effort = await number({ message: 'Level of CPU effort to reduce file size (1-10):', default: 7 });
                break;
            /**
             * Enables or disables palette-based image with alpha transparency support.
             */
            case 'palette':
                options.palette = await confirm({ message: 'Quantise to a palette-based image with alpha transparency support?', default: false });
                break;
            /**
             * Sets the maximum number of palette entries for the PNG image.
             */
            case 'colors':
                options.colors = await number({ message: 'Maximum number of palette entries:', default: 256 });
                break;
            /**
             * Sets the level of Floyd-Steinberg error diffusion (dithering) for the PNG image.
             * The dither level ranges from 0 (no dithering) to 1 (maximum dithering).
             */
            case 'dither':
                options.dither = await number({ message: 'Level of Floyd-Steinberg error diffusion (0-1):', default: 1.0 });
                break;
            /**
             * Skips adding more options and exits the configuration loop.
             */
            case 'skip':
                addMore = false;
                break;
        }
        /**
         * Asks the user if they want to add more options, unless they chose to skip.
         */
        if (option !== 'skip') {
            addMore = await confirm({ message: 'Do you want to add more options?', default: false });
        }
    }
    return options;
}
