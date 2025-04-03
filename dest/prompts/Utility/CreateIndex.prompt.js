import { input, confirm } from "@inquirer/prompts";
import { CreateIndexFiles } from "../../class/CreateIndexFiles.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
export async function CreateIndexFilesPrompt(folderPath, outputName) {
    try {
        let fileName = 'index';
        const src = await input({ message: `Enter 'directory' you want to process?`, default: 'src' });
        let defaultName = await confirm({ message: `'index' will be the generated file name?`, default: true });
        if (!defaultName) {
            fileName = await input({ message: `Type the name the files you want to generate` });
        }
        console.log('Selected DIR :', src);
        console.log('Selected Name :', fileName);
        await new CreateIndexFiles(src, fileName).run();
        console.log('Compiling Process Complete!');
    }
    catch (error) {
        handlePromptError(error);
    }
}
