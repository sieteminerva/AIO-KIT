import { select } from '@inquirer/prompts';
import { handlePromptError } from './ErrorHandler.prompt.js';
import { MAIN_TASKS } from './options.js';

// Task modules are imported lazily in the switch below.



const DEST_DIR = process.cwd();

/**
 * Displays the main dialog prompt to the user, allowing them to select a task to run.
 *
 * This function presents a menu of available tasks defined in `MAIN_TASKS` and executes the corresponding
 * prompt based on the user's selection. It handles errors gracefully and recursively calls itself to
 * keep the prompt active until the user chooses to quit.
 *
 * @param DIR - The directory path to be used for certain tasks. If not provided, it defaults to the current working directory.
 * @param filename - An optional filename that can be used by certain tasks.
 *
 * @example
 * ```typescript
 * // Calling the function to start the main dialog prompt
 * MainDialogPrompt('/path/to/my/directory', 'myFile.txt');
 * ```
 */
export async function MainDialogPrompt(DIR: string, filename?: string, options?: any) {

  DIR ? DIR : DEST_DIR
  try {
    const menu = await select({
      message: 'Select task you wanted to run?',
      choices: MAIN_TASKS.map((menu) => ({
        name: menu.name,
        value: menu.value,
      }))
    });
    switch (menu) {
      case 'project': {
        const { CreateProjectPrompt } = await import('./New/CreateProject.prompt.js');
        await CreateProjectPrompt(filename as string);
        break;
      }
      case 'build': {
        const { SelectBuildPrompt } = await import('./Build/prompts.js');
        await SelectBuildPrompt(DIR as string);
        break;
      }
      case 'generator': {
        const { DataGeneratorPrompt } = await import('./Generator/DataGenerator.prompt.js');
        await DataGeneratorPrompt(DIR, null);
        break;
      }
      case 'utility': {
        const { SelectUtilityPrompt } = await import('./Utility/SelectUtility.prompt.js');
        await SelectUtilityPrompt(DIR, filename, options);
        break;
      }
      case 'text': {
        const { TextProcessorPrompt } = await import('./Text/prompt.js');
        await TextProcessorPrompt();
        break;
      }
      case 'quit':
        process.exit(0);
    }
  } catch (error) {
    handlePromptError(error)
  } finally {
    await MainDialogPrompt(DIR, filename);
  }

}
