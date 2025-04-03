import { confirm, input, select } from "@inquirer/prompts";
import { bgBlueBright } from "yoctocolors";
import { LANGUAGE_OPTIONS } from "../../options.js";
import { AioTextProcessorMethods } from "../../../class/TextProcessor.class.js";

interface TextEngineOptions {
  keyword?: string;
  template?: string;
  before?: string;
  after?: string;
  tag?: string;
  chunkSize: number;
}


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
export async function SetOptionsPrompt(engine: AioTextProcessorMethods): Promise<any> {
  let options: any;
  if (engine === 'translate') {
    options = '';
    options = await select({
      message: 'Select translations language:',
      choices: LANGUAGE_OPTIONS.map((lang => ({ name: lang.name, value: lang.value }))),
      default: 'id-ID'
    });
  } else if (engine === 'split') {
    options = {};
    options.chunkSize = await input({ message: 'Set the size of the chunk?', default: '100' });
  } else if (engine === 'findMatch') {
    options = {};
    options.keyword = await input({ message: 'Fill what do you want to find?', default: 'one' });
  } else if (engine === 'replace') {
    options = [];
    let addMore = true;
    while (addMore) {
      const tag = await input({ message: 'Fill the tag to replace (e.g., <%= tag %>):', default: '' });
      const content = await input({ message: `Fill the content to replace for ${tag}:`, default: '' });
      options.push({ [tag]: content });
      addMore = await confirm({ message: 'Do you want to add more tags?', default: false });
      // as `inquirer expand` an there's the 3rd hidden select options as custom that able to receive array options directly 

    }
  }
  console.log(bgBlueBright(` ${engine} options: `), options);
  return options;
}
