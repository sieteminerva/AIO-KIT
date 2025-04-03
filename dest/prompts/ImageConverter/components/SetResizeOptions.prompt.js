import { number, confirm } from "@inquirer/prompts";
export async function SetResizeOptionsPrompt() {
    const options = {};
    options.resize = await confirm({ message: 'Do you want to resize the image?', default: false });
    if (options.resize) {
        options.maxWidth = await number({ message: 'Set new `Image Width` for optimizing the output', default: 1000 });
        options.squared = await confirm({ message: 'Would you like to crop the image? (1:1 ratio)', default: false });
    }
    return options;
}
