import { input, confirm } from "@inquirer/prompts";
import { CompileDeclarationsFiles } from "../../class/CompileDeclarationsFiles.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
/**
 * Prompts the user for input to create index files within a specified directory.
 * It gathers information such as the source directory and the desired file name for the index files.
 * It then utilizes the `CompileDeclarationsFiles` class to generate the index files.
 *
 * @param {string} folderPath - The base folder path where the operation will take place. (Currently not used in the function's logic)
 * @param {string} outputName - The desired output name for the generated files. (Currently not used in the function's logic)
 *
 * @example
 * ```typescript
 *
 *    // Example usage:
 *    await CompileDeclarationsFilesPrompt('/path/to/my/project', 'my-output');
 *    // This will prompt the user for the source directory and file name, then generate index files.
 *
 * ```
 */
export async function CompileDeclarationsFilesPrompt(folderPath, outputName) {
    try {
        let fileName = 'index';
        const src = await input({ message: `Enter 'directory' you want to process?`, default: 'src' });
        let defaultName = await confirm({ message: `'index' will be the generated file name?`, default: true });
        if (!defaultName) {
            fileName = await input({ message: `Type the name the files you want to generate` });
        }
        console.log('Selected DIR :', src);
        console.log('Selected Name :', fileName);
        await new CompileDeclarationsFiles(src, fileName).run();
        console.log('Compiling Process Complete!');
    }
    catch (error) {
        handlePromptError(error);
    }
}
