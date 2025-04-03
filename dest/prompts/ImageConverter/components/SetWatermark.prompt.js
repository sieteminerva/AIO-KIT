import { select, confirm } from "@inquirer/prompts";
export async function SetWatermarkOptionsPrompt() {
    const watermark = await confirm({ message: 'Do you want to add a watermark?', default: false });
    let watermarkPosition = 'center';
    if (watermark) {
        watermarkPosition = await select({
            message: 'Select watermark position:',
            choices: [
                { name: 'Top Middle', value: 'north' },
                { name: 'Top Right Corner', value: 'northeast' },
                { name: 'Middle Right', value: 'east' },
                { name: 'Bottom Right Corner', value: 'southeast' },
                { name: 'Bottom Middle', value: 'south' },
                { name: 'Bottom Left Corner', value: 'southwest' },
                { name: 'Middle Left', value: 'west' },
                { name: 'Top Left Corner', value: 'northwest' },
                { name: 'Center', value: 'center' },
            ],
            default: 'center'
        });
    }
    return { watermark, watermarkPosition };
}
