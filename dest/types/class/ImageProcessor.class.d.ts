import { AioFileOperation } from "./FileOperation.class.js";
import sharp from "sharp";
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
 * @extends sharp.JpegOptions, sharp.PngOptions, sharp.WebpOptions, sharp.TiffOptions, sharp.GifOptions, sharp.JxlOptions
 * @property {boolean} [resize] - Whether to resize the image.
 * @property {boolean} [watermark] - Whether to apply a watermark to the image.
 * @property {string} [watermarkPosition] - The position of the watermark on the image (e.g., 'center', 'top', 'bottom').
 * @property {boolean} [squared] - Whether to square the image (crop to a square aspect ratio).
 * @property {string} [suffix] - A suffix to add to the output filename.
 * @property {number} [maxWidth] - The maximum width for the resized image.
 * @property {boolean} [optimize] - Whether to optimize the image (e.g., reduce file size).
 * @property {number} [quality] - The quality of the output image (0-100).
 * @property {string} [compressionLevel] - The compression level of the output image (0-9).
 */
export interface ImageOptions extends sharp.JpegOptions, sharp.PngOptions, sharp.WebpOptions, sharp.TiffOptions, sharp.GifOptions, sharp.JxlOptions {
    resize?: boolean;
    watermark?: boolean;
    watermarkPosition?: string;
    squared?: boolean;
    suffix?: string;
    maxWidth?: number;
    optimize?: boolean;
}
/**
 * @type ImageFormat
 * Represents the supported image formats.
 * @property {'jpg' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif'}
 */
export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'gif';
export declare class AioImageProcessor extends AioFileOperation {
    private _settings;
    private _Sharp;
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
    constructor(filepath?: string);
    /**
     * @public
     * Gets the current settings of the image processor.
     * @returns {any} - The current settings object.
     */
    get settings(): any;
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
    set settings(value: any);
    /**
     * @public
     * Gets the current watermark settings.
     * @returns {any} - The current watermark settings object.
     */
    get watermark(): any;
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
    set watermark(value: any);
    /**
     * @public
     * Gets the current metadata settings.
     * @returns {ImageMetadata} - The current metadata settings object.
     */
    get metadata(): ImageMetadata;
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
    set metadata(value: ImageMetadata);
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
    img(filepath: string): this;
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
    toImg(pathOrFormat: string | undefined, options?: ImageOptions): Promise<AioImageProcessor | undefined>;
    /**
     * @private
     * Builds the output path for the converted image.
     * @param {string} pathOrFormat - The output path or format.
     * If only format is provided, the output will be in the same directory as the source.
     * @param {string} suffix - The suffix to add to the output filename.
     * @returns {string} - The full output path.
     * @example
     * ```typescript
     *
     *    this._buildOutputPath('/path/to/output/image.jpg', '_resized');
     *
     * ```
     */
    private _buildOutputPath;
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
    private _resizeByMaxWidth;
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
    private _setExifMetadata;
    /**
     * Sets the watermark on the image.
     * @param {sharp.Sharp} converter - The sharp instance for the image.
     * @returns {Promise<void>} - A promise that resolves when the watermark is applied.
     * @example
     * ```typescript
     *
     *    await this._setMetadata(converter);
     *
     * ```
     */
    private _setMetadata;
}
