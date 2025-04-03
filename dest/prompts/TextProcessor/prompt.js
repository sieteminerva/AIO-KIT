import { bgRedBright, bgYellowBright, greenBright } from "yoctocolors";
import { join } from "path";
import { AioTextProcessor } from "../../class/TextProcessor.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { WriteTextFilesPrompt } from "./components/WriteFile.prompt.js";
import { SelectTextFilesPrompt } from "./components/SelectFiles.prompt.js";
import { CreateSelectEnginePrompt } from "./components/SelectEngine.prompt.js";
import { SetOptionsPrompt } from "./components/SetOptions.prompt.js";
import { LogContent } from "./components/LogContent.prompt.js";
import { processFile } from "./components/ProcessFile.prompt.js";
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
export async function TextProcessorPrompt(engine) {
    /** Log if env loaded **/
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS)
        console.log(bgRedBright(' Warning '), 'Google env not loaded.');
    try {
        const DIR = join(process.cwd()); /** dont forget to remove `test` **/
        const processor = new AioTextProcessor();
        // TODO add input to paste `access_token` here using new CloudRunAuth().printAccessToken
        // const Auth = new CloudRunAuthClass();
        // await Auth.displayAuthUrl();
        // const accessToken = await input({ message: `${yellowBright('>>')}   Paste your access token here   ${yellowBright('<<')}\n\n` }, { clearPromptOnDone: true });
        // if (accessToken) {
        //   await Auth.getAccessTokenFromCloudRun(accessToken);
        // }
        // Run Engine Selector
        const engineName = engine ? engine : await CreateSelectEnginePrompt();
        console.log('Selected Text Processor :', greenBright(`${engineName}`));
        // Search for files
        const allowed_extensions = ['.txt', '.pdf', '.doc', '.docx', '.md', '.rtf'];
        const folder = await processor.search(DIR, allowed_extensions, false);
        console.log(`Found file :`, greenBright(`${folder.length} files`));
        // Run File Selector
        const fileSelected = await SelectTextFilesPrompt(folder, engineName);
        console.log(`File Selected :`, greenBright(`${fileSelected}`));
        if (engineName && Array.isArray(fileSelected) && fileSelected.length > 0) {
            let result = '';
            let options = {};
            let outputFilePath;
            // Handle merge and compare separately
            if (engineName === 'merge' || engineName === 'compare') {
                result = await processor[engineName](...fileSelected);
                await LogContent(engineName, result.content);
                outputFilePath = await WriteTextFilesPrompt(fileSelected[0], engineName);
                if (outputFilePath) {
                    console.log('output file path :', outputFilePath);
                    await processor.write(outputFilePath, result.content);
                }
            }
            else {
                // Get options for the selected engine
                options = await SetOptionsPrompt(engineName);
                // Process each selected file
                for (const filepath of fileSelected) {
                    console.log(`Processing : `, bgYellowBright(` ${filepath} `));
                    // run the engine
                    result = await processFile(processor, filepath, engineName, options);
                    await LogContent(engineName, result);
                    // Handle split engine (multiple output files)
                    if (engineName === 'split' && Array.isArray(result)) {
                        outputFilePath = await WriteTextFilesPrompt(filepath, engineName, result.length);
                        if (outputFilePath && Array.isArray(outputFilePath)) {
                            // console.log('prompt.ts: ', outputFilePath);
                            // If outputFilePath is an array, write each chunk to its corresponding file
                            for (let i = 0; i < outputFilePath.length; i++) {
                                await processor.write(outputFilePath[i], result[i]);
                            }
                        }
                        else {
                            // This should ideally not happen, but it's a safety net
                            console.warn("Unexpected: outputFilePath is not an array in split engine.");
                            await processor.write(outputFilePath, result);
                        }
                    }
                    else {
                        if (engineName === 'translate') {
                            outputFilePath = await WriteTextFilesPrompt(filepath, `${engineName}_${options}`, result);
                        }
                        else {
                            outputFilePath = await WriteTextFilesPrompt(filepath, engineName);
                        }
                        if (outputFilePath) {
                            await processor.write(outputFilePath, result);
                        }
                    }
                }
            }
        }
        const msg = greenBright(`${fileSelected.length} files successfully processed.`);
        console.log(msg);
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await TextProcessorPrompt();
    }
}
