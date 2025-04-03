import { select, Separator, number, input, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
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
export async function SetWebpOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for WebP',
            choices: [
                { name: 'alphaQuality', value: 'alphaQuality' },
                { name: 'lossless', value: 'lossless' },
                { name: 'nearLossless', value: 'nearLossless' },
                { name: 'smartSubsample', value: 'smartSubsample' },
                { name: 'effort', value: 'effort' },
                { name: 'minSize', value: 'minSize' },
                { name: 'mixed', value: 'mixed' },
                { name: 'preset', value: 'preset' },
                { name: 'loop', value: 'loop' },
                { name: 'delay', value: 'delay' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            case 'alphaQuality':
                /**
                 * Sets the quality of the alpha (transparency) layer.
                 *
                 * @type {number}
                 * @range 0-100
                 * @default 100
                 */
                options.alphaQuality = await number({ message: 'Quality of alpha layer (0-100):', default: 100 });
                break;
            case 'lossless':
                /**
                 * Enables or disables lossless compression mode.
                 *
                 * @type {boolean}
                 * @default false
                 */
                options.lossless = await confirm({ message: 'Use lossless compression mode?', default: false });
                break;
            case 'nearLossless':
                /**
                 * Enables or disables near-lossless compression mode.
                 *
                 * @type {boolean}
                 * @default false
                 */
                options.nearLossless = await confirm({ message: 'Use near_lossless compression mode?', default: false });
                break;
            case 'smartSubsample':
                /**
                 * Enables or disables high-quality chroma subsampling.
                 *
                 * @type {boolean}
                 * @default false
                 */
                options.smartSubsample = await confirm({ message: 'Use high quality chroma subsampling?', default: false });
                break;
            case 'effort':
                /**
                 * Sets the level of CPU effort to reduce file size.
                 *
                 * @type {number}
                 * @range 0-6
                 * @default 4
                 */
                options.effort = await number({ message: 'Level of CPU effort to reduce file size (0-6):', default: 4 });
                break;
            case 'minSize':
                /**
                 * Prevents the use of animation keyframes to minimize file size.
                 *
                 * @type {boolean}
                 * @default false
                 */
                options.minSize = await confirm({ message: 'Prevent use of animation key frames to minimise file size (slow)?', default: false });
                break;
            case 'mixed':
                /**
                 * Allows a mixture of lossy and lossless animation frames.
                 *
                 * @type {boolean}
                 * @default false
                 */
                options.mixed = await confirm({ message: 'Allow mixture of lossy and lossless animation frames (slow)?', default: false });
                break;
            case 'preset':
                /**
                 * Selects a preset for image processing.
                 *
                 * @type {string}
                 * @values 'default', 'photo', 'picture', 'drawing', 'icon', 'text'
                 * @default 'default'
                 */
                options.preset = await select({
                    message: 'Preset options:',
                    choices: [
                        { name: 'default', value: 'default', description: 'Default preset' },
                        { name: 'photo', value: 'photo', description: 'Photo preset' },
                        { name: 'picture', value: 'picture', description: 'Picture preset' },
                        { name: 'drawing', value: 'drawing', description: 'Drawing preset' },
                        { name: 'icon', value: 'icon', description: 'Icon preset' },
                        { name: 'text', value: 'text', description: 'Text preset' },
                    ],
                    default: 'default'
                });
                break;
            case 'loop':
                /**
                 * Sets the number of animation iterations.
                 *
                 * @type {number}
                 * @default 0 (infinite)
                 */
                options.loop = await number({ message: 'Number of animation iterations (0 for infinite):', default: 0 });
                break;
            case 'delay':
                /**
                 * Sets the delay between animation frames in milliseconds.
                 *
                 * @type {number[]}
                 * @example "100,200,300"
                 */
                options.delay = await input({ message: 'Delay(s) between animation frames (in milliseconds, comma-separated):', default: '' }).then(input => input.split(',').map(Number));
                break;
            case 'skip':
                addMore = false;
                break;
        }
        if (option !== 'skip') {
            addMore = await confirm({ message: 'Do you want to add more options?', default: false });
        }
    }
    return options;
}
