import { existsSync } from "node:fs";
import { readdir, open, writeFile, rm } from "node:fs/promises";
import { join, resolve } from 'node:path';
export class CreateIndexFiles {
    constructor(targetDirectory, outputName) {
        this._root = resolve('./'); // Calculate project root
        this._targetDirectory = resolve(this._root, targetDirectory);
        this._outputName = outputName;
        this._dtsExt = '.d.ts';
        this._jsExt = '.js';
    }
    async run() {
        console.log('root', this._root);
        const dts = this._outputName + this._dtsExt;
        const js = this._outputName + this._jsExt;
        const outputFiles = await this.checkOutputFiles(dts, js);
        const files = await this.search(this._targetDirectory, this._dtsExt);
        /** if nothing is found stop the process **/
        if (files.length === 0) {
            console.warn(`No ${this._dtsExt} files found in ${this._targetDirectory}`);
            return;
        }
        /** Concatenate all d.ts files **/
        const docs = await this.concatenateFiles(files);
        console.log(`[Writing new]: '${dts}'`);
        await this.write(outputFiles['dts'], docs);
        /** Generate index.js with export statement from d.ts files **/
        const exports = this.generateExports(docs, outputFiles['dts']);
        console.log(`[Writing new]: '${js}'`);
        await this.write(outputFiles['js'], exports);
    }
    async checkOutputFiles(dtsFileName, jsFileName) {
        const dts = join(this._root, dtsFileName);
        const js = join(this._root, jsFileName);
        if (existsSync(dts)) {
            console.log(`[Remove existing]: '${dtsFileName}'`);
            await rm(dts); // remove existing index.d.ts file
        }
        if (existsSync(js)) {
            console.log(`[Remove existing]: '${jsFileName}'`);
            await rm(js); // remove existing index.js file
        }
        return { dts, js };
    }
    async concatenateFiles(files) {
        const docs = [];
        for (const file of files) {
            const filePath = join(file.parentPath, file.name);
            // console.log(`[The Correct Path]: ${filePath}`);
            // scan all dts files from targetDirectory
            const fileContent = await this.scan(filePath);
            // console.log('file content:', fileContent);
            const formattedContent = this.format('dts', fileContent, filePath);
            // console.log('formatted content:', formattedContent);
            docs.push(...formattedContent);
        }
        return docs;
    }
    generateExports(docs, outputDtsPath) {
        // scan fn and class from combined 'dts' output content, then remove duplicated export
        const exportContent = this.filterFnClass(docs);
        // set filePath from generated output dts path
        const formattedExport = this.format('js', exportContent, outputDtsPath);
        return formattedExport;
    }
    filterFnClass(content) {
        const filteredContent = [];
        const pattern = /(?:function|class)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|class\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends|implements|\{)/;
        // const pattern2: RegExp = /(?:function|class|interface)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(|class\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends|implements|\{)|interface\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?:extends|\{)/;
        for (const line of content) {
            if (line) {
                const fnClassMatch = line.match(pattern);
                if (fnClassMatch) {
                    // console.log('Match :', fnClassMatch);
                    // const matchedName2 = fnClassMatch[1] || fnClassMatch[2] || fnClassMatch[3];
                    const matchedName = fnClassMatch[1] || fnClassMatch[2]; // Get the captured name from either group 1 or 2
                    if (matchedName) {
                        // const exportStatement = `export { ${matchedName} } from "index.d.ts";`;
                        // console.log('match', matchedName);
                        filteredContent.push(matchedName);
                    }
                }
            }
        }
        return filteredContent.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }
    format(task, content, filePath) {
        const formattedContent = [];
        if (content.length > 0) {
            formattedContent.push(`// Content from: ${filePath}`);
            switch (task) {
                case 'js':
                    const exportStatement = `export { ${content.join(', ')} } from "./${this._outputName}";`;
                    formattedContent.push(exportStatement);
                    break;
                default:
                    formattedContent.push(...content);
                    break;
            }
            formattedContent.push('\n');
        }
        return formattedContent;
    }
    async open(filePath) {
        return await open(filePath);
    }
    async search(directory, ext) {
        const files = await readdir(directory, { withFileTypes: true, recursive: true, encoding: 'utf-8' });
        /** Filtering the found object and identify it. if it is a file and have the given extension **/
        const targetedFiles = files.filter((file) => {
            return file.isFile() && file.name.endsWith(ext);
        });
        return targetedFiles;
    }
    async scan(filePath) {
        const content = [];
        const fileContent = await this.open(filePath);
        const docs = fileContent.readLines({ encoding: 'utf-8' });
        for await (const line of docs) {
            content.push(line);
        }
        return content;
    }
    async write(outputFilePath, content) {
        await writeFile(outputFilePath, content.join('\n'), 'utf-8');
    }
}
// Example usage:
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
