// src/utils/tts.ts
// Improved browser TTS utilities with safer voice selection, clearer lifecycle callbacks,
// and small robustness improvements (voices availability, guarded calls).

/**
 * Split text into chunks (prefer sentence boundaries) with a soft max length.
 * Returns an array of non-empty chunks.
 */
export function chunkText(text: string, maxLen = 180): string[] {
  const raw = String(text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return [];

  // Try split by sentence endings first
  const sentenceParts = raw.match(/[^.!?]+[.!?]*/g) || [raw];

  const chunks: string[] = [];
  let current = '';

  for (const part of sentenceParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
      continue;
    }

    if (current) {
      chunks.push(current);
      current = trimmed;
    } else if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
      current = '';
    } else {
      // long sentence: fall back to space-based slicing
      let pos = 0;
      while (pos < trimmed.length) {
        let end = Math.min(pos + maxLen, trimmed.length);
        // try to break at last space
        if (end < trimmed.length) {
          const lastSpace = trimmed.lastIndexOf(' ', end);
          if (lastSpace > pos) end = lastSpace;
        }
        const slice = trimmed.slice(pos, end).trim();
        if (slice) chunks.push(slice);
        pos = end + 1;
      }
      current = '';
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Wait for voices to be loaded and return them.
 * Some browsers populate voices asynchronously; this helper resolves when available.
 */
function getVoicesAsync(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return resolve([]);
    }
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices && voices.length) return resolve(voices);

    let mounted = true;
    const onVoicesChanged = () => {
      if (!mounted) return;
      const v = synth.getVoices();
      mounted = false;
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(v || []);
    };
    synth.addEventListener('voiceschanged', onVoicesChanged);

    // fallback: timeout -> resolve whatever is available
    setTimeout(() => {
      if (!mounted) return;
      mounted = false;
      synth.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(synth.getVoices() || []);
    }, timeoutMs);
  });
}

/**
 * Speak text using the browser SpeechSynthesis API.
 *
 * - text: the content to speak
 * - lang: locale string like 'en-IN' or 'hi-IN'
 * - onStart: called when first utterance starts
 * - onEnd: called when all utterances finish
 * - onError: called if any utterance errors (receives the error event)
 *
 * The promise resolves on normal completion, rejects when SpeechSynthesis is unavailable
 * or if an immediate fatal error occurs.
 */
export async function speakWithBrowserTTS(
  text: string,
  lang = 'en-IN',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    const err = new Error('SpeechSynthesis not available');
    onError?.(err);
    return Promise.reject(err);
  }

  const synth = window.speechSynthesis;

  // cancel any ongoing speech to start fresh
  try {
    synth.cancel();
  } catch (e) {
    // ignore
  }

  const chunks = chunkText(text || '', 180);
  if (!chunks.length) {
    onEnd?.();
    return Promise.resolve();
  }

  // ensure voices are loaded, then pick an appropriate voice (if available)
  const voices = await getVoicesAsync();
  const preferredLang = (lang || 'en-IN').toLowerCase();
  const chosenVoice =
    voices.find((v) => (v.lang || '').toLowerCase().startsWith(preferredLang.split('-')[0])) ||
    voices.find((v) => (v.lang || '').toLowerCase() === preferredLang) ||
    voices.find((v) => (v.lang || '').toLowerCase().startsWith('en')) ||
    undefined;

  return new Promise((resolve, reject) => {
    let index = 0;
    let started = false;
    let cancelled = false;

    const speakNext = () => {
      if (cancelled) {
        onEnd?.();
        return resolve();
      }

      if (index >= chunks.length) {
        onEnd?.();
        return resolve();
      }

      const utter = new SpeechSynthesisUtterance(chunks[index]);
      utter.lang = lang;
      if (chosenVoice) utter.voice = chosenVoice;

      utter.onstart = () => {
        if (!started) {
          started = true;
          onStart?.();
        }
      };

      utter.onend = () => {
        index += 1;
        // tiny gap between chunks
        setTimeout(speakNext, 60);
      };

      utter.onerror = (ev) => {
        console.error('SpeechSynthesis utterance error', ev);
        onError?.(ev);
        // move on to next chunk instead of aborting entire flow
        index += 1;
        setTimeout(speakNext, 60);
      };

      try {
        synth.speak(utter);
      } catch (err) {
        console.error('speechSynthesis.speak failed', err);
        onError?.(err);
        // treat as fatal for this run
        cancelled = true;
        onEnd?.();
        return reject(err);
      }
    };

    // Start speaking
    try {
      speakNext();
    } catch (err) {
      onError?.(err);
      return reject(err);
    }
  });
}

/**
 * Stop any in-progress browser TTS immediately.
 */
export function stopBrowserTTS(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }
}

/**
 * Pause browser TTS (if supported)
 */
export function pauseBrowserTTS(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Resume browser TTS (if paused)
 */
export function resumeBrowserTTS(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    // ignore
  }
}
