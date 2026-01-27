// src/services/testTranslate.ts
export async function testTranslationConnection(url?: string): Promise<{ ok: boolean; message?: string }> {
  const testUrl = url || process.env.REACT_APP_TRANSLATE_API_URL || 'https://libretranslate.de/translate';
  try {
    // make a small request (not a full translate payload) to check connectivity
    const res = await fetch(testUrl, {
      method: 'OPTIONS',
      mode: 'cors'
    });
    return { ok: res.ok, message: `status ${res.status}` };
  } catch (err: any) {
    return { ok: false, message: err?.message ?? String(err) };
  }
}
