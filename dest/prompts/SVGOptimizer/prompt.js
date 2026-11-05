import { join, resolve } from "path";
import { AioFileOperation } from "../../class/FileOperation.class.js";
import { SelectSvgFilesPrompt } from "./SelectSvgFiles.prompt.js";
export async function SvgOptimizerPrompt(filepath, filename = "") {
    try {
        console.log('SvgOptimizerPrompt');
        const DIR = filepath
            ? resolve(join(process.cwd(), filepath, filename))
            : join(process.cwd());
        const operation = new AioFileOperation();
        const svgs = await operation.search(DIR, ['svg'], false);
        const selectedFiles = await SelectSvgFilesPrompt(svgs);
        const options = {};
    }
    catch (error) {
    }
}
