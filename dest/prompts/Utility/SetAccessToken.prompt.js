import { input } from "@inquirer/prompts";
import { yellowBright } from "yoctocolors";
export async function setAccessTokenPrompt() {
    const token = await input({ message: `${yellowBright('>>')}   Paste your access token here   ${yellowBright('<<')}\n\n` }, { clearPromptOnDone: true });
    return token;
}
