import { AioTextProcessorMethods } from "../../../class/TextProcessor.class.js";
/**
 * Prompts the user to set options for different text processing engines.
 *
 * This function dynamically generates prompts based on the selected `engine`.
 * It supports 'translate', 'split', 'findMatch', and 'replace' engines, each with its own set of required options.
 *
 * @param engine - The name of the text processing engine. It can be 'translate', 'split', 'findMatch', or 'replace'.
 * @returns A Promise that resolves to the options object or string based on the selected engine.
 *
 * @example
 * // For 'translate' engine
 * const translateOptions = await SetOptionsPrompt('translate'); // Prompts for language selection
 * // For 'split' engine
 * const splitOptions = await SetOptionsPrompt('split'); // Prompts for chunk size
 */
export declare function SetOptionsPrompt(engine: AioTextProcessorMethods): Promise<any>;
