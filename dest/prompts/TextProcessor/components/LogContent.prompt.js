import { bgGreenBright, bgYellowBright } from "yoctocolors";
/**
 * Logs the content of a file to the console. If the content is an array
 * of strings, it will be logged with a yellow background and the index
 * of each item in the array will be included in the log message.
 *
 * @param {AioTextProcessorMethods} engine - The engine used to process the file.
 * @param {any} content - The content of the file to be logged.
 */
export async function LogContent(engine, content) {
    console.log(`engine :`, engine);
    console.log(bgGreenBright(`LOG CONTENT :`));
    if (Array.isArray(content)) {
        for (let i = 0; i < content.length; i++) {
            console.log(bgYellowBright(`content $${i}:\n`), content[i]);
        }
    }
    else {
        console.log(bgYellowBright(`content:`), '\n', content);
    }
}
