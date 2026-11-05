import { PluginConfig } from 'svgo';
import { AioFileOperation } from '../../../class/FileOperation.class.js';
import { ImageOptions } from '../../../class/ImageProcessor.class.js';
export interface SvgOptions extends ImageOptions {
    cleanupIDs?: boolean;
    removeComments?: boolean;
    convertShapeToPath?: boolean;
    removeRasterImages?: boolean;
    plugins?: PluginConfig[];
}
export declare class SvgProcessor extends AioFileOperation {
    process(filepath: string, options?: SvgOptions): Promise<void>;
    private optimizeSvg;
}
