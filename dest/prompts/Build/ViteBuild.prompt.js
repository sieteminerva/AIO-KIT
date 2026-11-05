import { resolve } from "path";
import { build } from "vite";
import { existsSync, readFileSync, readdirSync } from "fs";
import { select } from "@inquirer/prompts";
import { handlePromptError } from "../ErrorHandler.prompt.js";
import { VITE_PROJECT_TYPES } from "../options.js";
import { SelectBuildPrompt } from "./prompts.js";
export class ViteRunner {
    /**
     * Memvalidasi apakah proyek siap menggunakan Vite berdasarkan 4 kriteria:
     * 1. Ada 'vite' di devDependencies di package.json
     * 2. Folder node_modules/vite tersedia
     * 3. Ada file vite.config.* di root proyek
     * 4. Ada file build.config.json di root proyek
     *
     * @returns {boolean} True jika semua kriteria terpenuhi, False jika salah satu gagal.
     */
    verified() {
        const rootDir = process.cwd();
        try {
            // 1. Periksa devDependencies di package.json
            const packageJsonPath = resolve(rootDir, 'package.json');
            if (!existsSync(packageJsonPath)) {
                console.warn("Validation Failed: package.json tidak ditemukan.");
                return false;
            }
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            const hasViteDevDep = packageJson.devDependencies && Object.prototype.hasOwnProperty.call(packageJson.devDependencies, 'vite');
            if (!hasViteDevDep) {
                console.warn("Validation Failed: 'vite' tidak terdaftar di devDependencies.");
                return false;
            }
            // 2. Periksa apakah folder node_modules/vite ada
            const nodeModulesVitePath = resolve(rootDir, 'node_modules', 'vite');
            if (!existsSync(nodeModulesVitePath)) {
                console.warn("Validation Failed: Folder node_modules/vite tidak ditemukan. Silakan jalankan install.");
                return false;
            }
            // 3. Periksa keberadaan file vite.config.* di root (bisa berupa .js, .ts, .mjs, .cjs)
            const rootFiles = readdirSync(rootDir);
            const hasViteConfig = rootFiles.some(file => file.startsWith('vite.config.'));
            if (!hasViteConfig) {
                console.warn("Validation Failed: File vite.config.* tidak ditemukan di root proyek.");
                return false;
            }
            // 4. Periksa apakah build.config.json ada di root
            const buildConfigPath = resolve(rootDir, 'build.config.json');
            if (!existsSync(buildConfigPath)) {
                console.warn("Validation Failed: File build.config.json tidak ditemukan di root proyek.");
                return false;
            }
            // Semua kriteria terpenuhi
            return true;
        }
        catch (error) {
            console.error("Terjadi kesalahan saat melakukan verifikasi proyek:", error);
            return false;
        }
    }
    async gas(cwd, gasMode) {
        const isVerified = this.verified();
        if (isVerified) {
            console.log("GAS build compiler:", gasMode, isVerified);
            await build({
                mode: gasMode ? `gas:${gasMode}` : "gas",
            });
        }
    }
    webdev(cwd) {
        console.log("Webdev build prompt executed!");
    }
}
export async function ViteBuildPrompt(DIR) {
    const cwd = DIR ? DIR : process.cwd();
    const engine = new ViteRunner();
    try {
        const projectType = await select({
            message: 'Choose your project type below.',
            choices: VITE_PROJECT_TYPES.map((menu) => ({ name: menu.name, value: menu.value }))
        });
        switch (projectType) {
            case 'gas':
                ViteBuildGasPrompt(DIR, engine);
                break;
            case 'website':
                engine.webdev(cwd);
                break;
            case 'ionic':
                console.log('Not yet implemented!');
                break;
            case 'back':
                await SelectBuildPrompt(cwd);
                break;
            case 'quit':
                process.exit(0);
        }
    }
    catch (error) {
        handlePromptError(error);
    }
}
export async function ViteBuildGasPrompt(DIR, engine) {
    const cwd = DIR ? DIR : process.cwd();
    try {
        const gasModeCompiler = await select({
            message: 'Choose your compiler mode below.',
            choices: [
                { name: "Single File Compiler", value: "single" },
                { name: "Per Page Compiler", value: "page" },
                { name: "Multi File Compiler", value: "multi" },
                { name: "Generate Documentation Entry", value: "docs" }
            ]
        });
        switch (gasModeCompiler) {
            case 'single':
                engine.gas(cwd, gasModeCompiler);
                break;
            case 'page':
                engine.gas(cwd, gasModeCompiler);
                break;
            case 'multi':
                engine.gas(cwd, gasModeCompiler);
                break;
            case 'docs':
                engine.gas(cwd, gasModeCompiler);
                break;
            case 'back':
                await ViteBuildPrompt(cwd);
                break;
            case 'quit':
                process.exit(0);
        }
    }
    catch (error) {
        handlePromptError(error);
    }
}
