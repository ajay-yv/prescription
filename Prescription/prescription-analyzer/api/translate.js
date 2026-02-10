// api/translate.js - Vercel Serverless Function
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// Set provider base using env var so you can swap providers
const PROVIDER_TRANSLATE_BASE = process.env.LIBRETRANSLATE_BASE || 'https://libretranslate.de/translate';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Expect payload: { q, source, target, format }
    const { q, source = 'en', target, format = 'text' } = req.body;
    
    if (!q || !target) {
      return res.status(400).json({ error: 'q and target required' });
    }

    const response = await fetch(PROVIDER_TRANSLATE_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, source, target, format })
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      return res.status(response.status).send(bodyText || `Upstream error ${response.status}`);
    }

    // pass through JSON body (expected { translatedText: "..." } from LibreTranslate)
    const body = await response.json();
    return res.json(body);
  } catch (err) {
    console.error('translate proxy error', err);
    return res.status(500).json({ error: 'translate proxy error', details: String(err) });
  }
}
