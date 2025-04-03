import { checkbox, input } from "@inquirer/prompts";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { readDirectory, excludeDirectory } from "../../lib/scripts/util.js";


export async function _FileConverter(ext: string | string[], DIR: string, Fn: Function) {
  try {
    const DEST_DIR = process.cwd();
    const DEST = DIR ? `${DEST_DIR}\\${DIR}` : DEST_DIR;
    const manual = `Let me enter ${ext} filename manually.`;
    if (DIR) console.log('destination path: %s', DEST);
    const list: any = await readDirectory(DEST_DIR, ext);
    list.push(manual);
    const fileselect = await checkbox({
      message: `Select found ${ext} files`,
      choices: list.map((file: any) => ({ name: file, value: file })),
    });
    for (const filename of fileselect) {
      if (filename !== manual) {
        Fn(filename);
      } else {
        const manualFilename = await input({
          message: `Enter ${ext} filename you want to process`,
        });
        const selectedFile = `${DEST}/${manualFilename}/`;
        Fn(selectedFile);
      }
    }
  } catch (error) {
    handlePromptError(error);
  }
}

export async function _ConcatFiles(DIR: string, Fn: Function) {
  try {
    let ext: string = '';
    const DEST_DIR = process.cwd();
    const DEST = DIR ? `${DEST_DIR}\\${DIR}` : DEST_DIR;
    if (DIR) console.log('destination path: %s', DEST);
    const list: any = await readDirectory(DEST_DIR, ext);
    excludeDirectory(list);
    const fileselect = await checkbox({
      message: `Select files you want to merge`,
      choices: list.map((file: any) => ({ name: file, value: file })),
    });
    Fn(fileselect);
  } catch (error) {
    handlePromptError(error);
  }
}



