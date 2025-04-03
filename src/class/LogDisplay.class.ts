import { bgBlue, bgGreenBright, bgYellowBright, blueBright, bold, greenBright } from "yoctocolors";

export class AioLogDisplay {

  constructor() { }



  OutlineBox(content: any) {
    // Header
    console.log(bgBlue('┌──────────────────────────────────────────────┐'));
    console.log(bgBlue(`│    ${blueBright(bold('AIO Development CLI Kit'))}    │`));
    console.log(bgBlue('└──────────────────────────────────────────────┘'));
    console.log('\n'); // Empty line for spacing
  }


}

export function logOutlineBox(content: any) {
  console.log('\n');// Header
  console.log(bgYellowBright('┌──────────────────────────────────────────────┐'));
  console.log(bgYellowBright(`│            ${bold('AIO Development CLI Kit')}           │`));
  console.log(bgYellowBright('└──────────────────────────────────────────────┘'));
  console.log('\n'); // Empty line for spacing
}                                                                                     