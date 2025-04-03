/**
 * Displays the main dialog prompt to the user, allowing them to select a task to run.
 *
 * This function presents a menu of available tasks defined in `MAIN_TASKS` and executes the corresponding
 * prompt based on the user's selection. It handles errors gracefully and recursively calls itself to
 * keep the prompt active until the user chooses to quit.
 *
 * @param DIR - The directory path to be used for certain tasks. If not provided, it defaults to the current working directory.
 * @param filename - An optional filename that can be used by certain tasks.
 *
 * @example
 * ```typescript
 * // Calling the function to start the main dialog prompt
 * MainDialogPrompt('/path/to/my/directory', 'myFile.txt');
 * ```
 */
export declare function MainDialogPrompt(DIR: string, filename?: string): Promise<void>;
