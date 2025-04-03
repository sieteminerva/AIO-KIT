import { confirm, number, select } from "@inquirer/prompts";
export async function SetImageOptionsPrompt() {
    let squared = false;
    let maxWidth = 1000;
    let watermarkPosition = 'center';
    // Confirmation if user want to resize the image or not.
    const resize = await confirm({
        message: 'Do you want to `Resize` the image?',
        default: false
    });
    if (resize) {
        maxWidth ? maxWidth : await number({
            message: 'Set new `Image Width` for optimizing the output',
            default: maxWidth,
        });
        // Confirmation if user want to resize it to square size or not.
        squared = await confirm({
            message: 'Would you like to `Crop` the image? (1:1 ratio)',
            default: false
        });
    }
    // Confirmation if user want to watermark the image or not.
    const watermark = await confirm({
        message: 'Would you like to `Watermark` the output?',
        default: false,
    });
    const quality = await number({
        message: 'Set `Image Quality` of the optimized output',
        default: 70,
    });
    if (watermark) {
        // gravity: `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west`, `northwest`, `center`
        watermarkPosition = await select({
            message: 'Select watermark position:',
            choices: [
                { name: 'North', value: 'north' },
                { name: 'Northeast', value: 'northeast' },
                { name: 'East', value: 'east' },
                { name: 'Southeast', value: 'southeast' },
                { name: 'South', value: 'south' },
                { name: 'Southwest', value: 'southwest' },
                { name: 'West', value: 'west' },
                { name: 'Northwest', value: 'northwest' },
                { name: 'Center', value: 'center' },
            ],
            default: 'center'
        });
        // TODO for next create watermark placing options for now just put it on center
        // of the image
    }
    return { resize, squared, watermark, quality };
}
