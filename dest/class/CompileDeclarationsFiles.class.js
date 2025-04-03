import { existsSync } from "node:fs";
import { readdir, open, writeFile, rm } from "node:fs/promises";
import { join, resolve } from 'node:path';
/**
 * @example
 * ```typescript
 *
 *    // Example usage:
 *    const options = {
 *       directoryPath: 'src/target/',
 *       outputFileName: 'index',
 *     };
 *
 *     const concatenator = new CreateIndexFiles(
 *       options.directoryPath,
 *       options.outputFileName,
 *     );
 *
 *     concatenator.run()
 *       .then(() => console.log('Done!'))
 *       .catch((err) => console.error("Failed!", err));
 *
 * ```
 */
export class CompileDeclarationsFiles {
    /**
     * Constructor for the CreateIndexFiles class.
     *
     * @param {string} targetDirectory - The directory to process.
     * @param {string} outputName - The base name for the output files (d.ts and js).
     *
     * @example
     */
    constructor(targetDirectory, outputName) {
        this._root = resolve('./'); // Calculate project root
        this._targetDirectory = resolve(this._root, targetDirectory);
        this._outputName = outputName;
        this._dtsExt = '.d.ts';
        this._jsExt = '.js';
    }
    /**
     * Executes the main logic of the class.
     *
     * This method orchestrates the entire process of:
     * 1. Checking and removing existing output files (d.ts and js).
     * 2. Searching for .d.ts files in the target directory.
     * 3. Concatenating the content of all found .d.ts files.
     * 4. Writing the concatenated content to a new .d.ts file.
     * 5. Generating export statements from the concatenated content.
     * 6. Writing the export statements to a new .js file.
     *
     * @returns {Promise<void>} A promise that resolves when the process is complete.
     *
     * @example
     * ```typescript
     *
     *    const compiler = new CompileDeclarationsFiles('src/target', 'index');
     *    await compiler.run();
     *
     * ```
     */
    async run() {
        console.log('root', this._root);
        const dts = this._outputName + this._dtsExt;
        const js = this._outputName + this._jsExt;
        const outputFiles = await this.checkOutputFiles(dts, js);
        const files = await this.search(this._targetDirectory, this._dtsExt);
        /** if nothing is found stop the process **/
        if (files.length === 0) {
            console.warn(`No ${this._dtsExt} files found in ${this._targetDirectory}`);
            return;
        }
        /** Concatenate all d.ts files **/
        const docs = await this.concatenateFiles(files);
        console.log(`[Writing new]: '${dts}'`);
        await this.write(outputFiles['dts'], docs);
        /** Generate index.js with export statement from d.ts files **/
        const exports = this.generateExports(docs, outputFiles['dts']);
        console.log(`[Writing new]: '${js}'`);
        await this.write(outputFiles['js'], exports);
    }
    /**
     * Checks for the existence of output files (d.ts and js) and removes them if they exist.
     *
     * This method constructs the full paths for the output d.ts and js files based on the project root and the provided file names.
     * It then checks if each file exists using `existsSync`. If a file exists, it logs a message indicating that it will be removed and then proceeds to remove it using `rm`.
     * Finally, it returns an object containing the full paths of the d.ts and js files.
     *
     * @param {string} dtsFileName - The name of the d.ts output file (e.g., 'index.d.ts').
     * @param {string} jsFileName - The name of the js output file (e.g., 'index.js').
     * @returns {Promise<{ dts: string; js: string }>} A promise that resolves with an object containing the full paths of the d.ts and js files.
     *
     * @example
     * ```typescript
     *
     *    const compiler = new CompileDeclarationsFiles('src/target', 'index');
     *    const outputFiles = await compiler.checkOutputFiles('index.d.ts', 'index.js');
     *    console.log(outputFiles.dts); // Output: /path/to/project/index.d.ts
     *    console.log(outputFiles.js);  // Output: /path/to/project/index.js
     *
     * ```
     */
    async checkOutputFiles(dtsFileName, jsFileName) {
        const dts = join(this._root, dtsFileName);
        const js = join(this._root, jsFileName);
        if (existsSync(dts)) {
            console.log(`[Remove existing]: '${dtsFileName}'`);
            await rm(dts); // remove existing index.d.ts file
        }
        if (existsSync(js)) {
            console.log(`[Remove existing]: '${jsFileName}'`);
            await rm(js); // remove existing index.js file
        }
        return { dts, js };
    }
    async concatenateFiles(files) {
        const docs = [];
        for (const file of files) {
            const filePath = join(file.parentPath, file.name);
            // console.log(`[The Correct Path]: ${filePath}`);
            // scan all dts files from targetDirectory
            const fileContent = await this.scan(filePath);
            // console.log('file content:', fileContent);
            const formattedContent = this.format('dts', fileContent, filePath);
            // console.log('formatted content:', formattedContent);
            docs.push(...formattedContent);
        }
        return docs;
    }
    /**
     * Generates export statements for functions and classes found in the concatenated .d.ts files.
     *
     * This method takes the concatenated content of .d.ts files and extracts function and class names.
     * It then formats these names into export statements for a .js file.
     *
     * @param {string[]} docs - An array of strings representing the concatenated content of .d.ts files.
     * @param {string} outputDtsPath - The path where the combined .d.ts file is written.
     * @returns {string[]} An array of strings representing the formatted export statements.
     *
     * @example
     * ```typescript
     *
     *    const docs = ['function myFunction();', 'class MyClass {}'];
     *    const outputDtsPath = '/path/to/index.d.ts';
     *    const exports = this.generateExports(docs, outputDtsPath);
     *    console.log(exports); // Output: ['// Content from: /path/to/index.d.ts', 'export { myFunction, MyClass } from "./index";', '\n']
     *
     * ```
     */
    generateExports(docs, outputDtsPath) {
        // scan fn and class from combined 'dts' output content, then remove duplicated export
        const exportContent = this.filterFnClass(docs);
        // set filePath from generated output dts path
        const formattedExport = this.format('js', exportContent, outputDtsPath);
        return formattedExport;
    }
    /**
     * Filters an array of strings to extract and return unique function and class names.
     *
     * This method iterates through an array of strings, typically representing lines of code from .d.ts files.
     * It uses a regular expression to identify lines that declare `functions` or `classes`.
     * The `names` of the identified functions and classes are extracted and stored.
     * Duplicate names are removed, ensuring that only unique names are returned.
     *
     * @param {string[]} content - An array of strings, each representing a line of code.
     * @returns {string[]} An array of unique function and class names found in the input content.
     *
     * @example
     * ```typescript
     *
     *    const content = [
     *      'function myFunction();',
     *      'class MyClass {}',
     *      'function myFunction();', // Duplicate
     *      'class AnotherClass {}',
     *    ];
     *    const filteredNames = this.filterFnClass(content);
     *    console.log(filteredNames); // Output: ['myFunction', 'MyClass', 'AnotherClass']
     *
     * ```
     */
    filterFnClass(content) {
        const filteredContent = [];
        const pattern = /(?:function|class)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|class\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends|implements|\{)/;
        // const pattern2: RegExp = /(?:function|class|interface)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|class\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends|implements|\{)|interface\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends|\{)/;
        for (const line of content) {
            if (line) {
                const fnClassMatch = line.match(pattern);
                if (fnClassMatch) {
                    // console.log('Match :', fnClassMatch);
                    // const matchedName2 = fnClassMatch[1] || fnClassMatch[2] || fnClassMatch[3];
                    const matchedName = fnClassMatch[1] || fnClassMatch[2]; // Get the captured name from either group 1 or 2
                    if (matchedName) {
                        // const exportStatement = `export { ${matchedName} } from "index.d.ts";`;
                        // console.log('match', matchedName);
                        filteredContent.push(matchedName);
                    }
                }
            }
        }
        return filteredContent.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }
    /**
     * Formats content based on the specified task ('js' or 'dts') and adds a header indicating the source file.
     *
     * This method is responsible for formatting the content that will be written to either the .js or .d.ts output files.
     * It adds a comment header indicating the source file path and then formats the content based on the task.
     * For the 'js' task, it generates an export statement. For other tasks, it simply includes the content as is.
     *
     * @param task - The task to perform ('js' for generating export statements, 'dts' for including raw content).
     * @param content - An array of strings representing the content to format.
     * @param filePath - The path of the file from which the content originated.
     * @returns An array of strings representing the formatted content.
     *
     * @example
     * ```typescript
     *
     *    const compiler = new CompileDeclarationsFiles('src/target', 'index');
     *    const dtsContent = ['function myFunction();', 'class MyClass {}'];
     *    const formattedDts = compiler.format('dts', dtsContent, '/path/to/myFile.d.ts');
     *    console.log(formattedDts);
     *    // Output: ['// Content from: /path/to/myFile.d.ts', 'function myFunction();', 'class MyClass {}', '\n']
     *
     *    const jsContent = ['myFunction', 'MyClass'];
     *    const formattedJs = compiler.format('js', jsContent, '/path/to/myFile.d.ts');
     *    console.log(formattedJs);
     *    // Output: ['// Content from: /path/to/myFile.d.ts', 'export { myFunction, MyClass } from "./index";', '\n']
     *
     * ```
     */
    format(task, content, filePath) {
        const formattedContent = [];
        if (content.length > 0) {
            formattedContent.push(`// Content from: ${filePath}`);
            switch (task) {
                case 'js':
                    const exportStatement = `export { ${content.join(', ')} } from "./${this._outputName}";`;
                    formattedContent.push(exportStatement);
                    break;
                default:
                    formattedContent.push(...content);
                    break;
            }
            formattedContent.push('\n');
        }
        return formattedContent;
    }
    /**
     * Opens a file at the specified path and returns a file handle.
     *
     * @param filePath - The path of the file to open.
     * @returns A promise that resolves to a FileHandle object for the opened file.
     * @throws {Error} - Throws an error if the file cannot be opened.
     * @example
     */
    async open(filePath) {
        return await open(filePath);
    }
    /**
     * Searches for files within a specified directory, filtering by file extension.
     *
     * This method recursively scans a directory and its subdirectories for files. It can filter
     * the results based on a specified file extension.
     * @param {string} directory - The path to the directory to search.
     * @param {string} ext - A single file extension to filter by.
     * @returns {Promise<Dirent[]>} - A promise that resolves to an array of Dirent objects representing the found files.
     * @example
     */
    async search(directory, ext) {
        const files = await readdir(directory, { withFileTypes: true, recursive: true, encoding: 'utf-8' });
        /** Filtering the found object and identify it. if it is a file and have the given extension **/
        const targetedFiles = files.filter((file) => {
            return file.isFile() && file.name.endsWith(ext);
        });
        return targetedFiles;
    }
    /**
     * Reads a file line by line and returns an array of strings, where each string is a line from the file.
     *
     * @param {string} filePath - The path to the file to be scanned.
     * @returns {Promise<string[]>} - A promise that resolves to an array of strings, where each string is a line from the file.
     * @example
     */
    async scan(filePath) {
        const content = [];
        const fileContent = await this.open(filePath);
        const docs = fileContent.readLines({ encoding: 'utf-8' });
        for await (const line of docs) {
            content.push(line);
        }
        return content;
    }
    /**
     * Writes an array of strings to a file, overwriting any existing content.
     * @param {string} outputFilePath - The path to the file to be written.
     * @param {string[]} content - The array of strings to be written to the file.
     * @returns {Promise<void>} - A promise that resolves when the write operation is complete.
     * @example
     */
    async write(outputFilePath, content) {
        await writeFile(outputFilePath, content.join('\n'), 'utf-8');
    }
}
