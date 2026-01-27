// src/services/ttsService.ts
export type TTSOptions = {
  lang?: string; // e.g. 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'en'
  voiceName?: string | null; // optional override
  rate?: number; // 0.1 - 10
  pitch?: number; // 0 - 2
  fallbackServerUrl?: string | null; // POST { text, lang } returns audio (blob)
  timeoutMs?: number;
};

// map short language codes to speech-synthesis locales where appropriate
const LANG_TO_LOCALE: Record<string, string> = {
  hi: 'hi-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  en: 'en-US'
};

function findBestVoice(voices: SpeechSynthesisVoice[], locale: string, desiredName?: string | null) {
  if (desiredName) {
    const byName = voices.find(v => v.name.toLowerCase().includes(desiredName.toLowerCase()));
    if (byName) return byName;
  }
  // exact locale match
  const exact = voices.find(v => v.lang?.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;
  // startsWith locale (e.g., 'hi' maybe 'hi-IN')
  const starts = voices.find(v => v.lang?.toLowerCase().startsWith(locale.split('-')[0]));
  if (starts) return starts;
  // fallback: prefer english
  return voices.find(v => v.lang?.toLowerCase().startsWith('en')) || voices[0] || null;
}

/**
 * Speak text in the browser using Web Speech API if available.
 * If not available and a fallbackServerUrl is provided, it will POST { text, lang } and expect an audio blob back.
 */
export async function speakText(text: string, lang: string = 'hi', opts: TTSOptions = {}): Promise<void> {
  if (!text) return Promise.resolve();

  const locale = LANG_TO_LOCALE[lang] ?? lang;

  // Browser Web Speech API path
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
    return new Promise<void>((resolve, reject) => {
      const synth = window.speechSynthesis as SpeechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = locale;
      if (opts.rate) utter.rate = opts.rate;
      if (opts.pitch) utter.pitch = opts.pitch;

      // ensure voices loaded — some browsers load async
      const loadAndSpeak = () => {
        const voices = synth.getVoices();
        const voice = findBestVoice(voices, locale, opts.voiceName ?? null);
        if (voice) utter.voice = voice;
        utter.onend = () => resolve();
        utter.onerror = (e) => {
          console.error('TTS utterance error', e);
          reject(e);
        };
        try {
          synth.cancel(); // stop any current speech to avoid overlaps
          synth.speak(utter);
        } catch (err) {
          reject(err);
        }
      };

      const voices = synth.getVoices();
      if (voices.length > 0) {
        loadAndSpeak();
      } else {
        // some browsers fire onvoiceschanged
        const onVoicesChanged = () => {
          try {
            loadAndSpeak();
          } finally {
            synth.removeEventListener('voiceschanged', onVoicesChanged);
          }
        };
        synth.addEventListener('voiceschanged', onVoicesChanged);
        // set timeout fallback
        setTimeout(() => {
          try {
            loadAndSpeak();
          } catch (e) {
            reject(e);
          }
        }, 1200);
      }
    });
  }

  // Fallback server path: POST to REACT_APP_TTS_API_URL or opts.fallbackServerUrl
  const serverUrl = opts.fallbackServerUrl || process.env.REACT_APP_TTS_API_URL || null;
  if (!serverUrl) {
    console.warn('No Web Speech API available and no REACT_APP_TTS_API_URL configured for fallback TTS. Skipping speak.');
    return Promise.resolve();
  }

  try {
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang })
    });
    if (!res.ok) throw new Error('TTS server returned ' + res.status);
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    await new Promise<void>((resolv, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolv();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        reject(e);
      };
      audio.play().catch(reject);
    });
  } catch (err) {
    console.error('TTS fallback server failed:', err);
    return Promise.resolve(); // don't throw to avoid breaking UI
  }
}
