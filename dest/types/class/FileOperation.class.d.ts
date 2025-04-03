import { FileHandle } from "node:fs/promises";
import { Dirent } from "node:fs";
export declare class AioFileOperation {
    protected _root: string;
    filepath: string | undefined;
    outputPath: string;
    ext: string;
    filename: string;
    private _content;
    constructor(filePath?: string);
    get content(): string | any;
    set content(value: string | any);
    /**
     * Returns the `filename` without the extension from a given filepath.
     * @param {string} filepath The filepath to extract the filename from.
     * @returns {string} The filename without the extension.
     * @example
     * ```typescript
     *
     *    _getFilename('/path/to/my/file.txt') // returns 'file'
     *
     * ```
     */
    protected _getFilename(filepath: string): string;
    /**
     * Extracts the file extension from a given filepath and returns it in lowercase.
     *
     * @param {string} filepath - The path of the file.
     * @returns {string} The file extension in lowercase.
     * @example
     * ```typescript
     *
     *    _getExtension('/path/to/my/file.txt') // returns '.txt'
     *
     * ```
     */
    protected _getExtension(filepath: string): string;
    /**
     * Checks if a directory exists. If it doesn't, it creates the directory and any necessary parent directories.
     *
     * @param {string} dir - The path of the directory to check or create.
     * @returns {Promise<void>} - A promise that resolves when the directory exists or has been created.
     * @throws {Error} - Throws an error if there's a problem creating the directory.
     * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    await fileOp.isDirectoryExists('/path/to/new/directory');
     *    // If '/path/to/new/directory' doesn't exist, it will be created.
     *
     * ```
     *
     */
    protected isDirectoryExists(dir: string): Promise<void>;
    /**
     * Opens a file at the specified path and returns a file handle.
     *
     * @param {string} filePath - The path of the file to open.
     * @returns {Promise<FileHandle>} - A promise that resolves to a FileHandle object for the opened file.
     * @throws {Error} - Throws an error if the file cannot be opened.
     * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    const fileHandle = await fileOp.open('/path/to/file.txt');
     *
     * ```
     */
    open(filePath: string): Promise<FileHandle>;
    /**
     * Searches for files within a specified directory, optionally filtering by file extension.
     *
     * This method recursively scans a directory and its subdirectories for files. It can filter
     * the results based on a specified file extension or an array of extensions. If no extension
     * is provided, it returns all files. It also has an option to include directories in the results.
     *
     * @param {string} directory - The path to the directory to search.
     * @param {string | string[] | undefined} ext - A single file extension or an array of file extensions to filter by.
     *                                              If undefined, no extension filtering is applied.
     * @param {boolean} [showDir=false] - If true, directories will be included in the results.
     *                                    Defaults to false.
     * @returns {Promise<Dirent[]>} - A promise that resolves to an array of Dirent objects representing the found files.
     * @throws {Error} - Throws an error if there is a problem accessing the directory, except for 'ENOENT' errors.
     * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    // Search for all .txt files in the 'mydir' directory
     *    const txtFiles = await fileOp.search('mydir', '.txt');
     *    // Search for all .txt and .md files in the 'mydir' directory
     *    const txtAndMdFiles = await fileOp.search('mydir', ['.txt', '.md']);
     *    // Search for all files and directories in the 'mydir' directory
     *    const allFilesAndDirs = await fileOp.search('mydir', undefined, true);
     *
     * ```
     */
    search(directory: string, ext: string | string[] | undefined, showDir?: boolean): Promise<Dirent[] | undefined>;
    /**
     * Reads a file line by line and returns an array of strings, where each string is a line from the file.
     *
     * This method opens a file, reads it line by line, and stores each line as a separate string in an array.
     * It uses an asynchronous iterator to efficiently handle large files without loading the entire content into memory at once.
     *
     * @param {string} filePath - The path to the file to be scanned.
     * @returns {Promise<string[]>} - A promise that resolves to an array of strings, where each string is a line from the file.
     * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    const lines = await fileOp.scan('/path/to/large/file.txt');
     *    console.log(lines); // Output: ['Line 1', 'Line 2', 'Line 3', ...]
     *
     * ```
     */
    scan(filePath: string): Promise<string[]>;
    /**
     * Reads a file synchronously and returns its content as a string.
     *
     * @param {string} path - The path to the file to be read.
     * @returns {Promise<string>} - A promise that resolves to the content of the file as a string.
     *    * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    const lines = await fileOp.read('/path/to/large/file.txt');
     *    console.log(lines); // Output: ['Line 1', 'Line 2', 'Line 3', ...]
     *
     * ```
     */
    read(path: string): Promise<string>;
    /**
     * Writes an array of strings to a file, overwriting any existing content.
     * @param {string} outputFilePath - The path to the file to be written.
     * @param {string[]} content - The array of strings to be written to the file.
     *    * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    const dataText = ['Line 1', 'Line 2', 'Line 3', ...]
     *    const lines = await fileOp.write('/path/to/large/file.txt', dataText);
     *
     * ```
     */
    write(outputFilePath: string, content: string[]): Promise<void>;
    /**
     * Removes a file if it exists.
     * @param {string} filePath - The path to the file to be removed.
     * @returns {Promise<void>} - A promise that resolves when the file has been removed.
     *    * @example
     * ```typescript
     *
     *    const fileOp = new AioFileOperation();
     *    await fileOp.remove('/path/to/large/file.txt');
     *
     * ```
     */
    remove(filePath: string): Promise<void>;
}
