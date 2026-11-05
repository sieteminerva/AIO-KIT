export declare class ViteRunner {
    /**
     * Memvalidasi apakah proyek siap menggunakan Vite berdasarkan 4 kriteria:
     * 1. Ada 'vite' di devDependencies di package.json
     * 2. Folder node_modules/vite tersedia
     * 3. Ada file vite.config.* di root proyek
     * 4. Ada file build.config.json di root proyek
     *
     * @returns {boolean} True jika semua kriteria terpenuhi, False jika salah satu gagal.
     */
    verified(): boolean;
    gas(cwd: string, gasMode?: "single" | "page" | "multi" | "docs"): Promise<void>;
    webdev(cwd: string): void;
}
export declare function ViteBuildPrompt(DIR: string): Promise<void>;
export declare function ViteBuildGasPrompt(DIR: string, engine: ViteRunner): Promise<void>;
