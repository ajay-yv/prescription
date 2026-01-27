// server/translate_tts.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const LIBRETRANSLATE_BASE = process.env.LIBRETRANSLATE_BASE || 'https://libretranslate.com';

// Allowed languages (only the six)
const SUPPORTED = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam'
};

// POST /api/translate
// body: { text: string, targetLang: 'hi'|'ta'|'te'|'kn'|'ml'|'en', sourceLang?: 'auto'|'en'|... }
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLang = 'en', sourceLang = 'auto' } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    if (!SUPPORTED[targetLang]) return res.status(400).json({ error: 'unsupported target language' });

    const resp = await fetch(`${LIBRETRANSLATE_BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('translate provider error', resp.status, txt);
      return res.status(502).json({ error: 'translation provider error', detail: txt });
    }
    const j = await resp.json();
    // LibreTranslate returns { translatedText: "..." }
    return res.json({ translatedText: j.translatedText || j.translated_text || '' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal error', detail: String(err) });
  }
});

// POST /api/tts
// body: { text: string, lang: 'hi-IN'|'ta-IN'|'te-IN'|'kn-IN'|'ml-IN'|'en-IN', format?: 'mp3'|'ogg' }
// Requires USE_GOOGLE_TTS=true and correct GOOGLE_APPLICATION_CREDENTIALS env to use Google TTS.
app.post('/api/tts', async (req, res) => {
  try {
    const { text, lang = 'en-IN', format = 'mp3' } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    if (process.env.USE_GOOGLE_TTS === 'true') {
      const textToSpeech = require('@google-cloud/text-to-speech');
      const client = new textToSpeech.TextToSpeechClient();

      const audioEncoding = format === 'mp3' ? 'MP3' : 'OGG_OPUS';
      const request = {
        input: { text },
        voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding },
      };

      const [response] = await client.synthesizeSpeech(request);
      const audioBase64 = response.audioContent.toString('base64');
      const mime = format === 'mp3' ? 'audio/mpeg' : 'audio/ogg';
      return res.json({ audioBase64, mime });
    } else {
      return res.status(501).json({ error: 'server-tts-not-configured', hint: 'Enable USE_GOOGLE_TTS=true and set GOOGLE_APPLICATION_CREDENTIALS to use server TTS OR use browser SpeechSynthesis' });
    }
  } catch (err) {
    console.error('tts error', err);
    return res.status(500).json({ error: 'tts error', detail: String(err) });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Translate/TTS server running on ${PORT}`));
