import { select, Separator, number, input, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
export async function SetGifOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for GIF',
            choices: [
                { name: 'reuse', value: 'reuse' },
                { name: 'progressive', value: 'progressive' },
                { name: 'colors', value: 'colors' },
                { name: 'effort', value: 'effort' },
                { name: 'dither', value: 'dither' },
                { name: 'interFrameMaxError', value: 'interFrameMaxError' },
                { name: 'interPaletteMaxError', value: 'interPaletteMaxError' },
                { name: 'loop', value: 'loop' },
                { name: 'delay', value: 'delay' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            case 'reuse':
                options.reuse = await confirm({ message: 'Re-use existing palette?', default: false });
                break;
            case 'progressive':
                options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
                break;
            case 'colors':
                options.colors = await number({ message: 'Maximum number of palette entries (2-256):', default: 256 });
                break;
            case 'effort':
                options.effort = await number({ message: 'Level of CPU effort to reduce file size (1-10):', default: 7 });
                break;
            case 'dither':
                options.dither = await number({ message: 'Level of Floyd-Steinberg error diffusion (0-1):', default: 1.0 });
                break;
            case 'interFrameMaxError':
                options.interFrameMaxError = await number({ message: 'Maximum inter-frame error for transparency (0-32):', default: 0 });
                break;
            case 'interPaletteMaxError':
                options.interPaletteMaxError = await number({ message: 'Maximum inter-palette error for palette reuse (0-256):', default: 3 });
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
