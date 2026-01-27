// server/index.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 4000;
const UPSTREAM_TRANSLATE = process.env.UPSTREAM_TRANSLATE || 'https://libretranslate.de/translate';

app.post('/translate', async (req, res) => {
  try {
    const { q, source = 'auto', target, format = 'text' } = req.body;
    if (!q || !target) return res.status(400).json({ error: 'Missing q or target' });

    const payload = { q, source, target, format };
    const upstreamRes = await fetch(UPSTREAM_TRANSLATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await upstreamRes.text();
    try { return res.status(upstreamRes.status).json(JSON.parse(text)); } catch { return res.status(upstreamRes.status).send(text); }
  } catch (err) {
    console.error('Translate proxy error:', err);
    res.status(500).json({ error: 'Translate proxy failed', details: String(err) });
  }
});

app.post('/tts', async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const tl = lang || 'hi';
    const params = new URLSearchParams({ ie: 'UTF-8', q: text, tl, client: 'tw-ob' });
    const ttsUrl = `https://translate.google.com/translate_tts?${params.toString()}`;

    const r = await fetch(ttsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://translate.google.com/',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('TTS upstream error', r.status, txt);
      return res.status(502).json({ error: 'TTS upstream failed', status: r.status, text: txt });
    }

    const arrayBuffer = await r.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': buffer.length, 'Cache-Control': 'no-cache' });
    res.send(buffer);
  } catch (err) {
    console.error('TTS proxy error:', err);
    res.status(500).json({ error: 'TTS proxy failed', details: String(err) });
  }
});

app.get('/', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
  console.log(`Translate upstream: ${UPSTREAM_TRANSLATE}`);
});
