import { Dirent } from "node:fs";
import { FileHandle } from "node:fs/promises";
export declare class CreateIndexFiles {
    private _targetDirectory;
    private _dtsExt;
    private _jsExt;
    private _outputName;
    private _root;
    constructor(targetDirectory: string, outputName: string);
    run(): Promise<void>;
    checkOutputFiles(dtsFileName: string, jsFileName: string): Promise<{
        dts: string;
        js: string;
    }>;
    concatenateFiles(files: Dirent[]): Promise<string[]>;
    private generateExports;
    filterFnClass(content: string[]): string[];
    format(task: string, content: string[], filePath: string): string[];
    open(filePath: string): Promise<FileHandle>;
    search(directory: string, ext: string): Promise<Dirent[]>;
    scan(filePath: string): Promise<string[]>;
    write(outputFilePath: string, content: string[]): Promise<void>;
}
/** const options = {
  directoryPath: 'src/target/',
  outputFileName: 'index',
};

const concatenator = new CreateIndexFiles(
  options.directoryPath,
  options.outputFileName,
);

concatenator.run()
  .then(() => console.log('Done!'))
  .catch((err) => console.error("Failed!", err));
 **/ 
