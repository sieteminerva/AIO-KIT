import { select, Separator, confirm, input } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
/**
 * Prompts the user to set various options for SVG optimization using SVGO presets.
 *
 * This function presents a series of interactive prompts to the user, allowing them to configure
 * different aspects of SVG optimization. It supports options like:
 * - Preset selection (default, svgo-preset-lite, svgo-preset-default, css-icon)
 * - Configuration of individual SVGO plugins (TODO)
 *
 * The user can choose to skip options or add more until they are satisfied with their configuration.
 *
 * @returns {Promise<any>} A promise that resolves with an object containing the selected SVG options.
 * @throws {Error} Throws an error if the user does not select an option or if an invalid input is provided.
 * @example
 * ```typescript
 * const SvgOptions = await SetSvgPresetsPrompt();
 * console.log(SvgOptions);
 * // will returns:
 *     {
 *       preset: 'default',
 *       // ... other svgo options
 *     }
 * ```
 */
export async function SetSvgPresetsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const choice = await select({
            message: 'Select an option to configure for SVG (SVGO)',
            choices: [
                { name: 'preset', value: 'preset' },
                { name: 'cleanupIDs', value: 'cleanupIDs' },
                { name: 'removeComments', value: 'removeComments' },
                { name: 'convertShapeToPath', value: 'convertShapeToPath' },
                { name: 'mergePaths', value: 'mergePaths' },
                { name: 'cssStyle', value: 'cssStyle' },
                // TODO: Add option to configure individual plugins
                { name: 'removeRasterImages', value: 'removeRasterImages' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        if (choice === null || choice === undefined) {
            throw new Error('No option selected');
        }
        switch (choice) {
            case 'preset':
                options.preset = await select({
                    message: 'Select SVGO preset:',
                    choices: [
                        { name: 'default', value: 'default' },
                        { name: 'svgo-preset-lite', value: 'svgo-preset-lite' },
                        { name: 'svgo-preset-default', value: 'svgo-preset-default' },
                        { name: 'css-icon', value: 'css-icon' },
                    ],
                    default: 'default'
                });
                break;
            case 'cleanupIDs':
                options.cleanupIDs = await confirm({ message: 'Cleanup IDs?', default: true });
                break;
            case 'removeComments':
                options.removeComments = await confirm({ message: 'Remove Comments?', default: true });
                break;
            case 'convertShapeToPath':
                options.convertShapeToPath = await confirm({ message: 'Convert shapes to Path?', default: true });
                break;
            case 'mergePaths':
                options.mergePaths = await confirm({ message: 'Enable mergePaths?', default: true });
                break;
            case 'cssStyle':
                options.cssStyle = await input({
                    message: 'CSS style declarations for generated icon rule:',
                    default: 'display: inline-block; color: currentColor;'
                });
                break;
            case 'removeRasterImages':
                options.removeRasterImages = await confirm({ message: 'Remove raster images?', default: false });
                break;
            // TODO: Implement plugin configuration
            // case 'plugins':
            //   options.plugins = await checkbox({message: 'Select plugins to use:',
            //   choices: []})
            //   break;
            // TODO: Implement plugin configuration
            // case 'plugins':
            //   // Implement a multi-select or other interface to enable/disable/configure SVGO plugins
            //   break;
            case 'skip':
                addMore = false;
                break;
            default:
                throw new Error(`Unknown option: ${choice}`);
        }
        if (choice !== 'skip') {
            addMore = await confirm({ message: 'Do you want to add more options?', default: false });
        }
    }
    return options;
}
