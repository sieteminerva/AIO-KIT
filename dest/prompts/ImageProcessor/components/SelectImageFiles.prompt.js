import { extname, join } from "path";
import { yellowBright } from "yoctocolors";
import { checkbox } from "@inquirer/prompts";
import { handlePromptError } from "../../ErrorHandler.prompt.js";
import { IMAGE_FORMATS } from "../../options.js";
/**
 * Prompts the user to select image files from a given folder.
 *
 * @param {Dirent[]} folder - Array of Dirent objects representing the files in the folder.
 * @returns {Promise<string[] | undefined>} - A promise that resolves to an array of selected file paths or undefined if an error occurs.
 * The prompt allows the user to choose from a list of available image files.
 * If the folder is empty, logs a message and returns an empty array.
 * Uses a checkbox prompt to display file choices and validates them using `imageFilesValidation`.
 * Handles any errors by invoking `handlePromptError`.
 * @example
 * ```typescript
 * await SelectImageFilesPrompt([{ name: 'image1.jpg', path: '/path/to/image1.jpg' }]);
 * ```
 */
export async function SelectImageFilesPrompt2(folder) {
    try {
        if (folder && folder.length === 0 || !folder) {
            console.log(yellowBright('file not found!'));
            return;
        }
        else {
            const choices = folder.map(file => ({ name: file.name, value: join(file.parentPath, file.name) }));
            const files = await checkbox({
                message: 'Select image files to process?\n',
                choices,
                validate(choices) {
                    return imageFilesValidation(choices);
                },
            });
            return files;
        }
    }
    catch (error) {
        handlePromptError(error);
    }
}
export async function SelectImageFilesPrompt(folder) {
    let runExecution = true;
    // Panggil fungsi internal helper dengan status awal belum ada yang diseleksi (kosong)
    try {
        if (!folder || folder.length === 0) {
            console.log(yellowBright('file not found!'));
            return;
        }
        if (runExecution) {
            // 1. Map file asli dari folder
            const fileChoices = folder.map(file => {
                const fullPath = join(file.parentPath, file.name);
                return {
                    name: file.name,
                    value: fullPath,
                    // Otomatis tercentang jika jalurnya ada di array initialCheckedValues
                    checked: false
                };
            });
            // 2. Masukkan opsi "Select All" di paling atas
            // PASTIKAN checked selalu false untuk SELECT ALL agar tidak mengunci loop saat re-render
            const choices = [
                { name: '➔ SELECT ALL', value: 'TRIGGER_SELECT_ALL', checked: false },
                ...fileChoices
            ];
            const selectedValues = await checkbox({
                message: 'Select image files to process?\n',
                choices,
                validate(values) {
                    return imageFilesValidation(values);
                },
            });
            // 3. JIKA USER MEMILIH "SELECT ALL"
            if (selectedValues.includes('TRIGGER_SELECT_ALL')) {
                // Ambil seluruh file path asli
                const allFilePaths = fileChoices.map(c => c.value);
                // Hitung jumlah file asli yang saat ini sedang tercentang (tidak termasuk TRIGGER_SELECT_ALL)
                const currentCheckedFilesCount = selectedValues.filter(v => v !== 'TRIGGER_SELECT_ALL').length;
                // Fitur Tambahan (Toggle): Jika semua file sudah tercentang lalu user menekan Select All lagi, maka lakukan DESELECT ALL (kosongkan)
                if (currentCheckedFilesCount === allFilePaths.length) {
                    return allFilePaths;
                }
                // Jika belum semua tercentang, jalankan ulang prompt dengan kondisi semua file ter-checked
                runExecution = false;
                return allFilePaths;
            }
            // Jika user tidak menekan SELECT ALL, langsung kembalikan hasil pilihan file asli
            return selectedValues;
        }
    }
    catch (error) {
        handlePromptError(error);
    }
    finally {
        runExecution = false;
    }
}
/**
 * Validates the selected image files from the user.
 * Returns true if all selected files are valid, otherwise returns an error message.
 * A file is considered valid if it has an extension that is included in the IMAGE_FORMATS array.
 */
function imageFilesValidation(files) {
    // must select a file
    if (files.length === 0) {
        return 'You must select a file';
    }
    for (const file of files) {
        const file_ext = extname(file.name).toLowerCase().substring(1);
        if (file.value === ("TRIGGER_SELECT_ALL")) {
            break;
        }
        if (!IMAGE_FORMATS.includes(file_ext) || file.value === "TRIGGER_SELECT_ALL") {
            return file_ext + ' is not an image file. Only image files are allowed!';
        }
    }
    return true;
}
