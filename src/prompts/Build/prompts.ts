import { select } from "@inquirer/prompts";
import { BUILD_TYPES } from "../options.js";
import { MainDialogPrompt } from "../main.prompt.js";
import { ViteBuildPrompt } from "./ViteBuild.prompt.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";

export async function SelectBuildPrompt(DIR: string, engine?: any) {
  try {
    const ROOT_DIR = process.cwd();
    // Clear Console before executing select task 
    console.clear();

    const task = await select({
      message: 'Choose Build Task',
      choices: BUILD_TYPES.map((menu) => ({ name: menu.name, value: menu.value })),
    });

    switch (task || engine) {
      case 'vite':
        ViteBuildPrompt(ROOT_DIR,)
        break;
      case 'back':
        await MainDialogPrompt(ROOT_DIR);
        break;
      case 'quit':
        process.exit(0);
    }
    return task;
  } catch (error) {
    handlePromptError(error);
  }
}