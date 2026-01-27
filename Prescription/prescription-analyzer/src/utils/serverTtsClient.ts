// src/utils/serverTtsClient.ts
import type { PrescriptionData } from './imageUtils';

/**
 * Base URL selection:
 * - Prefer REACT_APP_SERVER_BASE (set this in .env.local)
 * - Otherwise use window.location.origin when running in browser
 * - Fallback to http://localhost:5050 for local development / SSR safety
 */
const ENV_BASE =
  typeof process !== 'undefined' && process.env.REACT_APP_SERVER_BASE
    ? process.env.REACT_APP_SERVER_BASE
    : '';

const DEFAULT_FALLBACK = 'http://localhost:5050';

function getApiBase(): string {
  if (ENV_BASE && ENV_BASE.trim().length > 0) return ENV_BASE.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return DEFAULT_FALLBACK;
}

const API_BASE = getApiBase();

export type TtsResponse = { base64: string; mime: string } | null;

/** Convert an ArrayBuffer to a base64 string in chunks (avoids stack overflow on large buffers) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32768
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(sub) as any);
  }
  // btoa expects a binary string
  return btoa(binary);
}

/**
 * Request server TTS to synthesize `text` into audio.
 * Returns { base64, mime } if server produced audio, or null if server didn't provide audio or errored.
 */
export async function speakFromServer(
  _prescriptionDataOrContext: PrescriptionData | any,
  text: string,
  lang = 'en-IN',
  format: 'mp3' | 'ogg' = 'mp3',
  timeoutMs = 15000
): Promise<TtsResponse> {
  if (!text || typeof text !== 'string') return null;

  const url = `${API_BASE}/api/tts`.replace(/\/{2,}/g, '/').replace(':/', '://');

  // AbortController with timeout
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const id = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang, format }),
      signal: controller ? controller.signal : undefined
    });

    if (id) clearTimeout(id);

    if (!resp.ok) {
      // Server didn't produce usable audio (or returned an error) -> caller should fallback
      // Try to read error body for helpful debugging
      try {
        const txt = await resp.text();
        // not throwing here; just log and return null so the app falls back to browser TTS
        // eslint-disable-next-line no-console
        console.warn(`speakFromServer: server returned status ${resp.status}: ${txt}`);
      } catch {
        // ignore
      }
      return null;
    }

    const contentType = (resp.headers.get('content-type') || '').toLowerCase();

    // If server returns JSON with audioBase64 / base64 fields
    if (contentType.includes('application/json')) {
      try {
        const json = await resp.json();
        const b64 = json.audioBase64 || json.base64 || null;
        const mime = json.mime || (format === 'mp3' ? 'audio/mpeg' : 'audio/ogg');
        if (b64 && typeof b64 === 'string') return { base64: b64, mime };
        return null;
      } catch (err) {
        // parsing failed — fall through to binary handling attempt below
        // eslint-disable-next-line no-console
        console.warn('speakFromServer: failed to parse JSON response', err);
        return null;
      }
    }

    // Otherwise assume binary audio stream — convert to base64 and return
    try {
      const ab = await resp.arrayBuffer();
      const base64 = arrayBufferToBase64(ab);
      const mime = contentType || (format === 'mp3' ? 'audio/mpeg' : 'audio/ogg');
      return { base64, mime };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('speakFromServer: failed to read binary audio response', err);
      return null;
    }
  } catch (err: any) {
    // fetch threw (network error, aborted, CORS, etc.)
    if (err && err.name === 'AbortError') {
      // eslint-disable-next-line no-console
      console.warn('speakFromServer: request timed out');
    } else {
      // eslint-disable-next-line no-console
      console.warn('speakFromServer error', err);
    }
    return null;
  } finally {
    if (id) clearTimeout(id);
  }
}

/**
 * Stop any server-side audio playback control we might have triggered from client.
 * This best-effortly cancels browser speechSynthesis; if you used an <audio> element the UI code (useVoiceControls)
 * is responsible for stopping that audio instance.
 */
export function stopServerSpeak(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
