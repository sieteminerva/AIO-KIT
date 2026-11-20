import { confirm, number } from "@inquirer/prompts";
import sharp from "sharp";
import { ImageOptions } from "../../class/ImageConverter.class.js";

// Mapping of image formats to their corresponding sharp options interfaces
const imageFormatOptionsMap: { [key: string]: keyof sharp.Sharp } = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.webp': 'webp',
  '.gif': 'gif',
  '.avif': 'avif',
  '.heif': 'heif',
  '.tiff': 'tiff',
  '.jxl': 'jxl',
  '.jp2': 'jp2',
};

export async function setImageOptionsPrompt(imageFormat: string): Promise<ImageOptions> {
  let options: ImageOptions = {};

  const resize = await confirm({
    message: 'Do you want to resize the image?',
    default: false
  });

  const watermark = await confirm({
    message: 'Do you want to use a watermark?',
    default: false
  });

  options = { watermark, resize };

  options = { watermark: true, resize: true };

  const sharpFormat = imageFormatOptionsMap[imageFormat];

  if (!sharpFormat) {
    console.error(`Unsupported image format: ${imageFormat}`);
    return options;
  }

  // Manually build the options object based on the format
  switch (sharpFormat) {
    case 'jpeg':
      options.quality = await number({ message: 'Image quality (1-100):', default: 80 });
      // options.progressive = await confirm({ message: 'Progressive (interlace)?:', default: false });
      options.progressive = false;
      break;
    case 'png':
      options.quality = await number({ message: 'Image quality (1-100):', default: 80 });
      // options.compressionLevel = await number({ message: 'Compression level (0-9):', default: 6, validate: (value) => value as number >= 0 && value as number <= 9 });
      options.compressionLevel = 6;
      break;
    case 'webp':
    case 'avif':
    case 'heif':
    case 'tiff':
    case 'jxl':
    case 'jp2':
      options.quality = await number({ message: 'Image quality (1-100):', default: 80 });
      break;
    case 'gif':
      options.quality = await number({ message: 'Image quality (1-100):', default: 80 });
      break;
    default:
      break;
  }

  return options;
}
