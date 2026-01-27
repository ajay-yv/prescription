// src/services/translateService.ts
export type TranslateOptions = {
  apiUrl?: string; // override via param
  apiKey?: string | null;
  timeoutMs?: number;
};

const DEFAULT_LIBRE = 'https://libretranslate.de/translate';
const DEFAULT_TIMEOUT = 8000;

function timeoutFetch(input: RequestInfo, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT) {
  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('fetch-timeout')), timeoutMs);
    fetch(input, init)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Translate text -> targetLang (ISO: 'hi','bn','ta','te','mr','gu','kn','en', etc.)
 * Will try:
 * 1) REACT_APP_TRANSLATE_API_URL (if provided) - POST JSON { q, source: 'auto', target, format:'text' }
 * 2) Public LibreTranslate instance
 * 3) Fallback: returns original text (not throwing) but logs the cause.
 */
export async function translateTextAPI(
  text: string,
  targetLang: string,
  opts: TranslateOptions = {}
): Promise<string> {
  if (!text) return '';
  const apiUrl = opts.apiUrl || process.env.REACT_APP_TRANSLATE_API_URL || DEFAULT_LIBRE;
  const apiKey = opts.apiKey ?? process.env.REACT_APP_TRANSLATE_API_KEY ?? null;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;

  const payload = {
    q: text,
    source: 'auto',
    target: targetLang,
    format: 'text'
  };

  // helper to call a specific URL
  const callUrl = async (url: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const res = await timeoutFetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      mode: 'cors'
    }, timeoutMs);
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Translate API ${url} returned ${res.status} ${res.statusText}: ${txt}`);
    }
    const data = await res.json().catch(() => null);
    return data;
  };

  // Try configured endpoint first (if set) then fallback to public one
  const attempted: string[] = [];
  const endpoints = [];
  if (process.env.REACT_APP_TRANSLATE_API_URL) endpoints.push(process.env.REACT_APP_TRANSLATE_API_URL);
  if (opts.apiUrl && opts.apiUrl !== process.env.REACT_APP_TRANSLATE_API_URL) endpoints.push(opts.apiUrl);
  if (!endpoints.includes(DEFAULT_LIBRE)) endpoints.push(DEFAULT_LIBRE);

  for (const url of endpoints) {
    try {
      attempted.push(url);
      const data = await callUrl(url);
      // LibreTranslate returns { translatedText: "..." }
      if (data && typeof data.translatedText === 'string') return data.translatedText;
      // Some endpoints may return { data: { translations: [{ translatedText: '...' }] } }
      if (data?.data?.translations?.[0]?.translatedText) return data.data.translations[0].translatedText;
      // Try common fallback shapes
      if (data?.translatedText) return data.translatedText;
      if (typeof data === 'string') return data;
      // If shape unknown, stringify
      return String(data ?? '');
    } catch (err: any) {
      console.warn('translateTextAPI: attempt failed for', url, err?.message || err);
      // continue to next endpoint
    }
  }

  console.warn('translateTextAPI: all endpoints failed:', attempted.join(', '));
  // final fallback: return original text (so UI can still show something)
  return text;
}
