import { input } from "@inquirer/prompts";
import { dirname, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { greenBright, red } from "yoctocolors";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { SvgProcessor, type SvgOptions } from "../../modules/SvgProcessor.js";
import { SelectImageFilesPrompt } from "../Image/components/SelectImageFiles.prompt.js";

/** Sentinel choice injected by `SelectImageFilesPrompt` to toggle all files. */
const SELECT_ALL = 'TRIGGER_SELECT_ALL';

/**
 * Generates an `aio-icon.css` file from a selection of SVG files.
 *
 * Flow: pick files → set `cssStyle` → every SVG is optimized into a `mask-image`
 * data URI and collected as one CSS rule. This prompt only generates CSS — it
 * does not write the optimized `.svg` files (`ImageOptimizerPrompt` does that).
 *
 * @param {string} [filepath] - Directory that contains the SVG files. Relative paths
 * resolve against `process.cwd()`; an absolute path (as passed by menu dialogs) is used as-is.
 * @param {string} [filename=''] - Optional sub-path appended to `filepath`.
 * @returns {Promise<void>} Resolves when the CSS file has been written.
 *
 * @example
 * ```bash
 *
 *    // Generate aio-icon.css from the SVGs in ./icons:
 *    aio generator --path ./icons
 *
 * ```
 */
export async function CssIconGeneratorPrompt(filepath?: string, filename: string = ''): Promise<void> {
  try {
    // `resolve` handles both relative and already-absolute input, so callers (CLI
    // flags or menu dialogs that pass `process.cwd()`) never get a doubled path.
    const DIR = filepath
      ? resolve(filepath, filename)
      : process.cwd();

    const processor = new SvgProcessor();
    const folder = await processor.search(DIR, ['.svg'], false);

    if (!folder || folder.length === 0) {
      console.log(red(`No SVG files found in ${DIR}`));
      return;
    }

    console.log(`Found SVG : ${greenBright(`${folder.length} file(s)`)} in ${DIR}`);
    const picked = await SelectImageFilesPrompt(folder);
    // drop the SELECT ALL sentinel so it never reaches the processor
    const selected = (picked ?? []).filter((file) => file !== SELECT_ALL);

    if (selected.length === 0) {
      console.log(red('No SVG files selected for icon generation.'));
      return;
    }

    const cssStyle = await input({
      message: 'CSS style declarations for the generated icon rule:',
      default: 'display: inline-block; color: currentColor;'
    });

    // preset is pinned to `css-icon`; no other SVGO option is exposed here
    const options: SvgOptions = { preset: 'css-icon', cssStyle };

    const cssPath = resolve(dirname(selected[0]), 'aio-icon.css');

    const rules: string[] = [];
    const failed: string[] = [];
    for (const file of selected) {
      try {
        rules.push(await processor.collect(file, options));
      } catch {
        // one broken SVG must not abort the whole batch
        failed.push(file);
      }
    }

    if (rules.length === 0) {
      console.log(red('No icon rule generated — every selected SVG failed.'));
      return;
    }

    await writeFile(cssPath, `${rules.join('\n\n')}\n`, 'utf8');
    console.log(greenBright(`${rules.length} icons collected into ${cssPath}`));

    if (failed.length > 0) {
      console.log(red(`${failed.length} file(s) skipped:`), failed.join(', '));
    }
  } catch (error) {
    handlePromptError(error);
  }
}
