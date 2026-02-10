// api/text-to-speech.js - Vercel Serverless Function
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

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
        const { text, lang = 'en-IN', format = 'mp3' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'text required' });
        }

        // For Vercel deployment, we'll return a message to use browser TTS
        // Google Cloud TTS requires service account credentials which are complex to set up in serverless
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
            return res.status(501).json({
                error: 'server-tts-not-configured',
                hint: 'Enable USE_GOOGLE_TTS=true and set GOOGLE_APPLICATION_CREDENTIALS to use server TTS OR use browser SpeechSynthesis'
            });
        }
    } catch (err) {
        console.error('tts error', err);
        return res.status(500).json({ error: 'tts error', detail: String(err) });
    }
}
