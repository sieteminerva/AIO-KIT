import { FileHandle, readdir, open, writeFile, rm, readFile, mkdir } from "node:fs/promises";
import {
  Dirent,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface ListRecursiveOptions {
  includes?: string[];
  excludes?: string[];
  _result?: string[]; // Internal recursion buffer to save RAM
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
export class FileSystemPath {
  private value: string[];
  private _cachedNormalized: string = '';

  constructor(...value: string[]) {
    this.value = value.map(p => String(p));
  }

  // Cached O(1) access so regex replacement stays fast inside loops
  get normalized(): string {
    if (!this._cachedNormalized) {
      this._cachedNormalized = join(...this.value).replace(/\\/g, "/");
    }
    return this._cachedNormalized;
  }

  // Chaining step: returns a new object so calls can be piped further
  join(...args: string[]): FileSystemPath {
    return new FileSystemPath(this.normalized, ...args);
  }

  // Terminal step: returns the raw string Node.js expects
  resolve(): string {
    return resolve(this.normalized).replace(/\\/g, "/");
  }

  relativeTo(root: string): string {
    return relative(root, this.normalized).replace(/\\/g, "/");
  }

  escape(): string {
    return this.normalized.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  // Safety net when the instance is used inside template literals
  toString(): string {
    return this.normalized;
  }

  valueOf(): string {
    return this.normalized;
  }
}

export class AioFileOperation {

  protected _root: string;

  filepath: string | undefined = '';

  outputPath: string = '';

  ext: string = '';

  filename: string = '';

  private _content: string | any = '';

  constructor(filePath?: string) {
    this._root = process.cwd();
  }

  get content(): string | any {
    return this._content;
  }
  set content(value: string | any) {
    this._content = value;
  }

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
  protected _getFilename(filepath: string): string {
    return basename(filepath, this._getExtension(filepath));
  }

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
  protected _getExtension(filepath: string): string {
    // basename(this._filename);
    return extname(filepath).toLocaleLowerCase();
  }

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
  protected async isDirectoryExists(dir: string): Promise<void> {
    try {
      if (existsSync(dir)) {
        return;
      }
      await mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
      throw error;
    }
  }


  public async cleanDir(dir: string): Promise<void> {
    try {
      if (existsSync(dir)) {
        rmdirSync(dir, { recursive: true });
      }
      await mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
      throw error;
    }
  }

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

  async open(filePath: string): Promise<FileHandle> {
    return await open(filePath);
  }


  /**
   * Directory names never included in {@link search} results.
   * Recursive scans of a project root would otherwise pick up images/assets
   * from `node_modules` and `.git`.
   */
  static readonly IGNORED_DIRS = ['node_modules', '.git'];

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
   * @param {string[]} [ignore] - Directory names to skip. Defaults to {@link IGNORED_DIRS}
   *                              (`node_modules`, `.git`).
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
   *    // Skip extra folders too:
   *    const noDocs = await fileOp.search('mydir', '.png', false, ['node_modules', '.git', 'docs']);
   * 
   * ```
   */
  async search(directory: string, ext?: string | string[] | undefined, showDir: boolean = false, ignore: string[] = AioFileOperation.IGNORED_DIRS): Promise<Dirent[] | undefined> {
    try {
      const files = await readdir(directory, { withFileTypes: true, recursive: true, encoding: 'utf-8' });
      const targetedFiles = files.filter((file) => {

        // Skip anything living inside an ignored directory (node_modules, .git, ...)
        const parent = relative(directory, file.parentPath ?? directory);
        if (parent.split(/[\\/]/).some((segment) => ignore.includes(segment))) {
          return false;
        }

        if (!file.isFile()) {
          return showDir; // Exclude directories
        }

        if (ext) {
          const fileExt = file.name.toLowerCase();
          if (Array.isArray(ext)) {
            return ext.some((e) => fileExt.endsWith(e.toLowerCase())) && fileExt.includes('.');
          } else {
            return fileExt.endsWith(ext.toLowerCase()) && fileExt.includes('.');
          }
        }

        return file.name.includes('.'); // Include all files if no extension is specified
      });

      if (targetedFiles.length === 0) {
        console.warn(`No ${ext || ""} files found in ${directory}`);
        return;
      }

      return targetedFiles;

    } catch (error: any) {
      if (error instanceof Error && (error as any).code === 'ENOENT') {
        console.warn(`No such file or directory: ${directory}`);
      } else {
        throw error;
      }
    }
  }


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
  async scan(filePath: string): Promise<string[]> {
    const content: string[] = [];
    const fileContent = await this.open(filePath);
    const docs = fileContent.readLines({ encoding: 'utf-8' });
    for await (const line of docs) {
      content.push(line);
    }
    return content;
  }

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
  async read(path: string): Promise<string> {
    try {
      const file = await readFile(path, { encoding: 'utf-8' });
      return file;
    } catch (error) {
      throw new Error("Error reading file");
    }
  }

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
  async write(outputFilePath: string, content: string[] | string): Promise<void> {
    await writeFile(outputFilePath, content, 'utf-8');
  }

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
  async remove(filePath: string): Promise<void> {
    if (existsSync(filePath)) {
      console.log(`[Remove existing]: '${filePath}'`);
      await rm(filePath); // remove existing index.d.ts file
    }
  }

  // ---------------------------------------------------------------------------
  // Static path helpers
  // ---------------------------------------------------------------------------

  /**
   * Builds an absolute path from a module `import.meta.url` plus sub-paths.
   * @example
   * ```typescript
   *
   *    AioFileOperation.fromMeta(import.meta.url, 'templates') // '/abs/dir/templates'
   *
   * ```
   */
  static fromMeta(metaUrl: string, ...paths: string[]): string {
    // 1. Convert a file:/// module URL into a plain OS path
    const currentDir = dirname(fileURLToPath(metaUrl));

    // 2. Join it with the requested sub-paths and normalize separators
    return join(currentDir, ...paths).replace(/\\/g, "/");
  }

  /** Joins path segments and normalizes separators to forward slashes. */
  static normalize(...path: string[]): string {
    return join(...path).replace(/\\/g, "/");
  }

  /** Resolves `to` relative to `from` and normalizes separators. */
  static relative(from: string, to: string): string {
    return this.normalize(relative(from, to));
  }

  /** Resolves path segments to an absolute path with forward slashes. */
  static resolve(...paths: string[]): string {
    return resolve(join(...paths)).replace(/\\/g, "/");
  }

  /** Escapes a string for safe use inside a RegExp. */
  static regexEscape(str: string): string {
    return str.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, "\\$&");
  }

  /** Normalized alias of `path.join`. */
  static join(...args: string[]): string {
    return this.normalize(join(...args));
  }

  /** Starts a chainable {@link FileSystemPath}. */
  static path(...str: string[]): FileSystemPath {
    return new FileSystemPath(...str);
  }

  // ---------------------------------------------------------------------------
  // Static JSON helpers
  // ---------------------------------------------------------------------------

  static readJson<T>(path: string | FileSystemPath): T {
    try {
      return JSON.parse(this.read(path));
    } catch (error) {
      console.error(`[AioFileOperation] Failed to read or parse JSON file: ${path}`);
      throw error;
    }
  }

  static writeJson(path: string | FileSystemPath, value: unknown): void {
    try {
      this.write(path, JSON.stringify(value, null, 2));
    } catch (error) {
      console.error(`[AioFileOperation] Failed to write JSON file: ${path}`);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Static sync file helpers
  // ---------------------------------------------------------------------------

  static exists(path: string | FileSystemPath): boolean {
    try {
      // String(path) extracts .normalized from a FileSystemPath instance
      return existsSync(resolve(String(path)));
    } catch (error) {
      console.error(`[AioFileOperation] Failed to check existence of path: ${path}`);
      throw error;
    }
  }

  static ensureDirectory(path: string | FileSystemPath): void {
    const pathStr = String(path);
    try {
      if (!existsSync(pathStr)) {
        mkdirSync(pathStr, { recursive: true });
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to create directory: ${pathStr}`);
      throw error;
    }
  }

  static remove(path: string | FileSystemPath): void {
    const pathStr = String(path);
    try {
      if (existsSync(pathStr)) {
        unlinkSync(pathStr);
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to remove file: ${pathStr}`);
      throw error;
    }
  }

  static removeRecursive(path: string | FileSystemPath): void {
    const pathStr = String(path);
    try {
      if (existsSync(pathStr)) {
        rmSync(pathStr, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to recursively remove path: ${pathStr}`);
      throw error;
    }
  }

  static read(path: string | FileSystemPath): string {
    const pathStr = String(path);
    try {
      return readFileSync(pathStr, "utf-8");
    } catch (error) {
      console.error(`[AioFileOperation] Failed to read file: ${pathStr}`);
      throw error;
    }
  }

  static write(path: string | FileSystemPath, content: string): void {
    const pathStr = String(path);
    try {
      writeFileSync(pathStr, content);
    } catch (error) {
      console.error(`[AioFileOperation] Failed to write file: ${pathStr}`);
      throw error;
    }
  }

  static copy(src: string | FileSystemPath, dest: string | FileSystemPath): void {
    const srcStr = String(src);
    const destStr = String(dest);
    try {
      this.ensureDirectory(dirname(destStr));
      copyFileSync(srcStr, destStr);
    } catch (error) {
      console.error(`[AioFileOperation] Failed to copy file from ${srcStr} to ${destStr}`);
      throw error;
    }
  }

  static move(src: string | FileSystemPath, dest: string | FileSystemPath): void {
    const srcStr = String(src);
    const destStr = String(dest);
    try {
      this.ensureDirectory(dirname(destStr));

      try {
        renameSync(srcStr, destStr);
      } catch {
        // Fallback for cross-device moves
        this.copy(src, dest);
        this.remove(src);
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to move file from ${srcStr} to ${destStr}`);
      throw error;
    }
  }

  static list(dir: string | FileSystemPath): string[] {
    const dirStr = String(dir);
    try {
      return readdirSync(dirStr);
    } catch (error) {
      console.error(`[AioFileOperation] Failed to list directory contents: ${dirStr}`);
      throw error;
    }
  }

  /** Recursively lists files, reusing one output array to save RAM. */
  static listRecursive(
    dir: string | FileSystemPath,
    filter?: (path: string) => boolean,
    result: string[] = []
  ): string[] {
    const dirStr = String(dir);

    try {
      const entries = readdirSync(dirStr, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(dirStr, entry.name);

        if (entry.isDirectory()) {
          this.listRecursive(entryPath, filter, result);
        } else if (!filter || filter(entryPath)) {
          result.push(entryPath);
        }
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to read directory recursively: ${dirStr}`, error);
      throw error;
    }

    return result;
  }

  /** Recursively lists files with `includes` / `excludes` pattern matching. */
  static listRecursiveX(
    dir: string,
    filter?: (path: string) => boolean,
    options: ListRecursiveOptions = {}
  ): string[] {
    const dirStr = String(dir);
    const result = options._result ?? [];

    try {
      const entries = readdirSync(dirStr, { withFileTypes: true });

      for (const entry of entries) {
        // 1. Keep the native Node.js path for filesystem access
        const rawPath = join(dirStr, entry.name);

        // 2. Normalize separators so include/exclude matching works on any OS
        const entryPath = this.normalize(rawPath);

        if (entry.isDirectory()) {
          this.listRecursiveX(rawPath, filter, {
            ...options,
            _result: result
          });
        } else {
          // 1. Custom filter
          if (filter && !filter(entryPath)) continue;

          // 2. Excludes check
          const isExcluded = options.excludes?.some(pattern => {
            const cleanPattern = pattern.replace(/\\/g, '/');
            return entryPath.includes(cleanPattern);
          });
          if (isExcluded) continue;

          // 3. Includes check
          const hasIncludes = options.includes && options.includes.length > 0;
          const isIncluded = !hasIncludes || options.includes!.some(pattern => {
            const cleanPattern = pattern.replace(/\\/g, '/');
            return entryPath.includes(cleanPattern);
          });

          if (isIncluded) {
            result.push(entryPath);
          }
        }
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to read directory (listRecursiveX): ${dirStr}`, error);
      throw error;
    }

    return result;
  }

  /** Streams files recursively without buffering the whole tree in memory. */
  static async *listRecursiveAsync(
    dir: string,
    filter?: (path: string) => boolean
  ): AsyncGenerator<string> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // yield* forwards sub-generator values without allocating an array
          yield* this.listRecursiveAsync(entryPath, filter);
        } else if (!filter || filter(entryPath)) {
          yield entryPath;
        }
      }
    } catch (error) {
      console.error(`[AioFileOperation] Failed to read directory (async): ${dir}`, error);
      throw error;
    }
  }

  /** Removes a path (file or directory) recursively. */
  static clean(...path: string[]): void {
    const str = join(...path).replace(/\\/g, "/");
    try {
      if (!existsSync(str)) {
        return;
      }
      console.log("[Cleaning..] ->", str);
      rmSync(str, { recursive: true, force: true });
    } catch (error) {
      console.error(`[AioFileOperation] Failed to clean path: ${str}`, error);
      throw error;
    }
  }

}
