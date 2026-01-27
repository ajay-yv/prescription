// server/translate_proxy.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // allow frontend during dev. tighten this in production.
app.use(bodyParser.json({ limit: '1mb' }));

// Set provider base using env var so you can swap providers
const PROVIDER_TRANSLATE_BASE = process.env.LIBRETRANSLATE_BASE || 'https://libretranslate.de/translate';

// Proxy translate endpoint
app.post('/api/translate', async (req, res) => {
  try {
    // Expect payload: { q, source, target, format }
    const { q, source = 'en', target, format = 'text' } = req.body;
    if (!q || !target) return res.status(400).json({ error: 'q and target required' });

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
});

// start server if called directly
if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Translate proxy running on http://localhost:${port}`));
}

module.exports = app;
