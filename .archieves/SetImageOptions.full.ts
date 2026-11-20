import { confirm, input, number, select, Separator } from "@inquirer/prompts";
import sharp from "sharp";
import { ImageOptions } from "../../class/ImageConverter.class.js";

// Mapping of image formats to their corresponding sharp options interfaces
const imageFormatOptionsMap: { [key: string]: keyof sharp.Sharp } = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.webp': 'webp',
  '.gif': 'gif',
  '.tiff': 'tiff',
};

export async function setImageOptionsPrompt(imageFormat: string): Promise<ImageOptions> {
  const options: Partial<ImageOptions> = {};
  const sharpFormat = imageFormatOptionsMap[imageFormat];

  if (!sharpFormat) {
    console.warn(`Unsupported image format: ${imageFormat}`);
    return options as ImageOptions;
  }

  // Add resize and watermark options
  options.resize = await confirm({ message: 'Do you want to resize the image?', default: false });
  options.watermark = await confirm({ message: 'Do you want to add a watermark?', default: false });

  // Add quality option
  options.quality = await number({ message: 'Image quality (1-100):', default: 80 });

  // Iterate through the properties of the interface
  if (sharpFormat === 'jpeg') {
    let addMore = true;
    while (addMore) {
      const option = await select({
        message: 'Select an option to configure for JPEG',
        choices: [
          { name: 'progressive', value: 'progressive' },
          { name: 'chromaSubsampling', value: 'chromaSubsampling' },
          { name: 'trellisQuantisation', value: 'trellisQuantisation' },
          { name: 'overshootDeringing', value: 'overshootDeringing' },
          { name: 'optimiseScans', value: 'optimiseScans' },
          { name: 'optimizeScans', value: 'optimizeScans' },
          { name: 'optimiseCoding', value: 'optimiseCoding' },
          { name: 'optimizeCoding', value: 'optimizeCoding' },
          { name: 'quantisationTable', value: 'quantisationTable' },
          { name: 'quantizationTable', value: 'quantizationTable' },
          { name: 'mozjpeg', value: 'mozjpeg' },
          new Separator(),
          { name: 'Skip', value: 'skip' },
        ],
      });
      switch (option) {
        case 'progressive':
          options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
          break;
        case 'chromaSubsampling':
          options.chromaSubsampling = await select({
            message: 'Chroma subsampling:',
            choices: [
              { name: '4:4:4', value: '4:4:4' },
              { name: '4:2:0', value: '4:2:0' },
            ],
            default: '4:2:0'
          });
          break;
        case 'trellisQuantisation':
          options.trellisQuantisation = await confirm({ message: 'Apply trellis quantisation?', default: false });
          break;
        case 'overshootDeringing':
          options.overshootDeringing = await confirm({ message: 'Apply overshoot deringing?', default: false });
          break;
        case 'optimiseScans':
          options.optimiseScans = await confirm({ message: 'Optimise progressive scans?', default: false });
          break;
        case 'optimizeScans':
          options.optimizeScans = await confirm({ message: 'Optimise progressive scans?', default: false });
          break;
        case 'optimiseCoding':
          options.optimiseCoding = await confirm({ message: 'Optimise Huffman coding tables?', default: true });
          break;
        case 'optimizeCoding':
          options.optimizeCoding = await confirm({ message: 'Optimise Huffman coding tables?', default: true });
          break;
        case 'quantisationTable':
          options.quantisationTable = await number({ message: 'Quantization table to use (0-8):', default: 0 });
          break;
        case 'quantizationTable':
          options.quantizationTable = await number({ message: 'Quantization table to use (0-8):', default: 0 });
          break;
        case 'mozjpeg':
          options.mozjpeg = await confirm({ message: 'Use mozjpeg defaults?', default: false });
          break;
        case 'skip':
          addMore = false;
          break;
      }
      if (option !== 'skip') {
        addMore = await confirm({ message: 'Do you want to add more options?', default: false });
      }
    }
  }
  if (sharpFormat === 'png') {
    let addMore = true;
    while (addMore) {
      const option = await select({
        message: 'Select an option to configure for PNG',
        choices: [
          { name: 'progressive', value: 'progressive' },
          { name: 'compressionLevel', value: 'compressionLevel' },
          { name: 'adaptiveFiltering', value: 'adaptiveFiltering' },
          { name: 'effort', value: 'effort' },
          { name: 'palette', value: 'palette' },
          { name: 'colours', value: 'colours' },
          { name: 'colors', value: 'colors' },
          { name: 'dither', value: 'dither' },
          new Separator(),
          { name: 'Skip', value: 'skip' },
        ],
      });
      switch (option) {
        case 'progressive':
          options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
          break;
        case 'compressionLevel':
          options.compressionLevel = await number({ message: 'zlib compression level (0-9):', default: 6 });
          break;
        case 'adaptiveFiltering':
          options.adaptiveFiltering = await confirm({ message: 'Use adaptive row filtering?', default: false });
          break;
        case 'effort':
          options.effort = await number({ message: 'Level of CPU effort to reduce file size (1-10):', default: 7 });
          break;
        case 'palette':
          options.palette = await confirm({ message: 'Quantise to a palette-based image with alpha transparency support?', default: false });
          break;
        case 'colours':
          options.colours = await number({ message: 'Maximum number of palette entries:', default: 256 });
          break;
        case 'colors':
          options.colors = await number({ message: 'Maximum number of palette entries:', default: 256 });
          break;
        case 'dither':
          options.dither = await number({ message: 'Level of Floyd-Steinberg error diffusion (0-1):', default: 1.0 });
          break;
        case 'skip':
          addMore = false;
          break;
      }
      if (option !== 'skip') {
        addMore = await confirm({ message: 'Do you want to add more options?', default: false });
      }
    }
  }
  if (sharpFormat === 'webp') {
    let addMore = true;
    while (addMore) {
      const option = await select({
        message: 'Select an option to configure for WebP',
        choices: [
          { name: 'alphaQuality', value: 'alphaQuality' },
          { name: 'lossless', value: 'lossless' },
          { name: 'nearLossless', value: 'nearLossless' },
          { name: 'smartSubsample', value: 'smartSubsample' },
          { name: 'effort', value: 'effort' },
          { name: 'minSize', value: 'minSize' },
          { name: 'mixed', value: 'mixed' },
          { name: 'preset', value: 'preset' },
          { name: 'loop', value: 'loop' },
          { name: 'delay', value: 'delay' },
          new Separator(),
          { name: 'Skip', value: 'skip' },
        ],
      });
      switch (option) {
        case 'alphaQuality':
          options.alphaQuality = await number({ message: 'Quality of alpha layer (0-100):', default: 100 });
          break;
        case 'lossless':
          options.lossless = await confirm({ message: 'Use lossless compression mode?', default: false });
          break;
        case 'nearLossless':
          options.nearLossless = await confirm({ message: 'Use near_lossless compression mode?', default: false });
          break;
        case 'smartSubsample':
          options.smartSubsample = await confirm({ message: 'Use high quality chroma subsampling?', default: false });
          break;
        case 'effort':
          options.effort = await number({ message: 'Level of CPU effort to reduce file size (0-6):', default: 4 });
          break;
        case 'minSize':
          options.minSize = await confirm({ message: 'Prevent use of animation key frames to minimise file size (slow)?', default: false });
          break;
        case 'mixed':
          options.mixed = await confirm({ message: 'Allow mixture of lossy and lossless animation frames (slow)?', default: false });
          break;
        case 'preset':
          options.preset = await select({
            message: 'Preset options:',
            choices: [
              { name: 'default', value: 'default' },
              { name: 'photo', value: 'photo' },
              { name: 'picture', value: 'picture' },
              { name: 'drawing', value: 'drawing' },
              { name: 'icon', value: 'icon' },
              { name: 'text', value: 'text' },
            ],
            default: 'default'
          });
          break;
        case 'loop':
          options.loop = await number({ message: 'Number of animation iterations (0 for infinite):', default: 0 });
          break;
        case 'delay':
          options.delay = await input({ message: 'Delay(s) between animation frames (in milliseconds, comma-separated):', default: '' }).then(input => input.split(',').map(Number));
          break;
        case 'skip':
          addMore = false;
          break;
      }
      if (option !== 'skip') {
        addMore = await confirm({ message: 'Do you want to add more options?', default: false });
      }
    }
  }
  if (sharpFormat === 'gif') {
    let addMore = true;
    while (addMore) {
      const option = await select({
        message: 'Select an option to configure for GIF',
        choices: [
          { name: 'reuse', value: 'reuse' },
          { name: 'progressive', value: 'progressive' },
          { name: 'colours', value: 'colours' },
          { name: 'colors', value: 'colors' },
          { name: 'effort', value: 'effort' },
          { name: 'dither', value: 'dither' },
          { name: 'interFrameMaxError', value: 'interFrameMaxError' },
          { name: 'interPaletteMaxError', value: 'interPaletteMaxError' },
          { name: 'loop', value: 'loop' },
          { name: 'delay', value: 'delay' },
          new Separator(),
          { name: 'Skip', value: 'skip' },
        ],
      });
      switch (option) {
        case 'reuse':
          options.reuse = await confirm({ message: 'Re-use existing palette?', default: false });
          break;
        case 'progressive':
          options.progressive = await confirm({ message: 'Use progressive (interlace) scan?', default: false });
          break;
        case 'colours':
          options.colours = await number({ message: 'Maximum number of palette entries (2-256):', default: 256 });
          break;
        case 'colors':
          options.colors = await number({ message: 'Maximum number of palette entries (2-256):', default: 256 });
          break;
        case 'effort':
          options.effort = await number({ message: 'Level of CPU effort to reduce file size (1-10):', default: 7 });
          break;
        case 'dither':
          options.dither = await number({ message: 'Level of Floyd-Steinberg error diffusion (0-1):', default: 1.0 });
          break;
        case 'interFrameMaxError':
          options.interFrameMaxError = await number({ message: 'Maximum inter-frame error for transparency (0-32):', default: 0 });
          break;
        case 'interPaletteMaxError':
          options.interPaletteMaxError = await number({ message: 'Maximum inter-palette error for palette reuse (0-256):', default: 3 });
          break;
        case 'loop':
          options.loop = await number({ message: 'Number of animation iterations (0 for infinite):', default: 0 });
          break;
        case 'delay':
          options.delay = await input({ message: 'Delay(s) between animation frames (in milliseconds, comma-separated):', default: '' }).then(input => input.split(',').map(Number));
          break;
        case 'skip':
          addMore = false;
          break;
      }
      if (option !== 'skip') {
        addMore = await confirm({ message: 'Do you want to add more options?', default: false });
      }
    }
  }
  return options as ImageOptions;
}
