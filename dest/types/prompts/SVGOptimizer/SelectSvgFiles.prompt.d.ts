import { Dirent } from "node:fs";
/**
 * Prompts the user to select Svg files from a given folder.
 *
 * @param {Dirent[]} folder - Array of Dirent objects representing the files in the folder.
 * @returns {Promise<string[] | undefined>} - A promise that resolves to an array of selected file paths or undefined if an error occurs.
 * The prompt allows the user to choose from a list of available svg files.
 * If the folder is empty, logs a message and returns an empty array.
 * Uses a checkbox prompt to display file choices and validates them using `svgFilesValidation`.
 * Handles any errors by invoking `handlePromptError`.
 * @example
 * ```typescript
 * await SelectSvgFilesPrompt([{ name: 'image1.jpg', path: '/path/to/image1.jpg' }]);
 * ```
 */
export declare function SelectSvgFilesPrompt(folder: Dirent[]): Promise<string[] | undefined>;
