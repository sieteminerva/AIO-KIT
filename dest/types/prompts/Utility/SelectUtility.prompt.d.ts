/**
 * Displays a prompt to select an AIO utility task and executes the corresponding action.
 *
 * This function presents a list of available utility tasks to the user, allowing them to choose
 * one. Based on the selection, it invokes the appropriate function to handle the task.
 * After the task is completed or if an error occurs, it recursively calls itself to display the
 * utility selection prompt again.
 *
 * @param DIR - The directory path where the utility task should operate.
 * @param filename - An optional filename that might be required by some utility tasks.
 *
 * @example
 * // Example usage: SelectUtilityPrompt('/path/to/directory', 'example.txt');
 */
export declare function SelectUtilityPrompt(DIR: string, filename?: string): Promise<void>;
