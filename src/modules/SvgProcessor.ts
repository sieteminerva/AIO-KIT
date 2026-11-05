import { optimize, type Config, type PluginConfig } from 'svgo';
import { resolve } from 'path';
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
      const optimizedSvgMarkup = this.optimizeSvg(svgString, options);

      if (optimizedSvgMarkup) {
        await this.write(optimizedPath, optimizedSvgMarkup);
        console.log(`Successfully optimized SVG: ${optimizedPath}`);

        if (options.preset === 'css-icon') {
          // FIX: Pass asDataUri = true, but also modify or adapt options for the custom preset rules
          const cssSvgDataUri = this.optimizeSvg(svgString, options, true);
          await this.writeCssPreset(cssSvgDataUri, options);
        }
      } else {
        console.warn(`SVG optimization failed for: ${optimizedPath}`);
      }
    } catch (error) {
      console.error(`Error processing SVG: ${this.filepath}`, error);
      throw error;
    }
  }

  private optimizeSvg(svgString: string, options: SvgOptions, asDataUri = false): string {
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

    return optimize(svgString, config).data;
  }

  private async writeCssPreset(dataUri: string, options: SvgOptions): Promise<void> {
    const cssOutputPath = options.cssOutputPath ?? resolve(process.cwd(), 'aio-icon.css');
    const classPrefix = options.cssClassPrefix ?? 'icon';
    const iconName = this.dotify(this.filename);
    const cssRule = this.createCssRule(dataUri, classPrefix, iconName, options.cssStyle);
    const existingContent = await this.read(cssOutputPath).catch(() => '');
    const nextContent = existingContent ? `${existingContent}\n\n${cssRule}` : cssRule;

    await this.write(cssOutputPath, nextContent);
    console.log(`Successfully generated CSS icon preset: ${cssOutputPath}`);
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
