import type { Worker } from 'tesseract.js';
import { existsSync } from 'node:fs';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Default language pair; both `eng` and `ind` traineddata ship in `lib/data`. */
export const OCR_DEFAULT_LANG = 'eng+ind';

/** Result of one image OCR run. */
export interface OCRResult {
  file: string;
  text: string;
  error?: string;
}


// Sub-fitur yang bisa dipilih user setelah select file / select all
export type OCRFeatureMode =
  | 'extract-text'      // Cetak teks ke console
  | 'save-txt'          // Simpan hasil masing-masing gambar ke file .txt
  | 'merge-txt'         // Gabungkan teks dari semua gambar terpilih jadi 1 file .txt
  | 'extract-json';     // Ekstrak teks beserta metadata file dalam format JSON

export interface OCRProcessConfig {
  mode: OCRFeatureMode;
  lang?: string;
  highContrast?: boolean;
  outputDir?: string;
}

export interface OCROptions {
  lang?: string;
  highContrast?: boolean;
  outputPath?: string;
}

export class OCRProcessor {
  private worker: Worker | null = null;
  private tessdataPath: string;

  constructor() {
    // Sesuaikan relative path ini dengan struktur folder dest/ Anda
    this.tessdataPath = path.resolve(__dirname, '../lib/data');
  }

  /**
   * Inisialisasi worker sekali saja agar hemat memori & cepat untuk batch processing
   */
  private async initWorker(lang: string): Promise<Worker> {
    if (this.worker) return this.worker;

    if (!existsSync(this.tessdataPath)) {
      throw new Error(`tessdata not found at ${this.tessdataPath} (expected *.traineddata files)`);
    }

    // tesseract.js is heavy; load it only when OCR actually runs
    const { createWorker } = await import('tesseract.js');

    this.worker = await createWorker(lang, 1, {
      langPath: this.tessdataPath,
      cachePath: this.tessdataPath,
      // the traineddata shipped in this repo is NOT gzipped
      gzip: false,
      logger: () => { }, // Silent logger agar tidak merusak tampilan CLI
    });
    return this.worker;
  }

  /**
   * Pre-processing gambar di memori menggunakan sharp
   */
  private async preprocessImage(inputPath: string, highContrast: boolean): Promise<Buffer> {
    // sharp is heavy too; keep it out of the CLI startup path
    const { default: sharp } = await import('sharp');
    let pipeline = sharp(inputPath)
      .grayscale()
      .normalise();

    if (highContrast) {
      pipeline = pipeline.threshold(150);
    }

    return await pipeline.sharpen().toBuffer();
  }

  /**
   * Method utama yang dipanggil oleh CLI command handler (misal: aio ocr)
   */
  public async execute(imagePath: string, options: OCROptions = {}): Promise<string> {
    const [result] = await this.batch([imagePath], options);

    if (result.error) throw new Error(result.error);

    if (options.outputPath) {
      await fs.writeFile(options.outputPath, result.text, 'utf-8');
    }

    return result.text;
  }

  /**
   * Batch entry point: initialize the worker once, OCR every file, then terminate.
   * A failing image is reported in its own result instead of aborting the batch.
   *
   * @param files - Absolute paths of the images to recognize.
   * @param options - Language / preprocessing options.
   * @returns One result per input file, in the same order.
   */
  public async batch(files: string[], options: OCROptions = {}): Promise<OCRResult[]> {
    const { lang = OCR_DEFAULT_LANG, highContrast = false } = options;

    const worker = await this.initWorker(lang);
    const results: OCRResult[] = [];

    try {
      for (const file of files) {
        try {
          const imageBuffer = await this.preprocessImage(file, highContrast);
          const { data: { text } } = await worker.recognize(imageBuffer);
          results.push({ file, text: text.trim() });
        } catch (error) {
          results.push({ file, text: '', error: (error as Error)?.message ?? String(error) });
        }
      }
    } finally {
      // worker harus selalu dimatikan agar proses Node.js tidak menggantung
      await this.terminate();
    }

    return results;
  }

  /**
   * Wajib dipanggil agar CLI langsung exit setelah selesai mengeksekusi command
   */
  public async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
