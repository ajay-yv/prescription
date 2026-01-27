// src/utils/translate.ts
// Robust, safe translation helper (TypeScript).
// Reads runtime/build-time config in a parser-friendly way:
//
// 1) runtime override: window.__TRANSLATE_ENDPOINT (set in index.html)
// 2) build-time (CRA): REACT_APP_TRANSLATE_API_URL and REACT_APP_TRANSLATE_API_KEY via globalThis.process.env (only if available)
// 3) fallback: '/api/translate' (recommended: implement server-side proxy)
// 4) last resort: direct LibreTranslate (likely blocked / requires API key)
//
// Also reads optional REACT_APP_TTS_API_URL if you want to wire TTS later (not used here).
//
// Expected request shape: { q, source, target, format: 'text' }
// Expected response shape (LibreTranslate style): { translatedText: string }

export type LangCode = 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml' | string;

interface TranslateResponse {
  translatedText: string;
}

const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds
const MAX_CHARS = 20000; // safety limit for payload length

// Safe read of runtime / build config (avoids direct process/import.meta usage)
function readRuntimeConfig(): { endpoint?: string; apiKey?: string; ttsUrl?: string } {
  // runtime override (set this in public/index.html before app script if you want)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtime = typeof window !== 'undefined' ? (window as any).__TRANSLATE_ENDPOINT : undefined;
    if (runtime && typeof runtime === 'string' && runtime.trim().length > 0) {
      // optional API key runtime override
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtimeKey = typeof window !== 'undefined' ? (window as any).__TRANSLATE_API_KEY : undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtimeTts = typeof window !== 'undefined' ? (window as any).__TTS_API_URL : undefined;
      return { endpoint: runtime, apiKey: runtimeKey, ttsUrl: runtimeTts };
    }
  } catch {
    // ignore
  }

  // Try reading CRA-style env injected at build time (globalThis.process.env)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeProc = (globalThis as any).process;
    if (maybeProc && maybeProc.env) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = maybeProc.env as any;
      const endpoint = typeof env.REACT_APP_TRANSLATE_API_URL === 'string' && env.REACT_APP_TRANSLATE_API_URL.trim().length > 0
        ? env.REACT_APP_TRANSLATE_API_URL
        : undefined;
      const apiKey = typeof env.REACT_APP_TRANSLATE_API_KEY === 'string' && env.REACT_APP_TRANSLATE_API_KEY.trim().length > 0
        ? env.REACT_APP_TRANSLATE_API_KEY
        : undefined;
      const ttsUrl = typeof env.REACT_APP_TTS_API_URL === 'string' && env.REACT_APP_TTS_API_URL.trim().length > 0
        ? env.REACT_APP_TTS_API_URL
        : undefined;
      if (endpoint || apiKey || ttsUrl) return { endpoint, apiKey, ttsUrl };
    }
  } catch {
    // ignore
  }

  return {};
}

function getConfiguredEndpointAndKey(): { endpoint: string; apiKey?: string; ttsUrl?: string } {
  const cfg = readRuntimeConfig();

  // prefer explicit endpoint if provided
  if (cfg.endpoint && typeof cfg.endpoint === 'string' && cfg.endpoint.trim().length > 0) {
    return { endpoint: cfg.endpoint.trim(), apiKey: cfg.apiKey, ttsUrl: cfg.ttsUrl };
  }

  // fallback to relative proxy path (recommended)
  return { endpoint: '/api/translate', apiKey: cfg.apiKey, ttsUrl: cfg.ttsUrl };
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return resp;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * translateText
 * @param text string to translate (plain)
 * @param targetLang target language code (e.g. 'hi')
 * @param sourceLang optional source language (default 'auto')
 * @returns translated text (string)
 *
 * Notes:
 * - If you set REACT_APP_TRANSLATE_API_URL (or window.__TRANSLATE_ENDPOINT), the client will POST there.
 *   If you also set REACT_APP_TRANSLATE_API_KEY, it will be sent as 'x-api-key' header.
 * - If configured endpoint fails and is '/api/translate', this function will attempt direct LibreTranslate as a last-resort.
 * - For production use, implement a server-side proxy that calls your chosen provider (Google/DeepL/LibreTranslate) and keep API keys on server.
 */
export async function translateText(
  text: string,
  targetLang: LangCode,
  sourceLang = 'auto'
): Promise<string> {
  if (!text || text.trim().length === 0) return '';

  const payloadText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  const { endpoint, apiKey } = getConfiguredEndpointAndKey();

  const body = {
    q: payloadText,
    source: sourceLang,
    target: targetLang,
    format: 'text'
  };

  const requestOptions = (url: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
      // common header name; adapt if your backend expects different header or body field
      headers['x-api-key'] = apiKey;
    }
    return {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    } as RequestInit;
  };

  async function doRequest(urlToCall: string) {
    const resp = await fetchWithTimeout(urlToCall, requestOptions(urlToCall), DEFAULT_TIMEOUT_MS);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`Upstream returned ${resp.status} ${resp.statusText} — ${txt}`);
    }
    const json = (await resp.json()) as TranslateResponse;
    if (!json || typeof json.translatedText !== 'string') {
      throw new Error('Upstream returned unexpected response shape (expected { translatedText })');
    }
    return json.translatedText;
  }

  // Try configured endpoint first
  try {
    return await doRequest(endpoint);
  } catch (err: any) {
    const firstError = String(err?.message || err || 'Unknown error');

    // If endpoint is not the default '/api/translate', bubble up the error (no fallback)
    if (endpoint && endpoint !== '/api/translate') {
      throw new Error(`[translateText] configured endpoint (${endpoint}) failed: ${firstError}`);
    }

    // If we get here, configured endpoint was the default '/api/translate' and it failed (proxy missing, etc.)
    // Attempt direct LibreTranslate as last resort (note: LibreTranslate now requires API key and may be blocked by CORS)
    try {
      const fallbackUrl = 'https://libretranslate.com/translate';
      return await doRequest(fallbackUrl);
    } catch (err2: any) {
      const secondError = String(err2?.message || err2 || 'Unknown fallback error');
      throw new Error(
        `[translateText] proxy (${endpoint}) failed: ${firstError}; fallback libretranslate failed: ${secondError}. ` +
        `Likely causes: proxy not running, CORS blocked, or missing API key.`
      );
    }
  }
}
