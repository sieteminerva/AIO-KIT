/**
 * Prompts the user to decide whether to add a watermark to an image and, if so,
 * where to position it.
 *
 * @returns {Promise<{ watermark: boolean; watermarkPosition: keyof typeof gravity }>}
 *   An object containing:
 *     - `watermark`: A boolean indicating whether the user wants to add a watermark.
 *     - `watermarkPosition`: A string representing the desired position of the watermark
 *       (e.g., 'center', 'northwest', 'southeast'). This value corresponds to the keys
 *       of the `gravity` object from the `sharp` library. If `watermark` is false,
 *       this defaults to 'center'.
 *  * @example
 * ```typescript
 * const WatermarkOptions = await SetWatermarkOptionsPrompt();
 * console.log(WatermarkOptions);
 * // will returns:
 *     {
 *       watermark: true,
 *       watermarkPosition: 'center' || 'northwest' || 'southeast' as keyof typeof gravity,
 *     }
 * ```
 */
export declare function SetWatermarkOptionsPrompt(): Promise<{
    watermark: boolean;
    watermarkPosition: keyof import("sharp").GravityEnum;
}>;
