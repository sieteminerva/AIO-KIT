import { type PluginConfig } from 'svgo';
import { AioFileOperation } from '../class/FileOperation.class.js';
import { ImageOptions } from '../class/ImageProcessor.class.js';
export interface SvgOptions extends Omit<ImageOptions, 'preset'> {
    preset?: string;
    cleanupIDs?: boolean;
    removeComments?: boolean;
    convertShapeToPath?: boolean;
    removeRasterImages?: boolean;
    mergePaths?: boolean;
    cssOutputPath?: string;
    cssClassPrefix?: string;
    currentColor?: string;
    cssStyle?: string;
    plugins?: PluginConfig[];
}
export declare class SvgProcessor extends AioFileOperation {
    process(filepath: string, options?: SvgOptions): Promise<void>;
    private optimizeSvg;
    private writeCssPreset;
    private createCssRule;
    private dotify;
}
