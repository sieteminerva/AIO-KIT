/**
 * Orchestrates the image optimization process, guiding the user through various settings and options.
 * It handles:
 * - file selection,
 * - format conversion,
 * - resizing,
 * - watermarking, and
 * - quality adjustments.
 *
 * @param {string} filepath - The path to the directory containing the images to be optimized.
 * @param {string} [filename=''] - An optional filename to further specify the target directory.
 * @returns {Promise<void>} - Resolves when the optimization process is complete.
 */
export declare function ImageOptimizerPrompt(filepath: string, filename?: string): Promise<void>;
