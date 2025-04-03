import { select, Separator, number, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
export async function SetJpegOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const option = await select({
            message: 'Select an option to configure for JPEG',
            choices: [
                { name: 'progressive', value: 'progressive' },
                { name: 'chromaSubsampling', value: 'chromaSubsampling' },
                { name: 'trellisQuantisation', value: 'trellisQuantisation' },
                { name: 'overshootDeringing', value: 'overshootDeringing' },
                { name: 'optimizeScans', value: 'optimizeScans' },
                { name: 'optimizeCoding', value: 'optimizeCoding' },
                { name: 'quantisationTable', value: 'quantisationTable' },
                { name: 'mozjpeg', value: 'mozjpeg' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        switch (option) {
            case 'progressive':
                options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
                break;
            case 'chromaSubsampling':
                options.chromaSubsampling = await select({
                    message: 'Chroma subsampling:',
                    choices: [
                        { name: '4:4:4', value: '4:4:4' },
                        { name: '4:2:0', value: '4:2:0' },
                    ],
                    default: '4:2:0'
                });
                break;
            case 'trellisQuantisation':
                options.trellisQuantisation = await confirm({ message: 'Apply trellis quantisation?', default: false });
                break;
            case 'overshootDeringing':
                options.overshootDeringing = await confirm({ message: 'Apply overshoot deringing?', default: false });
                break;
            case 'optimizeCoding':
                options.optimizeCoding = await confirm({ message: 'Optimise Huffman coding tables?', default: true });
                break;
            case 'quantizationTable':
                options.quantizationTable = await number({ message: 'Quantization table to use (0-8):', default: 0 });
                break;
            case 'mozjpeg':
                options.mozjpeg = await confirm({ message: 'Use mozjpeg defaults?', default: false });
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
