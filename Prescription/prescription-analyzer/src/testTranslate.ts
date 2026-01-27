// src/testTranslate.ts
type TestResult = {
  ok: boolean;
  status?: number;
  provider: string;
  body?: any;
  error?: string;
};

/** Helpers */
async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
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

const ENV_BACKEND = (typeof process !== 'undefined' && process.env.REACT_APP_SERVER_BASE) ? process.env.REACT_APP_SERVER_BASE.replace(/\/$/, '') : '';
const BACKEND_BASE = ENV_BACKEND || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5050');

/**
 * Default external providers (only used if backend fails)
 * Keep them as full translate endpoints (not proxied).
 */
const DEFAULT_PUBLIC_PROVIDERS = [
  (typeof process !== 'undefined' && process.env.REACT_APP_TRANSLATE_API_URL) || '',
  'https://libretranslate.de/translate',
  'https://libretranslate.com/translate'
].filter(Boolean);

/**
 * Try the configured backend (health -> translate) first.
 * If backend is reachable but translate returns an upstream error, that is surfaced.
 * If backend fails or is unreachable, try public providers list.
 */
export async function testTranslationConnection(): Promise<TestResult> {
  const testText = 'Hello world';
  const target = 'hi';

  // 1) Try backend health endpoint first
  const backendHealthUrl = `${BACKEND_BASE}/_health`;
  try {
    const healthResp = await fetchWithTimeout(backendHealthUrl, {}, 3000);
    if (healthResp.ok) {
      // Backend healthy — try backend translate route
      const translateUrl = `${BACKEND_BASE}/api/translate`;
      try {
        const resp = await fetchWithTimeout(translateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: testText, targetLang: target })
        }, 5000);

        const txt = await resp.text().catch(() => '');
        let body: any = txt;
        try { body = txt ? JSON.parse(txt) : txt; } catch { /* leave as text */ }

        if (resp.ok) {
          console.info(`✅ Backend translate succeeded (${translateUrl})`);
          return { ok: true, status: resp.status, provider: translateUrl, body };
        } else {
          console.warn(`⚠️ Backend translate returned ${resp.status}`, body);
          return { ok: false, status: resp.status, provider: translateUrl, body, error: 'backend translate returned non-OK status' };
        }
      } catch (err: any) {
        const message = err && err.message ? err.message : String(err);
        console.warn(`❌ Backend translate request failed (${backendHealthUrl} was healthy):`, message);
        // fall through to public providers
      }
    } else {
      console.warn(`❌ Backend health check returned ${healthResp.status} at ${backendHealthUrl}`);
      // fall through to public providers
    }
  } catch (err) {
    // health check failed — backend likely unreachable
    const message = err && (err as any).message ? (err as any).message : String(err);
    console.warn(`❌ Backend health check failed (${backendHealthUrl}):`, message);
  }

  // 2) Try public providers (LibreTranslate etc.)
  const apiKeyRaw = (typeof process !== 'undefined' ? process.env.REACT_APP_TRANSLATE_API_KEY : undefined) || '';
  let lastError: any = null;

  for (const providerRaw of DEFAULT_PUBLIC_PROVIDERS) {
    const provider = providerRaw.trim();
    if (!provider) continue;

    try {
      // Many public endpoints expect body { q, source, target, format } (LibreTranslate)
      const payload = JSON.stringify({ q: testText, source: 'auto', target, format: 'text', api_key: apiKeyRaw || undefined });

      const res = await fetchWithTimeout(provider, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }, 5000);

      const text = await res.text().catch(() => '');
      let body: any = text;
      try { body = text ? JSON.parse(text) : text; } catch { /* leave as text */ }

      if (res.ok) {
        console.info(`✅ Public provider succeeded: ${provider}`);
        return { ok: true, status: res.status, provider, body };
      } else {
        console.warn(`⚠️ Public provider ${provider} returned ${res.status}`, body);
        lastError = { provider, status: res.status, body };
        continue;
      }
    } catch (err: any) {
      const msg = err && err.message ? err.message : String(err);
      console.warn(`❌ Public provider ${provider} failed:`, msg);
      lastError = { provider, error: msg };
      continue;
    }
  }

  // All providers failed
  const providerName = lastError && lastError.provider ? lastError.provider : 'none';
  const errorText = lastError && (lastError.error || lastError.body) ? (lastError.error || JSON.stringify(lastError.body)) : 'All providers failed';
  const result: TestResult = { ok: false, provider: providerName, error: errorText, body: lastError };
  console.error('Translation test summary - all providers failed:', result);
  return result;
}
