import { number, select } from "@inquirer/prompts";
import { join, resolve } from "path";
import { greenBright } from "yoctocolors";
import { AioImageProcessor } from "../../class/ImageProcessor.class.js";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { SelectImageFilesPrompt } from "./components/SelectFiles.js";
import { SetWatermarkOptionsPrompt } from "./components/SetWatermark.prompt.js";
import { SetResizeOptionsPrompt } from "./components/SetResizeOptions.prompt.js";
export async function ImageOptimizerPrompt(filepath, filename = '') {
    try {
        let options = {};
        const DIR = filepath
            ? resolve(join(process.cwd(), filepath, filename))
            : join(process.cwd());
        const converter = new AioImageProcessor();
        const settings = converter.settings;
        // set output `Format`
        const imageOutputFormat = await select({
            message: 'Select Output Image Format:',
            choices: [
                { name: 'webp', value: 'webp' },
                { name: 'png', value: 'png' }
            ]
        });
        // set `Resize` options
        options = { ...options, ...await SetResizeOptionsPrompt() };
        // set `Watermark` options
        options = { ...options, ...await SetWatermarkOptionsPrompt() };
        // set image `Quality`
        options.quality = await number({
            message: 'Set `Image Quality` of the optimized output',
            default: 70,
        });
        // set filename `suffix`
        options.suffix = 'optimized';
        // search for images in `process.cwd()` with filtered extensions
        const imageToSearch = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.tiff'];
        const folder = await converter.search(DIR, imageToSearch, false);
        const fileSelected = await SelectImageFilesPrompt(folder);
        if (Array.isArray(fileSelected) && fileSelected.length > 0) {
            for (const filepath of fileSelected) {
                // console.log('filepath input =>', filepath);
                await converter.optimize(filepath, imageOutputFormat, options);
            }
            const msg = greenBright(`${fileSelected.length} files successfully converted.`);
            console.log(msg);
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await ImageOptimizerPrompt(filepath, filename);
    }
}
