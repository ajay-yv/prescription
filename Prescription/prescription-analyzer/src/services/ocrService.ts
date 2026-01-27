// src/services/ocrService.ts
import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      // create worker with defaults
      this.worker = await Tesseract.createWorker();
    }
  }

  async extractText(
    imageFile: File | string,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<string> {
    try {
      await this.initialize();

      if (!this.worker) {
        console.warn('OCR worker not initialized, returning fallback text');
        return 'OCR service unavailable - using preset prescription data';
      }

      // Optionally you can hook up progress updates or set parameters
      if (onProgress) {
        try {
          // Use `any` cast to satisfy TypeScript while still passing a numeric PSM to Tesseract at runtime.
          // 3 is the PSM for "Fully automatic page segmentation".
          await (this.worker as any).setParameters({ tessedit_pageseg_mode: 3 });
        } catch (err) {
          // ignore parameter failures — continue with recognition
          console.warn('Failed to set OCR worker parameters:', err);
        }
      }

      const result = await this.worker.recognize(imageFile);
      return this.cleanExtractedText(result.data?.text ?? '');
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return 'OCR processing failed - displaying preset prescription data';
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      // allow common punctuation and brackets; avoid unnecessary escaping for '/'
      .replace(/[^\w\s.,:/()\x5B\x5D{}@-]/g, '') // keep letters, digits, whitespace and common punctuation
      .trim();
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
