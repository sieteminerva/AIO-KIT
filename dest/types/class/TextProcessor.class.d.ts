import { AioFileOperation } from "./FileOperation.class.js";
export interface InsertOptions {
    [key: string]: string;
}
export interface MatchOptions {
    matchCase?: boolean;
    keyword: string | RegExp;
}
export interface AnalyzeResult {
    characterCount: number;
    wordCount: number;
    lineCount: number;
    uniqueWords?: number;
}
export type AioTextProcessorMethods = 'summarized' | 'translate' | 'split' | 'findMatch' | 'purify' | 'analyze' | 'replace' | 'merge';
/**
 * //TODO Remove all GOOGLE initialization methods,
 * since only translate and summarized are needed
 * just pass the authenticated object TranslateClient() and GenerativeModel
 * as parameter. Move VertexAI
 */
export declare class AioTextProcessor extends AioFileOperation {
    private _output;
    private _options;
    private _auth;
    private _generativeModel;
    private _translate;
    private _isAuthReady;
    /**
     * Constructor for the AioTextProcessor class.
     *
     * Calls the parent class (AioFileOperation) constructor and initializes the
     * Google Cloud clients (Vertex AI, Translate) by calling the initAuth and
     * initGoogleClients methods.
     */
    constructor();
    set options(value: string);
    get options(): string;
    initAuth(): Promise<void>;
    /**
     * @private
     * The default text model used for generative AI tasks.
     * Currently set to "gemini-1.5-pro".
     * This model is used for tasks like summarization.
     * @type {string} DEFAULT_TEXT_MODEL
     */
    private static readonly DEFAULT_TEXT_MODEL;
    /**
     * Initializes the Google Cloud clients (Vertex AI, Translate).
     * This method is called internally during the constructor.
     * It waits for the authentication to complete before attempting to initialize the clients.
     * If the authentication fails, it throws an error.
     * @private
     */
    private initGoogleClients;
    /**
  * Summarizes the content of a text file using the Gemini AI model.
  *
  * @param {string} filePath - The path to the file to summarize.
  * @param {object} [options] - Optional parameters for summarization.
  * @param {number} [options.maxLength] - The maximum length of the summary (not currently used).
  * @param {boolean} [options.showStatistic] - Whether to show statistics (not currently used).
  * @returns {Promise<AioTextProcessor>} - A promise that resolves to the AioTextProcessor instance with the summarized content.
  * @throws {Error} Throws an error if the Vertex AI client is not initialized or if there is an issue with the API request.
  * @example
  * ```typescript
  *  const processor = new AioTextProcessor();
  *  await processor.summarized('path/to/your/file.txt', { maxLength: 100, showStatistic: true });
  *  console.log(processor.content); // Output the summarized text
  * ```
  */
    summarized(filePath: string, options?: {
        maxLength?: number;
        showStatistic?: boolean;
    }): Promise<this | undefined>;
    /**
     * Translates the content of a text file to a specified target language using the Google Translate API.
     *
     * @param {string} filePath - The path to the file to translate.
     * @param {string} [targetLanguage='id-ID'] - The target language code in 'xx-XX' format (e.g., 'en-US', 'es-ES'). Defaults to 'id-ID' (Indonesian).
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the AioTextProcessor instance with the translated content.
     * @throws {Error} Throws an error if the target language code is invalid, the Google Translate client is not initialized, or if there is an issue with the API request.
     *
     * @example
     * ```typescript
     * const processor = new AioTextProcessor();
     * await processor.translate('path/to/your/file.txt', 'en-US'); // Translate to English (US)
     * console.log(processor.content); // Output the translated text
     * ```
     */
    translate(filePath: string, targetLanguage?: string): Promise<AioTextProcessor>;
    /**
     * Reads the content of a file, handling different file types.
     * @param filePath The path to the file.
     * @returns The text content of the file.
     */
    read(filePath: string): Promise<string>;
    /**
     * Merges the content of multiple files into a single string.
     *
     * This method takes an array of file paths and reads the content of each file.
     * The content of each file is concatenated with a newline character and the
     * resulting string is stored in the `content` property of the
     * `AioTextProcessor` instance.
     *
     * @param {...string} filePaths - The paths to the files to merge.
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the
     *   `AioTextProcessor` instance with the merged content.
     * @throws {Error} Throws an error if there is an issue reading any of the
     *   files.
     *
     * @example
     * const processor = new AioTextProcessor();
     * await processor.merge('path/to/file1.txt', 'path/to/file2.txt');
     * console.log(processor.content); // Output the merged content
     */
    merge(...filePaths: string[]): Promise<AioTextProcessor>;
    /**
     * Splits the content of a text file into chunks of a specified size.
     *
     * This method reads the content of a file and divides it into smaller
     * chunks, each containing a maximum number of characters defined by `chunkSize`.
     * The resulting chunks are stored in the `content` property of the
     * `AioTextProcessor` instance as an array of strings.
     *
     * @param {string} filePath - The path to the file to split.
     * @param {number} chunkSize - The maximum number of characters per chunk.
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the
     *   `AioTextProcessor` instance with the split content.
     * @throws {Error} Throws an error if there is an issue reading the file or
     *   splitting the content.
     *
     * @example
     * ```typescript
     *
     *    const processor = new AioTextProcessor();
     *    await processor.split('path/to/your/file.txt', 1000);
     *    console.log(processor.content); // Output: ['Chunk 1...', 'Chunk 2...', ...]
     *
     * ```
     */
    split(filePath: string, chunkSize: number): Promise<AioTextProcessor>;
    /**
     * Compares the content of two files and identifies the differences between them.
     *
     * This method reads the content of two files, compares them line by line, and
     * identifies the lines that are different. The differences are then stored in
     * the `content` property of the `AioTextProcessor` instance.
     *
     * @param {...string[]} filePaths - The paths to the two files to compare.
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the `AioTextProcessor` instance with the comparison results.
     * @throws {Error} Throws an error if more than two file paths are provided or if there is an issue reading the files.
     *
     * @example
     * ```typescript
     *
     *    const processor = new AioTextProcessor();
     *    await processor.compare('path/to/file1.txt', 'path/to/file2.txt');
     *    console.log(processor.content);
     *    // Example output:
     *    // [
     *    //   'Line 3:',
     *    //   '- This is line 3 from file1.',
     *    //   '+ This is line 3 from file2.',
     *    //   'Line 5:',
     *    //   '- This is line 5 from file1.',
     *    //   '+ This is line 5 from file2.'
     *    // ]
     *
     * ```
     */
    compare(...filePaths: string[]): Promise<AioTextProcessor>;
    /**
     * Removes extra whitespace (multiple spaces, tabs, newlines) from the content of a text file.
     *
     * This method reads the content of a file and removes any extra whitespace characters,
     * replacing multiple spaces, tabs, and newlines with a single space. It also trims any
     * leading or trailing whitespace.
     *
     * @param {string} filePath - The path to the file to purify.
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the AioTextProcessor instance with the purified content.
     * @throws {Error} Throws an error if there is an issue reading the file or purifying the content.
     * @example
     * ```typescript
     *
     *    await processor.purify('path/to/your/file.txt');
     *
     * ```
     */
    purify(filePath: string): Promise<AioTextProcessor>;
    /**
     * Analyzes the content of a text file to provide statistics such as character count, word count, line count, and unique word count.
     *
     * This method reads the content of a file and performs various analyses to extract statistical information.
     * It calculates the total number of characters, words, and lines in the file. Additionally, it determines the number of unique words present in the file.
     *
     * @param {string} filePath - The path to the file to analyze.
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the AioTextProcessor instance with the analysis results stored in the `content` property.
     * The `content` property will be an object of type `AnalyzeResult`.
     * @throws {Error} Throws an error if there is an issue reading the file or performing the analysis.
     *
     * @example
     * ```typescript
     *
     *    const processor = new AioTextProcessor();
     *    await processor.analyze('path/to/your/file.txt');
     *    console.log(processor.content);
     *    // Output: { characterCount: 1234, wordCount: 250, lineCount: 20, uniqueWords: 180 }
     *
     * ```
     */
    analyze(filePath: string): Promise<AioTextProcessor>;
    /**
     * Finds matches of a keyword or pattern within the text.
     * @param filePath The path to the file to search.
     * @param matchOptions Options for the search (keyword, case sensitivity).
     * @returns An array of matching lines.
     * @example
     * ```typescript
     *
     *    const processor = new AioTextProcessor();
     *    await processor.findMatch('path/to/your/file.txt', {keyword: 'lies'});
     *    console.log(processor.content); // Output: ['line 1', 'line 2', 'line 3']
     *
     * ```
     */
    findMatch(filePath: string, matchOptions: MatchOptions): Promise<AioTextProcessor>;
    /**
     * Replaces specified tags in a file with corresponding values.
     *
     * This method reads the content of a file and replaces all occurrences of
     * specified tags with their corresponding values. The tags and their values
     * are provided as an array of key-value pairs.
     *
     * @param {string} filePath - The path to the file to modify.
     * @param {{ [key: string]: string }[]} replaceOptions - An array of objects, where each object represents a tag-value pair for replacement.
     * @returns {Promise<AioTextProcessor>} - A promise that resolves to the AioTextProcessor instance with the modified content.
     * @throws {Error} Throws an error if `replaceOptions` is not an array or if there is an issue reading or modifying the file.
     *
     * @example
     * ```typescript
     *
     *    const processor = new AioTextProcessor();
     *    const replaceOptions = [
     *      { "{name}": "John Doe" },
     *      { "{date}": "2024-01-01" },
     *    ];
     *    await processor.replace('path/to/your/file.txt', replaceOptions);
     *    console.log(processor.content); // Output the modified text with replacements
     *
     * ```
     */
    replace(filePath: string, replaceOptions: {
        [key: string]: string;
    }[]): Promise<AioTextProcessor>;
    format(filePath: string): Promise<this>;
}
