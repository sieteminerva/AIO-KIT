import { number, Separator, expand } from "@inquirer/prompts";
import { cyanBright, gray, greenBright, italic, yellowBright } from "yoctocolors";
import { SetWatermarkOptionsPrompt } from "./SetWatermark.prompt.js";
import { SetResizeOptionsPrompt } from "./SetResizeOptions.prompt.js";
import { SetJpegOptionsPrompt } from "./SetJpegOptions.prompt.js";
import { SetPngOptionsPrompt } from "./SetPngOptions.prompt.js";
import { SetGifOptionsPrompt } from "./SetGifOptions.prompt.js";
// Mapping of image formats to their corresponding sharp options interfaces
const imageFormatOptionsMap = {
    'jpg': 'jpeg',
    'jpeg': 'jpeg',
    'png': 'png',
    'webp': 'webp',
    'gif': 'gif',
    'tiff': 'tiff',
};
var MainOption;
(function (MainOption) {
    MainOption["Proceed"] = "proceed";
    MainOption["Resize"] = "resize";
    MainOption["Watermark"] = "watermark";
    MainOption["Advanced"] = "advanced";
    MainOption["Quit"] = "quit";
    MainOption["Expand"] = "expand";
})(MainOption || (MainOption = {}));
export async function SetAdvancedImageOptionsPrompt(imageFormat) {
    let options = {};
    const sharpFormat = imageFormatOptionsMap[imageFormat];
    if (!sharpFormat) {
        console.warn(`Unsupported image format: ${imageFormat}`);
        return options;
    }
    let expanded = false;
    let expandItem = { key: 'E', name: greenBright('Expand'), value: 'expand' };
    let mainOption = '';
    const msgMenu = `Configure image options: (${yellowBright(`${italic('Press Key')}`)}).\n\n ${yellowBright(`[O]`)} ${italic('Advanced Options')} ${yellowBright(`[W]`)} ${italic('Watermark')} ${yellowBright(`[R]`)} ${italic('Resize')}\n ${yellowBright(`[E]`)} ${italic('Expand Menu')} ${yellowBright(`[Q]`)} ${italic('Quit')} ${yellowBright(`[P]`)} ${italic('Proceed')} ${gray(`Task >>`)}`;
    do {
        mainOption = await expand({
            message: msgMenu,
            default: 'r',
            expanded,
            choices: [
                new Separator(cyanBright(`---------------------------`)),
                { key: 'P', name: yellowBright('Proceed the Conversion'), value: 'proceed' },
                { key: 'R', name: yellowBright('Resize'), value: 'resize' },
                { key: 'W', name: yellowBright('Watermark'), value: 'watermark' },
                { key: 'O', name: yellowBright('Advanced Options'), value: 'advanced' },
                { key: 'Q', name: cyanBright('Quit'), value: 'quit' },
                new Separator(cyanBright(`---------------------------`)),
                expandItem,
            ],
        });
        switch (mainOption) {
            case MainOption.Expand:
                /** Expand and Collapse the menu **/
                expanded = !expanded;
                if (expanded) {
                    expandItem = { key: 'E', name: cyanBright('Collapse'), value: 'expand' };
                }
                else {
                    expandItem = { key: 'E', name: cyanBright('Expand'), value: 'expand' };
                }
                break;
            case MainOption.Resize:
                options = { ...options, ...(await SetResizeOptionsPrompt()) };
                break;
            case MainOption.Watermark:
                options = { ...options, ...(await SetWatermarkOptionsPrompt()) };
                break;
            case MainOption.Advanced:
                // Add quality option
                options.quality = await number({ message: 'Image quality (1-100):', default: 80 });
                if (sharpFormat === 'jpeg') {
                    options = { ...options, ...(await SetJpegOptionsPrompt()) };
                }
                if (sharpFormat === 'png') {
                    options = { ...options, ...(await SetPngOptionsPrompt()) };
                }
                if (sharpFormat === 'webp') {
                    options = { ...options, ...(await SetPngOptionsPrompt()) };
                }
                if (sharpFormat === 'gif') {
                    options = { ...options, ...(await SetGifOptionsPrompt()) };
                }
                break;
            case MainOption.Proceed:
                break;
            case MainOption.Quit:
                process.exit(0);
            default:
                break;
        }
        if (mainOption === MainOption.Proceed) {
            break; // Exit the main loop if the user chooses to skip
        }
    } while (mainOption !== 'P' && mainOption !== 'Q');
    return options;
}
