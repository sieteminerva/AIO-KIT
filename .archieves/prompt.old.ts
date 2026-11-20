
import { bgYellowBright, greenBright } from "yoctocolors";
import { join } from "path";
import { AioTextProcessor, InsertOptions, MatchOptions } from "../../class/TextProcessor.class.js";
import { handlePromptError } from "../../prompts/ErrorHandler.prompt.js";
import { logContent } from "../../prompts/TextProcessor/components/LogContent.js";
import { createSelectEnginePrompt } from "../../prompts/TextProcessor/components/SelectEngine.js";
import { createSelectFilesPrompt } from "../../prompts/TextProcessor/components/SelectFiles.js";
import { setOptionsPrompt } from "../../prompts/TextProcessor/components/SetOptions.js";
import { createWriteFilePrompt } from "../../prompts/TextProcessor/components/WriteFile.js";


// TODO handle no file error

export async function textProcessorPromptOld(fromExt: string, name: string = 'Text Processor') {
  try {
    const DIR = join(process.cwd(), 'test');
    const processor = new AioTextProcessor();
    // Run Engine Selector
    const engineName = await createSelectEnginePrompt();
    console.log('Selected Text Processor :', greenBright(`${engineName}`)); // Debugging

    const folder = await processor.search(DIR, fromExt, false);
    console.log(`Found file :`, greenBright(`${folder.length} files`)); // Debugging

    // Run File Selector
    const fileSelected = await createSelectFilesPrompt(folder, engineName as string) as string[];
    console.log(`Found file :`, greenBright(`${fileSelected.length} files`)); // Debugging
    console.log('File Selected :', greenBright(`${fileSelected}`)); // Debugging

    if (engineName && Array.isArray(fileSelected) && fileSelected.length > 0) {
      let input = '';
      let content: any = '';

      if (engineName === 'merge' || engineName === 'compare') {

        content = await processor[engineName as keyof AioTextProcessor](...fileSelected);
        input = await createWriteFilePrompt(fileSelected[0], engineName) as string;

      } else {
        // itterate through selected file
        for (const filepath of fileSelected) {
          console.log(`Processing : `, bgYellowBright(` ${filepath} `)); // Debugging
          switch (engineName) {
            case 'findMatch':
            case 'split':
            case 'replace':
              // insert keyword to find
              input = await setOptionsPrompt(engineName);
              const options: MatchOptions | InsertOptions = { keyword: input };
              content = await processor[engineName as keyof AioTextProcessor](filepath, options);
              break;
            default:
              content = await processor[engineName as keyof AioTextProcessor](filepath);
              break;
          }
          await logContent(engineName, content.content);
          input = await createWriteFilePrompt(filepath, engineName) as string;
        }
      }
      if (input) {
        console.log(`[3] input name`, input); // Debugging
        // await processor.write(input, content as any);
      }
    }
    // const msg = greenBright(`${fileSelected.length} files successfully written.`);
    // console.log(msg);
  } catch (error) {
    handlePromptError(error);
  }
}