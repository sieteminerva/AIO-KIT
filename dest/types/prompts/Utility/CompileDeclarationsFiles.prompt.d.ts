/**
 * Prompts the user for input to create index files within a specified directory.
 * It gathers information such as the source directory and the desired file name for the index files.
 * It then utilizes the `CompileDeclarationsFiles` class to generate the index files.
 *
 * @param {string} folderPath - The base folder path where the operation will take place. (Currently not used in the function's logic)
 * @param {string} outputName - The desired output name for the generated files. (Currently not used in the function's logic)
 *
 * @example
 * ```typescript
 *
 *    // Example usage:
 *    await CompileDeclarationsFilesPrompt('/path/to/my/project', 'my-output');
 *    // This will prompt the user for the source directory and file name, then generate index files.
 *
 * ```
 */
export declare function CompileDeclarationsFilesPrompt(folderPath: string, outputName: string): Promise<void>;
