import { input } from "@inquirer/prompts";
import { basename, extname } from "path";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
export async function WriteImageNamePrompt(filepath, ext) {
    try {
        const filename = basename(filepath, extname(filepath));
        const defaultName = filename + '_converted' + ext;
        let inputName = await input({
            message: 'Enter the name of converted file\'s.',
            default: defaultName,
        });
        if (inputName) {
            if (extname(inputName) === '' || !extname(inputName))
                inputName = inputName + ext;
            // An extra `suffix` will be added to the input name, but only for the purpose of `presentation` to the user. 
            // The `AioImageProcessor._buildOutputPath()` will be responsible for handling the actual addition of `suffix`.
            return inputName;
        }
    }
    catch (error) {
        handlePromptError(error);
    }
}
