import { AioTextProcessor, AioTextProcessorMethods, MatchOptions } from "../../../class/TextProcessor.class.js";

/**
 * Processes a single file using the specified engine and options.
 *
 * This function acts as a dispatcher, routing the file processing to the appropriate method
 * of the `AioTextProcessor` class based on the provided `engineName`. It supports various
 * text processing operations like finding matches, splitting, replacing, translating, purifying,
 * analyzing, and summarizing.
 *
 * @param processor - An instance of the `AioTextProcessor` class, which provides the text processing methods.
 * @param filepath - The path to the file that needs to be processed.
 * @param engineName - The name of the engine to use for processing. This corresponds to a method name in `AioTextProcessor`.
 * @param options - An object containing options specific to the selected engine.
 *                  For example, `findMatch` might use `MatchOptions`, `split` might use `chunkSize`, and `replace` or `translate` might use other custom options.
 * @returns A Promise that resolves to the processed content of the file. The structure of the returned content depends on the engine used.
 *          For example, `findMatch` might return an array of matches, `split` might return an array of chunks, and others might return a string.
 * @throws Throws an error if an unsupported engine name is provided.
 *
 * @example
 * ```typescript
 * const processor = new AioTextProcessor();
 * const filepath = 'path/to/my/file.txt';
 * const result = await processFile(processor, filepath, 'findMatch', { pattern: /hello/g });
 * console.log(result); // Output: An array of matches found in the file.
 * ```
 */
export async function processFile(processor: AioTextProcessor, filepath: string, engineName: AioTextProcessorMethods, options: any): Promise<any> {
  let result: any = '';
  switch (engineName) {
    case 'findMatch':
      result = await processor.findMatch(filepath as string, options as MatchOptions);
      break;
    case 'split':
      result = await processor.split(filepath as string, options.chunkSize);
      break;
    case 'replace':
    case 'translate':
      result = await processor[engineName as keyof AioTextProcessor](filepath as string, options);
      break;
    case 'purify':
    case 'analyze':
    case 'summarized':
    case 'translate':
      result = await processor[engineName as keyof AioTextProcessor](filepath);
      break;
    default:
      throw new Error(`Unsupported engine: ${engineName}`);
  }
  const content = result.content
  return content;
}
