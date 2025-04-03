import { select } from "@inquirer/prompts";
import { dirname, join, resolve } from "path";
import { greenBright } from "yoctocolors";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { AioImageProcessor } from "../../class/ImageProcessor.class.js";
import { IMAGE_FORMATS } from "../options.js";
import { SetAdvancedImageOptionsPrompt } from "./components/AdvancedImageOptions.js";
import { SelectImageFilesPrompt } from "./components/SelectFiles.js";
import { WriteImageNamePrompt } from "./components/WriteFile.js";
export async function ImageConverterPrompt(filepath, filename) {
    try {
        const DIR = filepath
            ? resolve(join(process.cwd(), filepath, filename))
            : join(process.cwd());
        /** Flow: **/
        // 1. Run the converter
        const converter = new AioImageProcessor();
        // 2. Listing available files with allowed extensions
        const folder = await converter.search(DIR, IMAGE_FORMATS, false);
        console.log(`Found file :`, greenBright(`${folder.length} image files`));
        // console.log(`Found files:`, folder); // Debugging
        // 4. Start Converting process selected files into desired imageOutputFormat
        const fileSelected = await SelectImageFilesPrompt(folder);
        // console.log(`Selected Files:`, fileSelected); // Debugging
        if (Array.isArray(fileSelected) && fileSelected.length > 0) {
            // 5. Select Output Format
            const imageOutputFormat = await select({
                message: 'Select Image Output Format.', // TODO add `back & quit` to menu item
                choices: IMAGE_FORMATS.map((ext) => ({ name: ext, value: ext })),
            });
            //console.log(`Output Format:`, imageOutputFormat); // Debugging
            for (const filepath of fileSelected) {
                //console.log('inProcess File', filepath) // Debugging
                // 6. Set Output Options
                const options = await SetAdvancedImageOptionsPrompt(imageOutputFormat);
                // console.log("Image Options :", options);
                options.suffix = 'converted';
                // 7. Confirm output name
                const outputExt = '.' + imageOutputFormat;
                const outputName = await WriteImageNamePrompt(filepath, outputExt);
                // console.log("outputName :", outputName)
                if (outputName) {
                    // 8. Write to file with given name
                    const outputDir = dirname(filepath);
                    // console.log("outputDir :", outputDir)
                    const outputPath = join(outputDir, outputName);
                    // console.log("Prompt       => outputPath :", outputPath)
                    await converter.img(filepath).toImg(outputPath, options);
                }
            }
            const msg = greenBright(`${fileSelected.length} files successfully converted.`);
            console.log(msg);
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        await ImageConverterPrompt(filepath, filename);
    }
}
