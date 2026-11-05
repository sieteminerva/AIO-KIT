import { optimize } from 'svgo';
import { readFile, writeFile } from 'fs/promises';
import { AioFileOperation } from '../../../class/FileOperation.class.js';
export class SvgProcessor extends AioFileOperation {
    async process(filepath, options = {}) {
        this.filepath = filepath;
        this.filename = this._getFilename(this.filepath);
        this.ext = this._getExtension(this.filepath);
        if (this.ext !== '.svg') {
            throw new Error(`Unsupported file format: ${this.ext}`);
        }
        try {
            const svgString = await readFile(this.filepath, 'utf8');
            const optimizedFilename = this.filename + '_optimized';
            const optimizedPath = this.filepath.replace(this.filename, optimizedFilename);
            const optimizedSvg = await this.optimizeSvg(svgString, options);
            if (optimizedSvg) {
                await writeFile(optimizedPath, optimizedSvg.data, 'utf8');
                console.log(`Successfully optimized SVG: ${optimizedPath}`);
            }
            else {
                console.warn(`SVG optimization failed for: ${optimizedPath}`);
            }
        }
        catch (error) {
            console.error(`Error processing SVG: ${this.filepath}`, error);
            throw error;
        }
    }
    async optimizeSvg(svgString, options) {
        const plugins = [];
        if (options.cleanupIDs) {
            plugins.push('cleanupIds');
        }
        if (options.removeComments) {
            plugins.push('removeComments');
        }
        if (options.convertShapeToPath) {
            plugins.push('convertShapeToPath');
        }
        if (options.removeRasterImages) {
            plugins.push('removeRasterImages');
        }
        if (options.plugins) {
            plugins.push(...options.plugins);
        }
        const result = optimize(svgString, {
            path: this.filepath,
            multipass: true,
            js2svg: {
                indent: 2,
                pretty: true,
            },
            plugins: (plugins.length > 0 ? plugins : ['preset-default']),
        });
        return result;
    }
}
