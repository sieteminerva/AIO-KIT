import { select, Separator, number, input, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
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
export async function SetGifOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for GIF',
            choices: [
                { name: 'reuse', value: 'reuse' },
                { name: 'progressive', value: 'progressive' },
                { name: 'colors', value: 'colors' },
                { name: 'effort', value: 'effort' },
                { name: 'dither', value: 'dither' },
                { name: 'interFrameMaxError', value: 'interFrameMaxError' },
                { name: 'interPaletteMaxError', value: 'interPaletteMaxError' },
                { name: 'loop', value: 'loop' },
                { name: 'delay', value: 'delay' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            /**
             * Option to reuse the existing palette.
             */
            case 'reuse':
                options.reuse = await confirm({ message: 'Re-use existing palette?', default: false });
                break;
            /**
             * Option to use progressive (interlace) scan.
             */
            case 'progressive':
                options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
                break;
            /**
             * Option to set the maximum number of palette entries.
             */
            case 'colors':
                options.colors = await number({ message: 'Maximum number of palette entries (2-256):', default: 256 });
                break;
            /**
             * Option to set the level of CPU effort to reduce file size.
             */
            case 'effort':
                options.effort = await number({ message: 'Level of CPU effort to reduce file size (1-10):', default: 7 });
                break;
            /**
             * Option to set the level of Floyd-Steinberg error diffusion.
             */
            case 'dither':
                options.dither = await number({ message: 'Level of Floyd-Steinberg error diffusion (0-1):', default: 1.0 });
                break;
            /**
             * Option to set the maximum inter-frame error for transparency.
             */
            case 'interFrameMaxError':
                options.interFrameMaxError = await number({ message: 'Maximum inter-frame error for transparency (0-32):', default: 0 });
                break;
            /**
             * Option to set the maximum inter-palette error for palette reuse.
             */
            case 'interPaletteMaxError':
                options.interPaletteMaxError = await number({ message: 'Maximum inter-palette error for palette reuse (0-256):', default: 3 });
                break;
            /**
             * Option to set the number of animation iterations.
             */
            case 'loop':
                options.loop = await number({ message: 'Number of animation iterations (0 for infinite):', default: 0 });
                break;
            /**
             * Option to set the delay between animation frames.
             * The user can input multiple delays separated by commas.
             */
            case 'delay':
                options.delay = await input({ message: 'Delay(s) between animation frames (in milliseconds, comma-separated):', default: '' }).then(input => input.split(',').map(Number));
                break;
            /**
             * Option to skip adding more options.
             * This will exit the loop and return the current options.
             */
            case 'skip':
                addMore = false;
                break;
        }
        /**
         * If the user didn't choose to skip, ask if they want to add more options.
         */
        if (option !== 'skip') {
            addMore = await confirm({ message: 'Do you want to add more options?', default: false });
        }
    }
    return options;
}
