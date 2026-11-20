import { FileHandle } from "node:fs/promises";
import { Dirent } from "node:fs";
interface ListRecursiveOptions {
    includes?: string[];
    excludes?: string[];
    _result?: string[];
}
/**
 * Immutable, chainable path builder.
 * @example
 * ```typescript
 *
 *    AioFileOperation.path('src', 'class').join('FileOperation.class.ts').resolve()
 *
 * ```
 */
export declare class FileSystemPath {
    private value;
    private _cachedNormalized;
    constructor(...value: string[]);
    get normalized(): string;
    join(...args: string[]): FileSystemPath;
    resolve(): string;
    relativeTo(root: string): string;
    escape(): string;
    toString(): string;
    valueOf(): string;
}
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
    cleanDir(dir: string): Promise<void>;
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
    search(directory: string, ext?: string | string[] | undefined, showDir?: boolean): Promise<Dirent[] | undefined>;
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
    write(outputFilePath: string, content: string[] | string): Promise<void>;
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
    /**
     * Builds an absolute path from a module `import.meta.url` plus sub-paths.
     * @example
     * ```typescript
     *
     *    AioFileOperation.fromMeta(import.meta.url, 'templates') // '/abs/dir/templates'
     *
     * ```
     */
    static fromMeta(metaUrl: string, ...paths: string[]): string;
    /** Joins path segments and normalizes separators to forward slashes. */
    static normalize(...path: string[]): string;
    /** Resolves `to` relative to `from` and normalizes separators. */
    static relative(from: string, to: string): string;
    /** Resolves path segments to an absolute path with forward slashes. */
    static resolve(...paths: string[]): string;
    /** Escapes a string for safe use inside a RegExp. */
    static regexEscape(str: string): string;
    /** Normalized alias of `path.join`. */
    static join(...args: string[]): string;
    /** Starts a chainable {@link FileSystemPath}. */
    static path(...str: string[]): FileSystemPath;
    static readJson<T>(path: string | FileSystemPath): T;
    static writeJson(path: string | FileSystemPath, value: unknown): void;
    static exists(path: string | FileSystemPath): boolean;
    static ensureDirectory(path: string | FileSystemPath): void;
    static remove(path: string | FileSystemPath): void;
    static removeRecursive(path: string | FileSystemPath): void;
    static read(path: string | FileSystemPath): string;
    static write(path: string | FileSystemPath, content: string): void;
    static copy(src: string | FileSystemPath, dest: string | FileSystemPath): void;
    static move(src: string | FileSystemPath, dest: string | FileSystemPath): void;
    static list(dir: string | FileSystemPath): string[];
    /** Recursively lists files, reusing one output array to save RAM. */
    static listRecursive(dir: string | FileSystemPath, filter?: (path: string) => boolean, result?: string[]): string[];
    /** Recursively lists files with `includes` / `excludes` pattern matching. */
    static listRecursiveX(dir: string, filter?: (path: string) => boolean, options?: ListRecursiveOptions): string[];
    /** Streams files recursively without buffering the whole tree in memory. */
    static listRecursiveAsync(dir: string, filter?: (path: string) => boolean): AsyncGenerator<string>;
    /** Removes a path (file or directory) recursively. */
    static clean(...path: string[]): void;
}
export {};
