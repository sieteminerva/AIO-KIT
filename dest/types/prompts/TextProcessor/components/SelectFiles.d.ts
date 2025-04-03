import { Dirent } from "node:fs";
import { AioTextProcessorMethods } from "../../../class/TextProcessor.class.js";
export declare function CreateSelectFilesPrompt(folder: Dirent[], engine: AioTextProcessorMethods): Promise<string[] | undefined>;
