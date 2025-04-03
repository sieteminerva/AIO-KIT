import { AioTextProcessorMethods } from "../../../class/TextProcessor.class";
/**
 * Logs the content of a file to the console. If the content is an array
 * of strings, it will be logged with a yellow background and the index
 * of each item in the array will be included in the log message.
 *
 * @param {AioTextProcessorMethods} engine - The engine used to process the file.
 * @param {any} content - The content of the file to be logged.
 */
export declare function LogContent(engine: AioTextProcessorMethods, content: any): Promise<void>;
