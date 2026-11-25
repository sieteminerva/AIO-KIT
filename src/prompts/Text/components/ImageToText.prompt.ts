import { select } from "@inquirer/prompts";
import { basename, extname, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { greenBright, red, yellowBright } from "yoctocolors";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
import { AioFileOperation } from "../../../class/FileOperation.class.js";
import { OCRProcessor, OCR_DEFAULT_LANG, type OCRResult } from "../../../class/OCRProcessor.js";
import { SelectImageFilesPrompt } from "../../Image/components/SelectImageFiles.prompt.js";

/** Sentinel choice injected by `SelectImageFilesPrompt` to toggle all files. */
const SELECT_ALL = 'TRIGGER_SELECT_ALL';

/** Formats sharp + tesseract can both read. */
const OCR_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'];

/** Prefix of the generated `.txt` files, matching the text-processor naming style. */
const OCR_OUTPUT_PREFIX = 'ocr';

/**
 * Generates text from selected images (OCR).
 *
 * Chain: search images → select files (single or all) → pick language → run the
 * batch OCR (the tesseract worker is initialized once for the whole selection) →
 * save every result as `ocr_<imageName>.txt` in the working directory.
 *
 * @param {string} [DIR] - Directory to search. Relative paths resolve against
 * `process.cwd()`; an absolute path (as passed by menu dialogs) is used as-is.
 * @returns {Promise<void>} Resolves when every selected image has been processed.
 *
 * @example
 * ```bash
 *
 *    // Generate text from the images in ./scans:
 *    aio text
 *
 * ```
 */
export async function ImageToTextPrompt(DIR: string = process.cwd()): Promise<void> {
  try {
    const folder = await new AioFileOperation().search(DIR, OCR_FORMATS, false);

    if (!folder || folder.length === 0) {
      console.log(red(`No image files found in ${DIR}`));
      return;
    }

    console.log(`Found image : ${greenBright(`${folder.length} file(s)`)} in ${DIR}`);

    const picked = await SelectImageFilesPrompt(folder);
    // drop the SELECT ALL sentinel so it never reaches the processor
    const selected = (picked ?? []).filter((file) => file !== SELECT_ALL);

    if (selected.length === 0) {
      console.log(red('No image files selected for text generation.'));
      return;
    }

    const lang = await select({
      message: 'Select OCR language:',
      choices: [
        { name: 'English', value: 'eng' },
        { name: 'Indonesian', value: 'ind' },
        { name: 'English + Indonesian', value: OCR_DEFAULT_LANG },
      ],
      default: OCR_DEFAULT_LANG,
    });

    console.log(`Running OCR on ${yellowBright(`${selected.length} image(s)`)} ...`);

    const processor = new OCRProcessor();
    const results = await processor.batch(selected, { lang });

    for (const result of results) {
      report(result);
    }

    // write one .txt per image, straight into the working directory
    const saved = await save(results);
    for (const path of saved) {
      console.log(greenBright(`saved: ${path}`));
    }

    const done = results.filter((result) => !result.error).length;
    console.log(greenBright(`\n${done} of ${results.length} image(s) processed, ${saved.length} file(s) saved in ${process.cwd()}.`));
  } catch (error) {
    handlePromptError(error);
  }
}

/**
 * Writes every successful OCR result to `ocr_<imageName>.txt` in `process.cwd()`.
 * Images without detected text are skipped (no empty files are created).
 *
 * @param results - Results returned by `OCRProcessor.batch()`.
 * @returns Absolute paths of the files that were written.
 */
async function save(results: OCRResult[]): Promise<string[]> {
  const paths: string[] = [];

  for (const result of results) {
    if (result.error || !result.text) continue;

    const name = basename(result.file, extname(result.file));
    const outputPath = resolve(process.cwd(), `${OCR_OUTPUT_PREFIX}_${name}.txt`);

    await writeFile(outputPath, result.text, 'utf8');
    paths.push(outputPath);
  }

  return paths;
}

/**
 * Prints one OCR result block.
 * @param {{ file: string, text: string, error?: string }} result - Result of a single image.
 */
function report(result: OCRResult): void {
  console.log(`\n--- ${basename(result.file)} ---`);

  if (result.error) {
    console.log(red(`failed: ${result.error}`));
    return;
  }

  console.log(result.text || red('(no text detected)'));
}
