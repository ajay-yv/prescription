// src/utils/speakAllText.ts
import type { PrescriptionData } from './imageUtils';
import { extractTextFromImage } from './ocrClient';

/**
 * Map short UI language codes to TTS locales
 */
const TTS_LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN'
};

const DEFAULT_TRANSLATE_URL = process.env.REACT_APP_TRANSLATE_API_URL || '/api/translate';
const TRANSLATE_TIMEOUT_MS = 8000;

type TesseractResult = {
  printedText: string;
  handwrittenText: string;
  combined: string;
};

/**
 * Lightweight fetch with timeout that returns text.
 */
async function fetchTextWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = TRANSLATE_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Calls the translation API (server proxy) and returns translated text or empty string on failure.
 * Expects server to accept { text, targetLang, sourceLang? } and return { translatedText: string }
 */
async function callTranslateApi(text: string, targetShort: string, source = 'auto'): Promise<string> {
  const url = DEFAULT_TRANSLATE_URL;
  try {
    const resp = await fetchTextWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: targetShort, sourceLang: source })
    }, TRANSLATE_TIMEOUT_MS);

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.warn(`Translate API returned non-ok ${resp.status}: ${txt.slice(0, 300)}`);
      return '';
    }

    const json = await resp.json().catch(async () => {
      const txt = await resp.text();
      console.warn('Translate API returned non-JSON:', txt.slice(0, 300));
      return null;
    });

    if (!json) return '';
    // normalize commonly used keys
    return (json.translatedText || json.translated_text || json.result || '') as string;
  } catch (err) {
    console.warn('translate call failed', err);
    return '';
  }
}

/**
 * Build a readable paragraph from prescription structured fields + OCR pieces.
 */
function buildFinalReadableText(
  prescriptionData: PrescriptionData,
  tesseractResult: TesseractResult
): string {
  const pieces: string[] = [];
  const pd: any = prescriptionData as any;

  if (pd.patientName) pieces.push(`Patient: ${pd.patientName}.`);
  if (pd.doctorName) pieces.push(`Doctor/Clinic: ${pd.doctorName}.`);
  if (pd.date) {
    // If date is numeric timestamp, format it; else use raw
    const d = Number(pd.date);
    if (!Number.isNaN(d)) pieces.push(`Date: ${new Date(d).toLocaleDateString()}.`);
    else pieces.push(`Date: ${pd.date}.`);
  }

  if (Array.isArray(pd.medications) && pd.medications.length) {
    pieces.push('Medications:');
    pd.medications.forEach((m: any, i: number) => {
      const medName = typeof m === 'string' ? m : (m.name || JSON.stringify(m));
      const dose = Array.isArray(pd.dosage) && pd.dosage[i] ? ` Dosage: ${pd.dosage[i]}.` : '';
      pieces.push(`${i + 1}. ${medName}.${dose}`);
    });
  }

  // Prefer combined OCR output if present
  if (tesseractResult.combined && tesseractResult.combined.trim().length > 10) {
    pieces.push('Extracted text from image:');
    pieces.push(tesseractResult.combined.trim());
  } else {
    if (tesseractResult.printedText && tesseractResult.printedText.trim().length > 10) {
      pieces.push('Printed text:');
      pieces.push(tesseractResult.printedText.trim());
    }
    if (tesseractResult.handwrittenText && tesseractResult.handwrittenText.trim().length > 10) {
      pieces.push('Handwritten notes:');
      pieces.push(tesseractResult.handwrittenText.trim());
    }
  }

  if (Array.isArray(pd.instructions) && pd.instructions.length) {
    pieces.push('Instructions:');
    pd.instructions.forEach((ins: string, i: number) => pieces.push(`${i + 1}. ${ins}.`));
  }

  const out = pieces.join(' ').replace(/\s+/g, ' ').trim();
  return out;
}

/**
 * Determine image source key and return the source (string URL / dataURL / base64 or File/Blob) if available.
 */
function detectImageSource(prescriptionData: PrescriptionData): string | File | Blob | null {
  const pd: any = prescriptionData as any;
  // common keys: image (base64 data URL), imageUrl, imageDataUrl, extractedImageUrl, file (File)
  if (pd.image && typeof pd.image === 'string') return pd.image;
  if (pd.imageDataUrl && typeof pd.imageDataUrl === 'string') return pd.imageDataUrl;
  if (pd.imageUrl && typeof pd.imageUrl === 'string') return pd.imageUrl;
  if (pd.extractedImageUrl && typeof pd.extractedImageUrl === 'string') return pd.extractedImageUrl;
  if (pd.file instanceof File) return pd.file as File;
  return null;
}

/**
 * Returns the finalText that should be spoken.
 * Optionally translates finalText to targetTranslate (short code).
 *
 * - prescriptionData: your structured prescription object
 * - opts.imageKey: optional override for which image key to use
 * - opts.targetTranslate: short code like 'hi' to translate final text before returning
 *
 * Resolves: { finalText, ttsLang }
 * Throws if nothing meaningful found to speak.
 */
export async function speakAllFromImageGetText(
  prescriptionData: PrescriptionData,
  opts?: {
    imageKey?: 'image' | 'imageUrl' | 'imageDataUrl';
    targetTranslate?: 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';
  }
): Promise<{ finalText: string; ttsLang: string }> {
  if (!prescriptionData) throw new Error('prescriptionData required');

  const imageKey = opts?.imageKey || undefined;
  const imageSource = imageKey ? (prescriptionData as any)[imageKey] : detectImageSource(prescriptionData);

  let tesseractResult: TesseractResult = { printedText: '', handwrittenText: '', combined: '' };
  if (imageSource) {
    try {
      // extractTextFromImage should return an object with { printedText, handwrittenText, combined }
      const ocr = await extractTextFromImage(imageSource as any, { lang: 'eng' });
      if (ocr && typeof ocr === 'object') {
        tesseractResult.printedText = String((ocr as any).printedText || '').trim();
        tesseractResult.handwrittenText = String((ocr as any).handwrittenText || '').trim();
        tesseractResult.combined = String((ocr as any).combined || `${tesseractResult.printedText} ${tesseractResult.handwrittenText}`).trim();
      }
    } catch (err) {
      console.warn('Tesseract OCR failed or not available:', err);
      // continue; we can still build text from structured fields
    }
  }

  const combined = buildFinalReadableText(prescriptionData, tesseractResult);
  if (!combined || !combined.trim()) {
    throw new Error('No readable text found to speak');
  }

  const target = opts?.targetTranslate || 'en';
  let finalToSpeak = combined;

  // If target is non-english, attempt translation via server translate proxy
  if (target && target !== 'en') {
    try {
      const translated = await callTranslateApi(combined, target, 'auto');
      if (translated && translated.trim().length > 3) {
        finalToSpeak = translated.trim();
      } else {
        console.warn('Translation returned empty or too short — falling back to original text');
      }
    } catch (err) {
      console.warn('Translation step failed, speaking original text', err);
    }
  }

  const ttsLang = TTS_LANG_MAP[target] || 'en-IN';
  return { finalText: finalToSpeak, ttsLang };
}
