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
export declare function SetSvgPresetsPrompt(): Promise<any>;
