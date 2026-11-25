import type { PluginConfig } from 'svgo';
import { AioFileOperation } from '../class/FileOperation.class.js';
import type { ImageOptions } from '../class/ImageProcessor.class.js';
export interface SvgOptions extends Omit<ImageOptions, 'preset'> {
    preset?: string;
    cleanupIDs?: boolean;
    removeComments?: boolean;
    convertShapeToPath?: boolean;
    removeRasterImages?: boolean;
    mergePaths?: boolean;
    cssClassPrefix?: string;
    currentColor?: string;
    cssStyle?: string;
    plugins?: PluginConfig[];
}
export declare class SvgProcessor extends AioFileOperation {
    process(filepath: string, options?: SvgOptions): Promise<void>;
    /**
     * Builds a single CSS icon rule (`mask-image` with an inlined SVG data URI)
     * for the given SVG file. Pure: nothing is written to disk.
     *
     * @param filepath - Path of the source `.svg` file.
     * @param options - SVG options; `preset` is always forced to `css-icon`.
     * @returns The generated CSS rule (selector + mask-image declaration).
     * @example
     * ```typescript
     * const rule = await new SvgProcessor().collect('./icons/home.svg', { cssStyle: 'color: currentColor;' });
     * ```
     */
    collect(filepath: string, options?: SvgOptions): Promise<string>;
    private optimizeSvg;
    private createCssRule;
    private dotify;
}
