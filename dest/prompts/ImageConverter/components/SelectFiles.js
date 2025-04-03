import { extname, join } from "path";
import { yellowBright } from "yoctocolors";
import { checkbox } from "@inquirer/prompts";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
import { IMAGE_FORMATS } from "../../options.js";
export async function SelectImageFilesPrompt(folder) {
    try {
        if (folder.length === 0) {
            console.log(yellowBright('file not found!'));
            return [];
        }
        const choices = folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) }));
        const files = await checkbox({
            message: 'Select image files to process?',
            choices,
            validate(choices) {
                return imageFilesValidation(choices);
            },
        });
        return files;
    }
    catch (error) {
        handlePromptError(error);
    }
}
function imageFilesValidation(files) {
    // must select a file
    if (files.length === 0) {
        return 'You must select a file';
    }
    for (const file of files) {
        const file_ext = extname(file.name).toLowerCase().substring(1);
        if (!IMAGE_FORMATS.includes(file_ext)) {
            return file_ext + ' is not an image file. Only image files are allowed!';
        }
    }
    return true;
}
