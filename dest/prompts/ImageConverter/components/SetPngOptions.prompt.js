import { select, Separator, number, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
export async function SetPngOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for PNG',
            choices: [
                { name: 'progressive', value: 'progressive' },
                { name: 'compressionLevel', value: 'compressionLevel' },
                { name: 'adaptiveFiltering', value: 'adaptiveFiltering' },
                { name: 'effort', value: 'effort' },
                { name: 'palette', value: 'palette' },
                { name: 'colors', value: 'colors' },
                { name: 'dither', value: 'dither' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            case 'progressive':
                options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
                break;
            case 'compressionLevel':
                options.compressionLevel = await number({ message: 'zlib compression level (0-9):', default: 6 });
                break;
            case 'adaptiveFiltering':
                options.adaptiveFiltering = await confirm({ message: 'Use adaptive row filtering?', default: false });
                break;
            case 'effort':
                options.effort = await number({ message: 'Level of CPU effort to reduce file size (1-10):', default: 7 });
                break;
            case 'palette':
                options.palette = await confirm({ message: 'Quantise to a palette-based image with alpha transparency support?', default: false });
                break;
            case 'colors':
                options.colors = await number({ message: 'Maximum number of palette entries:', default: 256 });
                break;
            case 'dither':
                options.dither = await number({ message: 'Level of Floyd-Steinberg error diffusion (0-1):', default: 1.0 });
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
