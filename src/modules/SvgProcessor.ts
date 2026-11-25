import type { Config, PluginConfig } from 'svgo';
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

export class SvgProcessor extends AioFileOperation {

  async process(filepath: string, options: SvgOptions = {}): Promise<void> {


    this.filepath = filepath;
    this.filename = this._getFilename(this.filepath);
    this.ext = this._getExtension(this.filepath);

    if (this.ext !== '.svg') {
      throw new Error(`Unsupported file format: ${this.ext}`);
    }

    try {

      const svgString = await this.read(this.filepath);
      const optimizedFilename = this.filename + '_optimized';
      const optimizedPath = this.filepath.replace(this.filename, 'optimized/' + optimizedFilename);

      // Pass the initial options to standard file optimization
      const optimizedSvgMarkup = await this.optimizeSvg(svgString, options);

      if (optimizedSvgMarkup) {
        await this.write(optimizedPath, optimizedSvgMarkup);
        console.log(`Successfully optimized SVG: ${optimizedPath}`);
      } else {
        console.warn(`SVG optimization failed for: ${optimizedPath}`);
      }
    } catch (error) {
      console.error(`Error processing SVG: ${this.filepath}`, error);
      throw error;
    }
  }

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
  async collect(filepath: string, options: SvgOptions = {}): Promise<string> {
    this.filepath = filepath;
    this.filename = this._getFilename(this.filepath);
    this.ext = this._getExtension(this.filepath);

    if (this.ext !== '.svg') {
      throw new Error(`Unsupported file format: ${this.ext}`);
    }

    const svgString = await this.read(filepath);
    const dataUri = await this.optimizeSvg(svgString, { ...options, preset: 'css-icon' }, true);

    return this.createCssRule(
      dataUri,
      options.cssClassPrefix ?? 'icon',
      this.dotify(this.filename),
      options.cssStyle
    );
  }

  private async optimizeSvg(svgString: string, options: SvgOptions, asDataUri = false): Promise<string> {
    const overrides: Record<string, boolean | undefined | object> = {}; // Izinkan object untuk override kompleks

    // Map regular options
    if (options.cleanupIDs !== undefined) overrides.cleanupIds = options.cleanupIDs;
    if (options.removeComments !== undefined) overrides.removeComments = options.removeComments;
    if (options.convertShapeToPath !== undefined) overrides.convertShapeToPath = options.convertShapeToPath;
    if (options.removeRasterImages !== undefined) overrides.removeRasterImages = options.removeRasterImages;
    if (options.mergePaths !== undefined) overrides.mergePaths = options.mergePaths;


    // Konfigurasi konversi warna ke currentColor
    if (options.currentColor || options.preset === 'css-icon') {
      overrides.convertColors = {
        currentColor: true, // Mengubah semua fill/stroke warna solid menjadi currentColor
      };
    }

    const plugins: PluginConfig[] = [
      {
        name: 'preset-default',
        params: {
          overrides,
        },
      },
    ];

    // Inject addAttributes jika preset-nya adalah css-icon
    if (options.preset === 'css-icon') {
      plugins.push({ name: 'removeDimensions', active: false } as any);
      plugins.push({
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [
            { width: '24' },
            { height: '24' },
            { viewBox: '0 0 24 24' }
          ],
        },
      } as PluginConfig);
    }

    // Tambahkan plugin manual jika ada
    if (options.plugins) {
      plugins.push(...options.plugins);
    }

    const config: Config = {
      path: this.filepath,
      multipass: true,
      plugins,
    };

    if (asDataUri) {
      config.datauri = 'enc';
    }

    // svgo is heavy (~770ms); load it only when an SVG is actually optimized
    const { optimize } = await import('svgo');
    return optimize(svgString, config).data;
  }

  private createCssRule(dataUri: string, classPrefix: string, iconName: string, cssStyle?: string): string {
    // FIX: Replaced formatting style to support optional inline styles cleanly
    const extraStyles = cssStyle ? `\n  ${cssStyle.replace(/;\s*$/, '')};` : '';
    const selector = `i.${classPrefix}.${iconName},\ni.${iconName}.${classPrefix}`;

    return `${selector} {\n  mask-image: url('${dataUri}');${extraStyles}\n}`;
  }

  private dotify(value: string): string {
    return value
      .trim()
      .replace(/[^\w-]+/g, '.')
      .replace(/-+/g, '.')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
}
