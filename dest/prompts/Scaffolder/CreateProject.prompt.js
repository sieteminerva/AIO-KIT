import { input, select } from "@inquirer/prompts";
import { green, cyan } from 'yoctocolors';
import { join } from "path";
import { PROJECT_TYPES } from "../options.js";
import { AioProjectScaffolder } from "../../class/ProjectScaffolder.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { MainDialogPrompt } from "../main.prompt.js";
/**
 * Prompts the user to create a new project, guiding them through the process of
 * specifying the project name and type. It then uses the `AioProjectScaffolder`
 * to set up the project based on the user's choices.
 *
 * @param name - An optional pre-defined project name. If provided, the prompt
 *   for the project name will be skipped.
 *
 * @example
 * // Example usage without a pre-defined name:
 * await CreateProjectPrompt();
 *
 * @example
 * // Example usage with a pre-defined name:
 * await CreateProjectPrompt("my-awesome-project");
 */
export async function CreateProjectPrompt(name) {
    const ROOT_DIR = process.cwd();
    const scaffolder = new AioProjectScaffolder();
    try {
        const projectName = name ? name : await input({ message: 'What is your project name?' });
        if (projectName) {
            const DEST_DIR = join(ROOT_DIR, projectName);
            const projectType = await select({
                message: 'Choose your project type below.',
                choices: PROJECT_TYPES.map((menu) => ({ name: menu.name, value: menu.value }))
            });
            if (projectType) {
                switch (projectType) {
                    case 'design':
                        scaffolder.DesignProject(DEST_DIR);
                        break;
                    case 'website':
                        scaffolder.WebProject(DEST_DIR);
                        break;
                    case 'mobile':
                        console.log('Not yet implemented!');
                        break;
                    case 'back':
                        await MainDialogPrompt(ROOT_DIR);
                        break;
                    case 'quit':
                        process.exit(0);
                }
                console.log('Project name  : %s', green(projectName));
                console.log('Project type  : %s', green(projectType));
            }
            console.log(cyan('Creating New Project Complete!'));
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await CreateProjectPrompt(name);
    }
}
