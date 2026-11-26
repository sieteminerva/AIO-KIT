
import { dirname, extname, join, resolve } from "path";
import { existsSync } from "node:fs";
import { AioFileOperation } from "./FileOperation.class.js";
import sharp, {
  type FormatEnum,
  type GifOptions,
  type JpegOptions,
  type JxlOptions,
  type OverlayOptions,
  type PngOptions,
  type ResizeOptions,
  type Sharp,
  type TiffOptions,
  type WebpOptions,
} from "sharp";
import { fileURLToPath } from "url";

/**
 * @interface ImageMetadata
 * Represents the metadata for an image, including description, origin, author, copyright, and keywords.
 * @property {string} [description] - A brief description of the image.
 * @property {string} [origin] - The origin or source of the image.
 * @property {string} [author] - The author of the image.
 * @property {string} [copyright] - The copyright information for the image.
 * @property {string[]} [keywords] - An array of keywords associated with the image.
 */
export interface ImageMetadata {
  description?: string;
  origin?: string;
  author?: string;
  copyright?: string;
  keywords?: string[];
}


/**
 * @interface ImageOptions
 * Represents the options for image processing, including format-specific options, resizing, watermark, and more.
 * @extends JpegOptions, PngOptions, WebpOptions, TiffOptions, GifOptions, JxlOptions
 * @property {boolean} [resize] - Whether to resize the image.
 * @property {boolean} [watermark] - Whether to apply a watermark to the image.
 * @property {string} [watermarkPosition] - The position of the watermark on the image (e.g., 'center', 'top', 'bottom').
 * @property {boolean} [squared] - Whether to square the image (crop to a square aspect ratio).
 * @property {string} [suffix] - A suffix to add to the output filename.
 * @property {number} [maxWidth] - The maximum width for the resized image.
 * @property {boolean} [optimize] - Whether to optimize the image (e.g., reduce file size).
 * @property {number} [quality] - The quality of the output image (0-100).
 * @property {string} [compressionLevel] - The compression level of the output image (0-9).
 * @property {number} [density] - Render density (DPI) for vector sources such as SVG. Defaults to 96.
 * @property {string} [background] - Background color used to flatten transparency for formats without an alpha channel (e.g. JPEG). Defaults to `#ffffff`.
 */
export interface ImageOptions extends JpegOptions, PngOptions, WebpOptions,
  TiffOptions, GifOptions,
  JxlOptions {
  resize?: boolean;
  watermark?: boolean;
  watermarkPosition?: string;
  squared?: boolean;
  suffix?: string;
  maxWidth?: number;
  optimize?: boolean;
  density?: number;
  background?: string;
}

/**
 * @interface StitchOptions
 * Options for stitching multiple images into one animated GIF.
 * Extends {@link GifOptions}, so every GIF encoder setting (`colors`, `effort`,
 * `dither`, `delay`, `loop`, ...) produced by `SetGifOptionsPrompt` is forwarded.
 * @property {string} [background] - Background color used to normalize frames with transparency. Defaults to `#ffffff`.
 * @property {number} [width] - Resize every frame to this width (contain, keeps aspect ratio).
 * @property {boolean} [watermark] - Stamp the watermark on every frame.
 * @property {string} [watermarkPosition] - Gravity of the watermark (e.g. `center`, `southeast`).
 */
export interface StitchOptions extends GifOptions {
  background?: string;
  width?: number;
  watermark?: boolean;
  watermarkPosition?: string;
}

/**
 * @type ImageFormat
 * Represents the supported image formats.
 * @property {'jpg' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif'}
 */
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif';

/** Formats that a vector source such as SVG can be rasterized into. */
const RASTER_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'tiff', 'gif'] as const;


/**
* ## AioImageProcessor
*
* The `AioImageProcessor` class is a powerful tool for manipulating and processing images. It allows you to resize, convert, add watermarks, and set metadata for images. This class extends `AioFileOperation`, providing a robust foundation for file-related operations.
* 
* ### Features
* 
* -   **Image Conversion**: Convert images between various formats (JPEG, PNG, WebP, TIFF, GIF).
* -   **Resizing**: Resize images while maintaining aspect ratio or crop to a square.
* -   **Watermarking**: Add watermarks to images with customizable position and opacity.
* -   **Metadata**: Set EXIF metadata such as description, author, copyright, and keywords.
* -   **Optimization**: Optimize images for web use by reducing file size.
* -   **Customizable Settings**: Configure default settings for resizing, watermarking, and metadata.
* -   **Error Handling**: Robust error handling for unsupported formats and missing source files.
* 
* ### Installation
* 
* ```bash
* 
*    npm install sharp
* 
* ```
* 
* ### Usage
* 
* #### Basic Usage
* 
* ```typescript
* 
*    import { AioImageProcessor } from './path/to/AioImageProcessor';
*    
*    async function processImage() {
*      const imageProcessor = new AioImageProcessor();
*      await imageProcessor
*        .img('/path/to/your/image.jpg')
*        .toImg('/path/to/output/image.png', { resize: true, maxWidth: 800, watermark: true });
*    }
*    
*    processImage().catch(console.error);
* 
* ```
* 
* #### Setting Custom Settings
* 
* ```typescript
* 
*    import { AioImageProcessor } from './path/to/AioImageProcessor';
*    
*    async function processImage() {
*      const imageProcessor = new AioImageProcessor();
*      imageProcessor.settings = {
*        maxWidth: 600,
*        metadata: {
*          description: 'Custom description',
*          author: 'Custom Author',
*        },
*        watermark: {
*          opacity: 0.7,
*          position: 'bottom',
*        },
*      };
*      await imageProcessor
*        .img('/path/to/your/image.jpg')
*        .toImg('webp', { resize: true, watermark: true });
*    }
*    
*    processImage().catch(console.error);
* 
* ```
* 
* #### Setting Metadata
* 
* ```typescript
* 
*    import { AioImageProcessor } from './path/to/AioImageProcessor';
*    
*    async function processImage() {
*      const imageProcessor = new AioImageProcessor();
*      imageProcessor.metadata = {
*        description: 'New description',
*        author: 'New Author',
*        copyright: '© 2024 New Author',
*        keywords: ['new', 'image', 'metadata'],
*      };
*      await imageProcessor
*        .img('/path/to/your/image.jpg')
*        .toImg('/path/to/output/image.jpg', { resize: true, maxWidth: 800 });
*    }
*    
*    processImage().catch(console.error);
* 
* ```
* 
* #### Setting Watermark
* 
* ```typescript
* 
*    import { AioImageProcessor } from './path/to/AioImageProcessor';
*    
*    async function processImage() {
*      const imageProcessor = new AioImageProcessor();
*      imageProcessor.watermark = {
*        path: '/path/to/new/watermark.png',
*        opacity: 0.8,
*      };
*      await imageProcessor
*        .img('/path/to/your/image.jpg')
*        .toImg('/path/to/output/image.jpg', { resize: true, maxWidth: 800, watermark: true });
*    }
*    
*    processImage().catch(console.error);
* 
* ```
* 
*/
export class AioImageProcessor extends AioFileOperation {

  private _settings: any;

  private _Sharp = sharp;

  /**
   * Creates an instance of AioImageProcessor.
   * Initializes the image processor with default settings and resolves the template directory path.
   * @param {string} [filepath] - Optional. The initial filepath for the image to be processed.
   * @example
   * ```typescript
   * 
   *    const imageProcessor = new AioImageProcessor();
   *    const imageProcessor = new AioImageProcessor('/path/to/your/image.jpg');
   * 
   * ```
   */
  constructor(filepath?: string) {

    const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
    const __dirname = dirname(__filename); // get the name of the directory
    // Resolve the path to the templates directory
    const TEMPLATE_DIR = resolve(__dirname, '..', 'lib', 'templates', 'assets');

    super(filepath);

    // default settings
    this._settings = {
      maxWidth: 1200,
      maxHeight: 1200,
      density: 96, // render density (DPI) for vector sources such as SVG
      metadata: {
        description: 'This image generated using AIO-KIT | Image Processor',
        origin: 'Planet Earth before midnight.',
        author: 'YMGH',
        copyright: 'ymgh@AIO-KIT | Image Processor',
        keywords: "love, just, around us, see me, in your dreams"
      },
      options: {} as ImageOptions,
      watermark: {
        path: TEMPLATE_DIR + '/aio_watermark.png', // Default watermark path
        opacity: 0.3, // Default opacity
        position: 'center', // Default position
        margin: 20, // Default margin
      }
    };
  }

  /**
   * @public
   * Gets the current settings of the image processor.
   * @returns {any} - The current settings object.
   */
  public get settings(): any {
    return this._settings;
  }

  /** 
   * @public
   * Sets the settings for the image processor.
   * Merges the provided settings with the existing settings.
   * @param {any} value - The new settings to apply.
   * @example 
   * ```typescript
   * 
   *    imageProcessor.settings = { maxWidth: 800, watermark: { opacity: 0.5 } };
   * 
   * ```
   */
  public set settings(value: any) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        this._settings[key] = value[key];
      }
    }
  }

  /**
   * @public
   * Gets the current watermark settings.
   * @returns {any} - The current watermark settings object.
   */
  public get watermark(): any {
    return this.settings.watermark;
  }


  /**
   * @public
   * Sets the watermark settings for the image processor.
   * Merges the provided watermark settings with the existing watermark settings.
   * @param {any} value - The new watermark settings to apply.
   * @example
   * ```typescript
   *
   *    imageProcessor.watermark = { path: '/path/to/new/watermark.png', opacity: 0.8 };
   * 
   * ```
   */
  public set watermark(value: any) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        this._settings.watermark[key] = value[key];
      }
    }
  }

  /**
   * @public
   * Gets the current metadata settings.
   * @returns {ImageMetadata} - The current metadata settings object.
   */
  public get metadata(): ImageMetadata {
    return this.settings.metadata;
  }

  /**
   * Sets the metadata for the image processor.
   * Merges the provided metadata with the existing metadata.
   * @param {ImageMetadata} value - The new metadata to apply.
   * @example
   * ```typescript
   *
   *    imageProcessor.metadata = { description: 'New description', author: 'New Author' };
   *
   * ```
   */
  public set metadata(value: ImageMetadata) {
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        this._settings.metadata[key] = value[key as keyof ImageMetadata];
      }
    }
  }

  /**
   * @public
   * Sets the source image file for processing.
   * This method initializes the image processing pipeline by setting the source file path and validating its format.
   * @param {string} filepath - The path to the source image file.
   * @returns {this} - Returns the current instance of AioImageProcessor for method chaining.
   * @throws {Error} - Throws an error if the provided file format is not supported.
   * @example 
   * ```typescript
   * 
   *    imageProcessor.img('/path/to/your/image.jpg');
   * 
   * ```
   */
  img(filepath: string): this {
    // console.log('from img()');

    // source path
    this.filepath = filepath
    // source extension
    this.ext = this._getExtension(this.filepath);
    // console.log(`this.ext: ${this.ext}`);

    if (!['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.gif', '.svg'].includes(this.ext)) {
      throw new Error(`Unsupported image format: ${this.ext}`);
    }

    return this;
  }

  /**
   * Stitches several images into one animated GIF.
   *
   * Frames are normalized to the size of the **first** file (`contain`, keeps aspect
   * ratio, transparency flattened onto `background`) because every GIF frame must
   * share identical dimensions.
   *
   * @param {string[]} files - Source images, in playback order.
   * @param {string} outputPath - Destination `.gif` path.
   * @param {StitchOptions} [options] - Delay / loop / background / width.
   * @returns {Promise<string>} The written output path.
   * @throws {Error} When no files are provided.
   *
   * @example
   * ```typescript
   *
   *    await imageProcessor.gif(['01.png', '02.png'], './out.gif', { delay: 500, loop: 0 });
   *
   * ```
   */
  async gif(files: string[], outputPath: string, options: StitchOptions = {}): Promise<string> {
    if (!files || files.length === 0) {
      throw new Error('No frames provided for the animated GIF.');
    }

    const { delay = 200, loop = 0, background = '#ffffff', width, watermark, watermarkPosition, ...gifOptions } = options;

    const base = await this._Sharp(files[0]).metadata();
    if (!base.width || !base.height) {
      throw new Error(`Cannot read the size of the first frame: ${files[0]}`);
    }

    // every frame must share the same canvas, otherwise frames get misaligned
    const canvas = {
      width: width ?? base.width,
      height: width
        ? Math.round((base.height / base.width) * width)
        : base.height,
    };

    const frames = await Promise.all(
      files.map(async (file) => {
        let frame = this._Sharp(file)
          .resize({ ...canvas, fit: 'contain', background })
          .flatten({ background });

        if (watermark) {
          frame = await this._watermark(frame, watermarkPosition);
        }

        return frame.toBuffer();
      })
    );

    // a single number only reaches frame #1, so broadcast it to every frame
    const frameDelay = Array.isArray(delay) ? delay : Array(frames.length).fill(delay);

    await this._Sharp(frames as any, { join: { animated: true } })
      .gif({ effort: 7, ...gifOptions, delay: frameDelay, loop })
      .toFile(outputPath);

    return outputPath;
  }

  /**
   * @public
   *
   * Converts the image to the specified format and applies various options.
   * @param {string | undefined} pathOrFormat - The output path or the desired format (e.g., 'jpg', 'png'). If only format is provided, the output will be in the same directory as the source.
   * @param {ImageOptions} options - Options for image processing, including format-specific options, resizing, watermark, etc.
   * @returns {Promise<AioImageProcessor | undefined>} - A promise that resolves to the AioImageProcessor instance or undefined if an error occurs.
   * @throws {Error} - Throws an error if the source image path is not set or if the output format is the same as the input format without optimization.
   * 
   * @example 
   * ```typescript
   * 
   *    await imageProcessor.toImg('/path/to/output/image.jpg', { resize: true, maxWidth: 800, watermark: true });
   * 
   * ```
   * @example 
   * ```typescript
   * 
   *    await imageProcessor.toImg('png', { resize: true, maxWidth: 800, watermark: true });
   * 
   * ```
   */
  async toImg(pathOrFormat: string | undefined, options: ImageOptions = {}): Promise<AioImageProcessor | undefined> {
    // check if source path is provided
    if (!this.filepath) {
      throw new Error("Source image path not set. Use .img() to set the source file.");
    }
    if (!pathOrFormat) {
      throw new Error("Output path or target format is required.");
    }

    const isVector = this.ext === '.svg';

    if (isVector && options.optimize) {
      console.warn("`optimize` is ignored for SVG sources; an explicit raster target is required.");
    }

    // Resolve the output format: an explicit extension wins, otherwise the argument is a format token
    let format = (isVector || !options.optimize)
      ? extname(pathOrFormat).slice(1) || pathOrFormat.toLowerCase()
      : pathOrFormat;

    if (isVector && !(RASTER_FORMATS as readonly string[]).includes(format)) {
      throw new Error(`Cannot convert SVG to "${format}". Supported targets: ${RASTER_FORMATS.join(', ')}.`);
    }

    if (`.${format}` === this.ext && !options.optimize && !isVector) {
      console.warn("Output file Extension should be in different format,\nyour first format selections file extension will be used.");
    }
    // console.log('=> format: ', format);

    /** param is `this.filepath` which is source file as the input, we put it in the top line so that it not get accidentaly swapped with the output file **/
    // Vector sources are rasterized at the given density (DPI), default 96
    let converter = isVector
      ? this._Sharp(this.filepath, { density: options.density ?? this.settings.density ?? 96 })
      : this._Sharp(this.filepath);

    /** building output path with custom or default naming **/
    this.outputPath = await this._buildOutputPath(pathOrFormat, options.suffix);


    if (format === 'jpg') { format = 'jpeg'; }
    // Set Optimization Options

    converter = converter.toFormat(format as keyof FormatEnum, options as ImageOptions);

    const metaSize = await converter.metadata();
    //console.log('metaSize: ', metaSize);
    // Resize the image
    if (options.resize) {
      // calculate resize
      const maxWidth = options.maxWidth ? options.maxWidth : this.settings.maxWidth;
      // SVG sources may only expose a viewBox, so width/height can be missing
      const hasSize = Boolean(metaSize.width && metaSize.height);
      const size = hasSize
        ? this._resizeByMaxWidth(maxWidth, { width: metaSize.width as number, height: metaSize.height as number })
        : { width: maxWidth, height: maxWidth };
      let resizeOptions: ResizeOptions;
      if (options.squared) {
        /** 
         * @remark Squared Options
         * [withoutEnlargement: true], Do not scale up if the width or height are already less than the target dimensions
         * [fit: 'inside'], to  Preserving aspect ratio, resize the image to be as large as possible 
         * while ensuring its dimensions are less than or equal to both those specified.
         */
        resizeOptions = { width: size.width, height: size.width, fit: 'cover', position: sharp.strategy.attention }

      } else {
        /** 
         * @remark Squared Options
         * [width = height], to squared the result
         * [position = sharp.strategy.attention], to focus on the region with the highest luminance frequency, 
         * colour saturation and presence of skin tones.
         * [fit = `fill`], to Ignore the aspect ratio of the input and stretch to both provided dimensions
         */
        resizeOptions = { fit: 'inside', withoutEnlargement: true }
      }
      // create image after resize
      converter = hasSize
        ? converter.resize(size.width, size.height, resizeOptions)
        : converter.resize({ width: size.width, ...resizeOptions });
    }

    // Formats without an alpha channel need the transparency flattened onto a background
    if (format === 'jpeg') {
      converter = converter.flatten({ background: options.background ?? '#ffffff' });
    }

    // text metadata
    if (this.metadata) {
      const exifData: any = this._setExifMetadata(this.metadata ? this.metadata : this.settings.metadata);
      converter.withExif(exifData ? exifData : undefined);
      converter.withMetadata({ comments: ['Created by AIO-KIT© Image Processor'] } as any)
    }

    // Add Watermark
    if (options.watermark) {
      converter = await this._watermark(converter, options.watermarkPosition ?? this.settings.watermark.position);
    }

    // output path should be final path the result with the desired extension
    const result = await converter.toFile(this.outputPath);

    // console.log('converted result :', result);
    // console.log(`Image converted to ${format.toUpperCase()}: ${outputPath}`);
    this.filepath = '';
    return this;
  }

  /**
   * @private
   * Builds the output path for the converted image.
   * @param {string} pathOrFormat - The output path or format.
   * If only format is provided, the output will be in the same directory as the source.
   * @param {string} [suffix] - The suffix to add to the output filename. Omitted when empty.
   * @returns {string} - The full output path.
   * @example 
   * ```typescript
   * 
   *    this._buildOutputPath('/path/to/output/image.jpg', '_resized');
   * 
   * ```
   */
  private async _buildOutputPath(pathOrFormat: string, suffix?: string) {
    let basepath: string;
    let ext: string;
    let outputFilename: string;
    // check if outputpath is constructed by path + filename + suffix + format
    // if only the format is provided, use `this.filepath` as basepath, add suffix and format
    if (extname(pathOrFormat as string) === '') {
      ext = '.' + pathOrFormat;
      basepath = resolve(dirname(this.filepath as string));
      outputFilename = `${this._getFilename(this.filepath as string)}${suffix ? `_${suffix}` : ''}${ext}`;
    } else {
      ext = this._getExtension(pathOrFormat as string);
      basepath = resolve(dirname(pathOrFormat as string));
      outputFilename = this._getFilename(pathOrFormat) + ext;
    }
    // create directory based on basepath if it not exists
    await this.isDirectoryExists(basepath);

    const outputPath = join(basepath, outputFilename);


    return outputPath;
  }

  /**
   * Resizes the image based on the maximum width, maintaining aspect ratio.
   * @param {number} maxWidth - The maximum width for the resized image.
   * @param {{ width: number; height: number }} metadataSize - The metadata containing the original width and height.
   * @returns {{ width: number; height: number }} - The new width and height of the image.
   * @example 
   * ```typescript
   * 
   *    this._resizeByMaxWidth(800, { width: 1200, height: 800 });
   * 
   * ```
   * @example 
   * ```typescript
   * 
   *    this._resizeByMaxWidth(800, { width: 600, height: 400 });
   * 
   * ```
   */
  private _resizeByMaxWidth(maxWidth: number, metadataSize: { width: number; height: number }) {
    const aspectRatio = metadataSize.width / metadataSize.height;
    const maxHeight = maxWidth / aspectRatio;

    if (metadataSize.width <= maxWidth && metadataSize.height <= maxHeight) {
      console.warn(
        `Image is already smaller than the our standard maximum width (${maxWidth}px). No resizing needed.`);
      return { width: metadataSize.width, height: metadataSize.height }; // No resizing needed
    }

    let newWidth = maxWidth;
    let newHeight = Math.round(maxWidth / aspectRatio);

    return { width: newWidth, height: newHeight };
  }

  /**
   * Sets the EXIF metadata for an image.
   * This function takes image metadata and formats it into an EXIF-compatible structure. It supports setting fields like ImageDescription, Artist, Copyright, and more.
   * @param {ImageMetadata} metadata - The metadata to set, including description, author, copyright, origin, and keywords.
   * @returns {Object | undefined} - The EXIF data object or undefined if no metadata is provided.
   * @example 
   * ```typescript
   * 
   *    this._setExifMetadata({ description: 'My Image', author: 'John Doe', copyright: '© 2023 John Doe' });
   * 
   * ```
   * @example 
   * ```typescript
   * 
   *  this._setExifMetadata(undefined);
   * 
   * ```
   */
  private _setExifMetadata(metadata: ImageMetadata) {
    if (!metadata) return;
    const { description, author, copyright, origin, keywords } = metadata;
    const exifData: any = { IFD0: {} };
    if (description) {
      exifData["IFD0"]["ImageDescription"] = description;
    }
    if (author) {
      exifData["IFD0"]["Artist"] = author;
      exifData["IFD0"]["XPAuthor"] = author;
      exifData["IFD0"]["ProcessingSoftware"] = 'AIO-KIT | Image Processor';
      exifData["IFD0"]["Software"] = 'AIO-KIT | Image Processor';
    }
    if (copyright) {
      exifData["IFD0"]["Copyright"] = copyright;
    }
    if (origin && keywords) {
      exifData["IFD0"]["XPTitle"] = origin;
      exifData["IFD0"]["XPKeywords"] = keywords;
    }

    return exifData;
  }

  /**
   * Stamps the configured watermark onto a sharp pipeline.
   *
   * Returns the **new** pipeline: sharp chaining is immutable, so reassigning the
   * local argument (the previous behaviour) dropped the composite entirely.
   *
   * @param {Sharp} converter - The sharp instance of the image (or of one animation frame).
   * @param {string} [position] - Gravity of the watermark; defaults to the configured settings.
   * @returns {Promise<Sharp>} - The pipeline with the watermark appended.
   * @example
   * ```typescript
   *
   *    converter = await this._watermark(converter, 'southeast');
   *
   * ```
   */
  private async _watermark(converter: Sharp, position?: string): Promise<Sharp> {
    const watermarkSettings = {
      path: this.settings.watermark.path,
      opacity: this.settings.watermark.opacity, // Default opacity
      position: this.settings.watermark.position,
      margin: this.settings.watermark.margin,
      ...this.settings.watermark, // Override with provided settings
      ...(position ? { position } : {}),
    };

    if (!watermarkSettings.path || !existsSync(watermarkSettings.path)) {
      console.warn(`Watermark skipped: file not found at ${watermarkSettings.path}`);
      return converter;
    }

    const watermark = this._Sharp(watermarkSettings.path);
    const watermarkMeta = await watermark.metadata();

    // resize dimensions must be integers
    const width = Math.max(1, Math.round((watermarkMeta.width as number) / 5));
    const height = Math.max(1, Math.round((watermarkMeta.height as number) / 5));

    const watermarkImg = await watermark
      .resize(width, height) // resizing the watermark image
      .ensureAlpha(watermarkSettings.opacity)
      .toBuffer();

    return converter.composite([
      { input: watermarkImg, blend: 'over', gravity: watermarkSettings.position },
    ] as OverlayOptions[]);
  }

}
