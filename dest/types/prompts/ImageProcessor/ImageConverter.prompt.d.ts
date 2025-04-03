/**
 * Orchestrates the image conversion process, guiding the user through:
 * - `selecting files`,
 * - choosing `output format`,
 * - setting `advanced options`, and
 * - specifying `output names`.
 *
 * @param {string} filepath - The path to the directory containing the images.
 *                             If empty, defaults to the current working directory.
 * @param {string} filename - The name of the file or directory within the filepath.
 *                            If filepath is empty, this parameter is ignored.
 * @returns {Promise<void>} - Resolves when the conversion process is complete.
 */
export declare function ImageConverterPrompt(filepath: string, filename: string): Promise<void>;
