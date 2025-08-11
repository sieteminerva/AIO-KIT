/**
 * Presents a selection prompt to the user for choosing a file conversion task.
 *
 * This function displays a list of available file conversion options, including
 * converting between JSON, CSV, and YAML formats. It also provides options to
 * navigate back to the main menu or quit the application.
 *
 * @param DIR - The current directory path.
 * @param filename - The current filename (not directly used in this function, but passed for consistency).
 * @param options - The converter options.
 *
 * @example
 * ```typescript
 * await SelectFileConverterPrompt('/path/to/directory', 'example.txt');
 * await SelectFileConverterPrompt('/path/to/directory', 'example.txt', true);
 * ```
 */
export declare function SelectFileConverterPrompt(DIR: string, filename?: string, options?: any): Promise<string | undefined>;
