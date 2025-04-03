import { Dirent } from "node:fs";
import { AioTextProcessorMethods } from "../../../class/TextProcessor.class.js";
export declare function SelectTextFilesPrompt(folder: Dirent[], engine: AioTextProcessorMethods): Promise<string[] | undefined>;
