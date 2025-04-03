import { AioTextProcessorMethods } from "../../class/TextProcessor.class.js";
/**
 * Orchestrates the text processing workflow, guiding the user through engine selection,
 * file selection, option setting, and file processing.
 *
 * This function serves as the main entry point for the text processing functionality.
 * It handles the entire process from start to finish, including error handling and
 * recursive re-invocation.
 *
 * @param {AioTextProcessorMethods} [engine] - Optional. If provided, skips the engine
 *   selection prompt and uses the specified engine directly.
 *
 * @example
 * // Run the prompt with default behavior (engine selection prompt)
 * TextProcessorPrompt();
 * // Run the prompt directly with the 'summarize' engine
 * TextProcessorPrompt('summarize');
 */
export declare function TextProcessorPrompt(engine?: AioTextProcessorMethods): Promise<void>;
