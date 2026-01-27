// src/utils/ocrClient.ts
// Main-thread OCR client using tesseract.js with NO logger passed to Tesseract APIs.
// Overwrite existing file with this and restart dev server.
//
// Install tesseract.js if needed: npm install tesseract.js

import * as Tesseract from 'tesseract.js';

export type OCRResult = {
  printedText: string;
  handwrittenText: string;
  combined: string;
};

/**
 * Preprocess image into a canvas element.
 * Accepts File/Blob or string URL/dataURL.
 */
export async function preprocessToCanvas(imageSrc: string | File | Blob, width = 1200): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const finish = () => {
      const scale = img.naturalWidth > width ? width / img.naturalWidth : 1;
      const w = Math.max(600, Math.round(img.naturalWidth * scale));
      const h = Math.round(img.naturalHeight * (w / img.naturalWidth));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      ctx.drawImage(img, 0, 0, w, h);

      // grayscale + mild contrast boost (best-effort; may fail if CORS prevents pixel access)
      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const contrastMul = 1.35;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = Math.round(r * 0.3 + g * 0.59 + b * 0.11);
          const contrasted = Math.max(0, Math.min(255, Math.round((gray - 128) * contrastMul + 128)));
          data[i] = data[i + 1] = data[i + 2] = contrasted;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {
        // ignore pixel manipulation errors (CORS)
      }

      // cheap sampling threshold (best-effort)
      try {
        const imgData2 = ctx.getImageData(0, 0, w, h);
        const data2 = imgData2.data;
        const sampleStep = 6;
        for (let y = 0; y < h; y += sampleStep) {
          for (let x = 0; x < w; x += sampleStep) {
            const idx = (y * w + x) * 4;
            const gray = data2[idx];
            let sum = 0, cnt = 0;
            for (let yy = Math.max(0, y - 8); yy <= Math.min(h - 1, y + 8); yy += 4) {
              for (let xx = Math.max(0, x - 8); xx <= Math.min(w - 1, x + 8); xx += 4) {
                const id2 = (yy * w + xx) * 4;
                sum += data2[id2];
                cnt++;
              }
            }
            const mean = sum / Math.max(1, cnt);
            const out = gray < mean - 12 ? 0 : 255;
            data2[idx] = data2[idx + 1] = data2[idx + 2] = out;
          }
        }
        ctx.putImageData(imgData2, 0, 0);
      } catch (e) {
        // ignore threshold step failures
      }

      resolve(canvas);
    };

    const fail = (ev: any) => reject(new Error('Image load error: ' + String(ev)));

    if (imageSrc instanceof File || imageSrc instanceof Blob) {
      const url = URL.createObjectURL(imageSrc);
      img.onload = () => {
        try { finish(); } finally { try { URL.revokeObjectURL(url); } catch {} }
      };
      img.onerror = fail;
      img.src = url;
    } else {
      img.onload = finish;
      img.onerror = fail;
      img.src = String(imageSrc);
    }
  });
}

/**
 * Run tesseract.js recognize on the provided canvas (main thread).
 * IMPORTANT: Do NOT pass any 'logger' value here to avoid the "logger is not a function" worker error.
 */
async function recognizeCanvasMainThread(canvas: HTMLCanvasElement, lang = 'eng', psm?: number) {
  try {
    // If psm provided, some tesseract.js builds accept passing parameters via the third arg.
    // We'll attempt to pass 'tessedit_pageseg_mode' only as an option object (best-effort).
    if (typeof psm === 'number') {
      // Many builds accept { tessedit_pageseg_mode: '6' } but some ignore it.
      const opts: any = { };
      // Some builds expect numeric PSM, others string. We'll pass numeric value as-is which is commonly accepted.
      opts.tessedit_pageseg_mode = String(psm);
      // do not include logger in opts
      const res = await (Tesseract.recognize as any)(canvas as any, lang, opts);
      return res;
    } else {
      // default recognize without extra options
      const res = await (Tesseract.recognize as any)(canvas as any, lang, {});
      return res;
    }
  } catch (err) {
    throw new Error((err as any)?.message ?? String(err));
  }
}

/**
 * Public: extract printed + handwritten text and return combined.
 * Two passes are used to try and capture printed and handwriting.
 */
export async function extractTextFromImage(
  image: string | File | Blob,
  opts?: { lang?: string }
): Promise<OCRResult> {
  const lang = opts?.lang || 'eng';

  // 1) Preprocess to canvas
  const canvas = await preprocessToCanvas(image, 1200);

  // 2) First pass: general recognition (no PSM override)
  let printedText = '';
  try {
    const r1 = await recognizeCanvasMainThread(canvas, lang);
    printedText = (r1 && r1.data && r1.data.text) ? String(r1.data.text).trim() : '';
  } catch (e) {
    console.warn('extractTextFromImage: first pass failed:', (e as any)?.message ?? String(e));
    printedText = '';
  }

  // 3) Second pass: request single block PSM (6) to better capture handwriting (best-effort)
  let handwrittenText = '';
  try {
    const r2 = await recognizeCanvasMainThread(canvas, lang, 6);
    handwrittenText = (r2 && r2.data && r2.data.text) ? String(r2.data.text).trim() : '';
  } catch (e) {
    console.warn('extractTextFromImage: second pass failed:', (e as any)?.message ?? String(e));
    handwrittenText = '';
  }

  // 4) Combine heuristically: include lines found in handwriting that weren't in printed block
  const printedLines = printedText.split('\n').map(l => l.trim()).filter(Boolean);
  const handLines = handwrittenText.split('\n').map(l => l.trim()).filter(Boolean);
  const handwritingOnly = handLines.filter(l => !printedLines.includes(l) && l.length > 2);

  const combinedArray = Array.from(new Set([...printedLines, ...handwritingOnly]));
  const combined = combinedArray.join('. ').replace(/\s+/g, ' ').trim();

  return { printedText, handwrittenText, combined };
}
