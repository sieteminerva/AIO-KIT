import { select, Separator, number, input, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
export async function SetWebpOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for WebP',
            choices: [
                { name: 'alphaQuality', value: 'alphaQuality' },
                { name: 'lossless', value: 'lossless' },
                { name: 'nearLossless', value: 'nearLossless' },
                { name: 'smartSubsample', value: 'smartSubsample' },
                { name: 'effort', value: 'effort' },
                { name: 'minSize', value: 'minSize' },
                { name: 'mixed', value: 'mixed' },
                { name: 'preset', value: 'preset' },
                { name: 'loop', value: 'loop' },
                { name: 'delay', value: 'delay' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            case 'alphaQuality':
                options.alphaQuality = await number({ message: 'Quality of alpha layer (0-100):', default: 100 });
                break;
            case 'lossless':
                options.lossless = await confirm({ message: 'Use lossless compression mode?', default: false });
                break;
            case 'nearLossless':
                options.nearLossless = await confirm({ message: 'Use near_lossless compression mode?', default: false });
                break;
            case 'smartSubsample':
                options.smartSubsample = await confirm({ message: 'Use high quality chroma subsampling?', default: false });
                break;
            case 'effort':
                options.effort = await number({ message: 'Level of CPU effort to reduce file size (0-6):', default: 4 });
                break;
            case 'minSize':
                options.minSize = await confirm({ message: 'Prevent use of animation key frames to minimise file size (slow)?', default: false });
                break;
            case 'mixed':
                options.mixed = await confirm({ message: 'Allow mixture of lossy and lossless animation frames (slow)?', default: false });
                break;
            case 'preset':
                options.preset = await select({
                    message: 'Preset options:',
                    choices: [
                        { name: 'default', value: 'default' },
                        { name: 'photo', value: 'photo' },
                        { name: 'picture', value: 'picture' },
                        { name: 'drawing', value: 'drawing' },
                        { name: 'icon', value: 'icon' },
                        { name: 'text', value: 'text' },
                    ],
                    default: 'default'
                });
                break;
            case 'loop':
                options.loop = await number({ message: 'Number of animation iterations (0 for infinite):', default: 0 });
                break;
            case 'delay':
                options.delay = await input({ message: 'Delay(s) between animation frames (in milliseconds, comma-separated):', default: '' }).then(input => input.split(',').map(Number));
                break;
            case 'skip':
                addMore = false;
                break;
        }
        if (option !== 'skip') {
            addMore = await confirm({ message: 'Do you want to add more options?', default: false });
        }
    }
    return options;
}
