import { AioFileOperation } from "./FileOperation.class.js";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { readFile } from "fs/promises";
import { extname } from "path";
import { CloudRunAuthClass } from "./CloudRunAuth.class.js";
import {
  HarmCategory,
  HarmBlockThreshold,
  Content,
  GenerateContentResult,
} from "@google-cloud/vertexai"; // Import Vertex AI classes
import { TranslationServiceClient } from "@google-cloud/translate";
import { google } from "@google-cloud/translate/build/protos/protos.js";

export interface InsertOptions {
  [key: string]: string;
}

export interface MatchOptions {
  matchCase?: boolean;
  keyword: string | RegExp; // Allow both string and regex
}

export interface AnalyzeResult {
  characterCount: number;
  wordCount: number;
  lineCount: number;
  uniqueWords?: number; // New: Count of unique words
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param string The string to escape
 * @returns The escaped string
 * @example
 * escapeRegExp("Hello World!") // returns "Hello World\!"
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export type AioTextProcessorMethods = 'summarized' | 'translate' | 'split' | 'findMatch' | 'purify' | 'analyze' | 'replace' | 'merge';
/**
 * //TODO Remove all GOOGLE initialization methods,
 * since only translate and summarized are needed
 * just pass the authenticated object TranslateClient() and GenerativeModel
 * as parameter. Move VertexAI 
 */

/**
 * @class AioTextProcessor
 * The `AioTextProcessor` class provides a suite of methods for processing text files, including reading, summarizing, translating, splitting, merging, comparing, purifying, analyzing, finding matches, and replacing text.
 * It leverages Google Cloud's Vertex AI and Translate APIs for advanced text processing capabilities.
 *
 * @example
 * ```typescript
 * import { AioTextProcessor } from './TextProcessor.class';
 *
 * async function main() {
 *   const processor = new AioTextProcessor();
 *
 *   // Summarize a file
 *   await processor.summarized('path/to/your/file.txt', { maxLength: 100, showStatistic: true });
 *   console.log('Summarized:', processor.content);
 *
 *   // Translate a file
 *   await processor.translate('path/to/your/file.txt', 'en-US');
 *   console.log('Translated:', processor.content);
 *
 *   // Split a file into chunks
 *   await processor.split('path/to/your/file.txt', 1000);
 *   console.log('Split:', processor.content);
 *
 *   // Merge multiple files
 *   await processor.merge('path/to/file1.txt', 'path/to/file2.txt');
 *   console.log('Merged:', processor.content);
 *
 *   // Compare two files
 *   await processor.compare('path/to/file1.txt', 'path/to/file2.txt');
 *   console.log('Compared:', processor.content);
 *
 *   // Purify a file (remove extra whitespace)
 *   await processor.purify('path/to/your/file.txt');
 *   console.log('Purified:', processor.content);
 *
 *   // Analyze a file
 *   await processor.analyze('path/to/your/file.txt');
 *   console.log('Analyzed:', processor.content);
 *
 *   // Find matches in a file
 *   await processor.findMatch('path/to/your/file.txt', { keyword: 'example', matchCase: false });
 *   console.log('Matches:', processor.content);
 *
 *   // Replace text in a file
 *   const replaceOptions = [
 *     { "{name}": "John Doe" },
 *     { "{date}": "2024-01-01" },
 *   ];
 *   await processor.replace('path/to/your/file.txt', replaceOptions);
 *   console.log('Replaced:', processor.content);
 * }
 *
 * main().catch(console.error);
 * ```
 *
 * @class AioTextProcessor
 * @extends AioFileOperation
 *
 * @property {string} content - The processed text content.
 * @property {any} options - Additional options for text processing.
 *
 * @see {@link AioTextProcessor.constructor }  - Initializes the `AioTextProcessor` and sets up Google Cloud clients.
 * @see {@link AioTextProcessor.initAuth }  - Initializes the authentication for Google Cloud services.
 * @see {@link AioTextProcessor.initGoogleClients }  - Initializes the Vertex AI and Translate clients.
 * @see {@link AioTextProcessor.summarized }  - Summarizes the content of a text file using the Gemini AI model.
 * @see {@link AioTextProcessor.translate }  - Translates the content of a text file to a specified target language.
 * @see {@link AioTextProcessor.read }  - Reads the content of a file, handling different file types (.docx, .pdf, .txt).
 * @see {@link AioTextProcessor.merge }  - Merges the content of multiple files into a single string.
 * @see {@link AioTextProcessor.split }  - Splits the content of a text file into chunks of a specified size.
 * @see {@link AioTextProcessor.compare }  - Compares the content of two files and identifies the differences.
 * @see {@link AioTextProcessor.purify }  - Removes extra whitespace from the content of a text file.
 * @see {@link AioTextProcessor.analyze }  - Analyzes the content of a text file to provide statistics.
 * @see {@link AioTextProcessor.findMatch }  - Finds matches of a keyword or pattern within the text.
 * @see {@link AioTextProcessor.replace }  - Replaces specified tags in a file with corresponding values.
 * @see {@link AioTextProcessor.format }  - Formats the content of a file (currently not implemented).
 *
 * @interface InsertOptions - Defines the structure for insert options.
 * @interface MatchOptions - Defines the structure for match options.
 * @interface AnalyzeResult - Defines the structure for analysis results.
 *
 * @type {AioTextProcessorMethods} - Defines the available methods in `AioTextProcessor`.
 *
 * @private
 * @readonly
 * @property {string} DEFAULT_TEXT_MODEL - The default text model used for generative AI tasks.
 *
 * @throws {Error} Throws an error if there is an issue with file reading, API requests, or invalid input.
 *
 * @see {@link https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini|Gemini AI Model}
 * @see {@link https://cloud.google.com/translate/docs/reference/rest/v3/projects.locations.translateText|Google Translate API}
 * @see {@link https://www.npmjs.com/package/mammoth|Mammoth}
 * @see {@link https://www.npmjs.com/package/pdf-parse|Pdf-parse}
 */


export class AioTextProcessor extends AioFileOperation {
  private _output: string = "";
  private _options: any;
  private _auth: CloudRunAuthClass | undefined;
  private _generativeModel: any | undefined;
  private _translate: any;
  private _isAuthReady = false;

  /**
   * Constructor for the AioTextProcessor class.
   *
   * Calls the parent class (AioFileOperation) constructor and initializes the
   * Google Cloud clients (Vertex AI, Translate) by calling the initAuth and
   * initGoogleClients methods.
   */
  constructor() {
    super();
    this.initAuth();
    // Initialize clients and store the promise

  }

  // TODO we'll use it later
  set options(value: string) {
    this._options = value;
  }

  get options(): string {
    return this._options;
  }

  async initAuth() {
    this._auth = new CloudRunAuthClass();

    await this.initGoogleClients();

  }

  /**
   * @private
   * The default text model used for generative AI tasks.
   * Currently set to "gemini-1.5-pro".
   * This model is used for tasks like summarization.
   * @type {string} DEFAULT_TEXT_MODEL
   */
  private static readonly DEFAULT_TEXT_MODEL: string = "gemini-1.5-pro";


  /**
   * Initializes the Google Cloud clients (Vertex AI, Translate).
   * This method is called internally during the constructor.
   * It waits for the authentication to complete before attempting to initialize the clients.
   * If the authentication fails, it throws an error.
   * @private
   */
  private async initGoogleClients() {
    //wait for auth
    // await this.initAuth();
    if (!this._auth) {
      console.error('Failed to initialize Auth');
      return;
    }
    try {
      // Initialize the Vertex AI Generative Model only once
      await this._auth.getGoogleApi();
      const textModel = AioTextProcessor.DEFAULT_TEXT_MODEL;
      if (this._auth.isVertexReady && this._auth.vertexAI) {
        this._generativeModel = this._auth.vertexAI.getGenerativeModel({
          model: textModel,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
          ],
          generationConfig: { maxOutputTokens: 256 },
          systemInstruction: {
            role: 'system',
            parts: [{ "text": `You are a helpful customer service agent.` }]
          },
        });
      }
      // console.log('this._generativeModel =>', this._generativeModel);
    } catch (error) {
      console.error('Error initializing Google clients:', error);
    }
  }


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
  async summarized(filePath: string, options?: { maxLength?: number, showStatistic?: boolean }): Promise<this | undefined> {
    // Wait for the clients to be ready before proceeding
    try {
      // read the file
      const content = await this.read(filePath);
      if (!this._auth?.isVertexReady) {
        console.warn("Vertex AI is not available. Summarization will be skipped.");
        this.content = 'Vertex AI is not available. Summarization will be skipped.';
        return this;
      }
      // Prepare the prompt
      const prompt = `Summarize the following text:\n\n${content}\n\nSummary:`;
      // Prepare the request
      const request = {
        contents: [{ role: "user", parts: [{ text: prompt }] }] as Content[],
      };

      // Generate content
      const result: GenerateContentResult = await this._generativeModel.generateContent(request);
      const response = result.response;
      // console.log('result =>', JSON.stringify(response));
      // Check if the response is valid and contains candidates
      if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts[0].text) {
        const generatedText = response.candidates[0].content.parts[0].text;
        if (!generatedText) {
          const errorMessage = "No text generated from the model.";
          console.error(errorMessage);
          throw new Error(errorMessage); // Throw a custom error
        }
        this.content = generatedText.trim();
        // console.log('Your summarized text =>', this.content)
        return this;
      } else {
        // Handle cases where the response is not as expected
        console.error("Unexpected response format from Gemini API:", result);
        this.content = ""; // Or some default value
      }

    } catch (error) {
      console.error(`Error summarizing file ${filePath}:`, error || error); // Include error.message if available
      this.content = `Error summarizing file ${filePath}:` + error;
      return this;
    }

  }

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
  async translate(filePath: string, targetLanguage: string = 'id-ID'): Promise<AioTextProcessor> {
    // Wait for the clients to be ready before proceeding
    try {
      if (!/^[a-z]{2}-[A-Z]{2}$/.test(targetLanguage)) {
        console.warn(`Invalid target language code: ${targetLanguage}. Please use the format 'xx-XX' (e.g., 'en-US').`);
      }

      const content = await this.read(filePath);

      if (!this._auth?.isTranslateReady) {
        console.warn("Google Translate is not available. Translation will be skipped.");
        this.content = 'Google Translate is not available. Translation will be skipped.';
        return this;
      }

      // Construct the request
      const request: google.cloud.translation.v3.ITranslateTextRequest = {
        parent: `projects/${this._auth?.project_id}/locations/global`,
        contents: [content],
        mimeType: 'text/plain',
        targetLanguageCode: targetLanguage,
      };

      if (this._auth && this._auth.translationClient instanceof TranslationServiceClient) {
        // Make the API call using @google-cloud/translate
        const [response] = await this._auth.translationClient.translateText(request);

        if (response.translations && response.translations.length > 0 && typeof response.translations[0].translatedText === 'string') {
          this.content = response.translations[0].translatedText;
        } else {
          throw new Error(`No translations found in the response for file ${filePath} and target language ${targetLanguage}.`);
        }
      }
      return this;

    } catch (error) {
      console.error(`Error translating file ${filePath}:`, error || error); // Include error.message if available
      this.content = `Error translating file ${filePath}:` + error;
      return this;
    }
  }




  /**
   * Reads the content of a file, handling different file types.
   * @param filePath The path to the file.
   * @returns The text content of the file.
   */
  async read(filePath: string): Promise<string> {
    const fileExtension = extname(filePath).toLowerCase();
    try {
      if (fileExtension === ".docx") {
        const buffer = await readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });
        // console.log('mammoth result:', result);
        return result.value;
      } else if (fileExtension === ".pdf") {
        const buffer = await readFile(filePath);
        const data = await pdf(buffer);
        // console.log('pdf-parse result:', data);
        return data.text;
      } else {
        return await super.read(filePath);
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }



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
  async merge(...filePaths: string[]): Promise<AioTextProcessor> {
    let mergedContent = "";
    for (const filePath of filePaths) {
      try {
        const content = await this.read(filePath);
        mergedContent += content + "\n"; // Add a newline between files
        this.content = mergedContent;
        // console.log('merged content :', this.content);
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
      }
    }
    return this;
  }


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
  async split(filePath: string, chunkSize: number): Promise<AioTextProcessor> {
    const results = [];
    try {
      chunkSize = Number(chunkSize);
      const content = await this.read(filePath);
      const numChunks = Math.ceil(content.length / chunkSize);
      for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, content.length);
        const chunk = content.substring(start, end);
        results.push(chunk);
      }
      this.content = results;
      return this;
    } catch (error) {
      console.error(`Error splitting file ${filePath}:`, error);
      throw error;
    }
  }


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
  async compare(...filePaths: string[]): Promise<AioTextProcessor> {
    if (filePaths.length > 2) {
      throw new Error("You can only compare two files at a time.");
    }
    try {
      const content1 = await this.read(filePaths[0]);
      const content2 = await this.read(filePaths[1]);
      const lines1 = content1.split(/\r\n|\r|\n/);
      const lines2 = content2.split(/\r\n|\r|\n/);
      const diff: string[] = [];

      const maxLength = Math.max(lines1.length, lines2.length);
      for (let i = 0; i < maxLength; i++) {
        const line1 = lines1[i] || "";
        const line2 = lines2[i] || "";
        if (line1 !== line2) {
          diff.push(`Line ${i + 1}:`);
          diff.push(`- ${line1}`);
          diff.push(`+ ${line2}`);
        }
      }
      this.content = diff;
      return this;
    } catch (error) {
      console.error(`Error comparing files ${filePaths[0]} and ${filePaths[1]}:`, error);
      throw error;
    }
  }


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
  async purify(filePath: string): Promise<AioTextProcessor> {
    try {
      const content = await this.read(filePath);
      // Remove extra whitespace (multiple spaces, tabs, newlines)
      const purifiedContent = content.replace(/\s+/g, " ").trim();
      this.content = purifiedContent;
      return this;
    } catch (error) {
      console.error(`Error purifying file ${filePath}:`, error);
      throw error;
    }
  }


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
  async analyze(filePath: string): Promise<AioTextProcessor> {
    try {
      const content = await this.read(filePath);
      const characterCount = content.length;
      const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
      const lineCount = content.split(/\r\n|\r|\n/).length;
      const uniqueWords = new Set(content.toLowerCase().match(/\b\w+\b/g)).size;
      this.content = { characterCount, wordCount, lineCount, uniqueWords } as AnalyzeResult;
      return this;
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      throw error;
    }
  }




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
  async findMatch(filePath: string, matchOptions: MatchOptions): Promise<AioTextProcessor> {
    try {
      const content = await this.read(filePath);
      const lines = content.split(/\r\n|\r|\n/);
      const matchingLines: string[] = [];
      const { keyword, matchCase = true } = matchOptions;
      const regex = keyword instanceof RegExp ? keyword : new RegExp(keyword, matchCase ? "" : "i");

      for (const line of lines) {
        if (regex.test(line)) {
          matchingLines.push(line);
        }
      }
      this.content = matchingLines;

      return this;
    } catch (error) {
      console.error(`Error finding matches in file ${filePath}:`, error);
      throw error;
    }
  }


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

  async replace(filePath: string, replaceOptions: { [key: string]: string }[]): Promise<AioTextProcessor> {
    try {
      const content = await this.read(filePath);
      let modifiedContent = content;

      if (!Array.isArray(replaceOptions)) {
        throw new Error("replaceOptions must be an array of key-value pairs.");
      }

      for (const option of replaceOptions) {
        for (const tag in option) {
          const value = option[tag];
          const escapedTag = escapeRegExp(tag);
          modifiedContent = modifiedContent.replace(new RegExp(escapedTag, "g"), value);
        }
      }

      this.content = modifiedContent;
      return this;
    } catch (error) {
      console.error(`Error replacing text in file ${filePath}:`, error);
      throw error;
    }
  }


  async format(filePath: string) {
    return this;
  }

}
