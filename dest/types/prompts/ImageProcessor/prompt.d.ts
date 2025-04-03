/**
 * Displays a dialog to select an `image processing` task.
 *
 * This function presents a menu to the user, allowing them to choose between
 * optimizing an image, converting an image, returning to the utility menu, or quitting.
 * @param filename - The name of the file being processed.
 * @param DIR - The directory where the file is located.
 */
export declare function SelectImageTaskDialog(filename: string, DIR: string): Promise<void>;
