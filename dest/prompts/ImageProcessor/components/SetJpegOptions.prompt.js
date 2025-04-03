import { select, Separator, number, confirm } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
/**
 * Prompts the user to set various JPEG image processing options.
 *
 * This function presents a series of interactive prompts to the user, allowing them to configure
 * different aspects of JPEG image optimization and encoding. It supports options, like:
 * - progressive,
 * - chromaSubsampling,
 * - trellisQuantization,
 * - overshootDeringing,
 * - optimizeScans,
 * - optimizeCoding,
 * - quantizationTable,
 * - mozjpeg
 *
 * The user can choose to skip options or add more until they are satisfied with their configuration.
 *
 * @returns {Promise<ImageOptions>} A promise that resolves with an object containing the selected JPEG options.
 * @throws {Error} Throws an error if the user does not select an option or if an invalid input is provided.
 *  * @example
 * ```typescript
 * const JpegOptions = await SetJpegOptionsPrompt();
 * console.log(JpegOptions);
 * // will returns:
 *     {
 *       progressive: ,
 *         chromaSubsampling: '4:2:0',
 *         trellisQuantization: false,
 *         overshootDeringing: false,
 *         optimizeScans: false,
 *         optimizeCoding: false,
 *         quantizationTable: 0 ,
 *         mozjpeg: true,
 *     }
 * ```
 */
export async function SetJpegOptionsPrompt() {
    const options = {};
    let addMore = true;
    while (addMore) {
        const choice = await select({
            message: 'Select an option to configure for JPEG',
            choices: [
                { name: 'progressive', value: 'progressive' },
                { name: 'chromaSubsampling', value: 'chromaSubsampling' },
                { name: 'trellisQuantisation', value: 'trellisQuantisation' },
                { name: 'overshootDeringing', value: 'overshootDeringing' },
                { name: 'optimizeScans', value: 'optimizeScans' },
                { name: 'optimizeCoding', value: 'optimizeCoding' },
                { name: 'quantizationTable', value: 'quantizationTable' },
                { name: 'mozjpeg', value: 'mozjpeg' },
                new Separator(),
                { name: yellowBright('Skip >>'), value: 'skip' },
            ],
        });
        if (choice === null || choice === undefined) {
            throw new Error('No option selected');
        }
        switch (choice) {
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
                if (options.chromaSubsampling === null || options.chromaSubsampling === undefined) {
                    throw new Error('No chroma subsampling selected');
                }
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
                if (isNaN(options.quantizationTable)) {
                    throw new Error('Quantization table must be a number');
                }
                break;
            case 'mozjpeg':
                options.mozjpeg = await confirm({ message: 'Use mozjpeg defaults?', default: false });
                break;
            case 'skip':
                addMore = false;
                break;
            default:
                throw new Error(`Unknown option: ${choice}`);
        }
        if (choice !== 'skip') {
            addMore = await confirm({ message: 'Do you want to add more options?', default: false });
        }
    }
    return options;
}
