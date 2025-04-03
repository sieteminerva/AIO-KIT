import { bgBlue, bgYellowBright, blueBright, bold } from "yoctocolors";
export class AioLogDisplay {
    constructor() { }
    OutlineBox(content) {
        // Header
        console.log(bgBlue('┌──────────────────────────────────────────────┐'));
        console.log(bgBlue(`│    ${blueBright(bold('AIO Development CLI Kit'))}    │`));
        console.log(bgBlue('└──────────────────────────────────────────────┘'));
        console.log('\n'); // Empty line for spacing
    }
}
export function logOutlineBox(content) {
    console.log('\n'); // Header
    console.log(bgYellowBright('┌──────────────────────────────────────────────┐'));
    console.log(bgYellowBright(`│            ${bold('AIO Development CLI Kit')}           │`));
    console.log(bgYellowBright('└──────────────────────────────────────────────┘'));
    console.log('\n'); // Empty line for spacing
}
