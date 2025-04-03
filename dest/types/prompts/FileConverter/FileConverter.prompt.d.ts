/**
 * Prompts the user to select files for conversion and then converts them to the specified format.
 *
 * This function first searches for files in the current working directory that match the `toExt` extension.
 * It then presents the user with a checkbox prompt to select which files they want to convert.
 * After the user makes their selection, the function iterates through the selected files,
 * reads their content based on the `fromExt` extension, converts the content to the `toExt` format,
 * and writes the converted content to a new file with the updated extension.
 *
 * @param fromExt - The original file extension (e.g., '.yaml', '.csv', '.json').
 * @param toExt - The target file extension to convert to (e.g., '.csv', '.yaml', '.json').
 *
 * @example FileConverterPrompt('.yaml', '.csv') // Convert all selected .yaml files to .csv
 */
export declare function FileConverterPrompt(fromExt: string, toExt: string): Promise<void>;
