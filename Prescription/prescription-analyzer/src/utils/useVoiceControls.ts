// src/utils/useVoiceControls.ts
import { useRef, useCallback } from 'react';
import { stopBrowserTTS, pauseBrowserTTS, resumeBrowserTTS } from './tts';

/**
 * Hook that provides controls to play server-generated audio (base64) and
 * coordinate with browser SpeechSynthesis fallback.
 *
 * API:
 *  - playServerAudio(base64, mime, onStart?, onEnd?, onError?, options?)
 *  - pause()
 *  - resume()
 *  - stop()
 */
type OnStart = () => void;
type OnEnd = () => void;
type OnError = (err: any) => void;
type PlayOptions = { volume?: number };

export function useVoiceControls() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeUrl = useCallback((url?: string | null) => {
    try {
      if (url) URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, []);

  const clearAudioRef = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        /* ignore */
      }
      try {
        audioRef.current.src = '';
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      revokeUrl(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [revokeUrl]);

  /**
   * Play server audio encoded as base64. If an audio is already playing, it will be stopped.
   * onStart/onEnd/onError callbacks are optional.
   * options: { volume?: number } (0.0 - 1.0)
   */
  const playServerAudio = useCallback(
    (base64: string, mime: string, onStart?: OnStart, onEnd?: OnEnd, onError?: OnError, options?: PlayOptions) => {
      // defensive validation
      if (!base64 || typeof base64 !== 'string') {
        try { onError?.(new Error('Invalid audio base64')); } catch { /* ignore */ }
        return;
      }

      // stop any existing audio + browser TTS to avoid overlap
      clearAudioRef();
      try { stopBrowserTTS(); } catch { /* ignore */ }

      try {
        // decode base64 to bytes (atob may throw)
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes.buffer], { type: mime || 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        if (options?.volume !== undefined && typeof options.volume === 'number') {
          try {
            audio.volume = Math.max(0, Math.min(1, options.volume));
          } catch {
            // ignore if not supported
          }
        }

        audioRef.current = audio;

        audio.onplay = () => {
          try { onStart?.(); } catch { /* ignore */ }
        };

        audio.onended = () => {
          try {
            onEnd?.();
          } catch {
            /* ignore */
          } finally {
            // cleanup
            clearAudioRef();
          }
        };

        audio.onerror = (ev) => {
          try { onError?.(ev); } catch { /* ignore */ }
          clearAudioRef();
        };

        // attempt to play; modern browsers may require user gesture
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err) => {
            try { onError?.(err); } catch { /* ignore */ }
            clearAudioRef();
          });
        }
      } catch (err) {
        try { onError?.(err); } catch { /* ignore */ }
        clearAudioRef();
      }
    },
    [clearAudioRef]
  );

  const pause = useCallback(() => {
    try {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        return;
      }
    } catch {
      // ignore
    }

    try {
      // pause browser TTS if playing
      pauseBrowserTTS();
    } catch {
      // ignore
    }
  }, []);

  const resume = useCallback(() => {
    try {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        return;
      }
    } catch {
      // ignore
    }

    try {
      // resume browser TTS if paused
      resumeBrowserTTS();
    } catch {
      // ignore
    }
  }, []);

  const stop = useCallback(() => {
    // stop audio element
    try {
      clearAudioRef();
    } catch {
      // ignore
    }

    // ensure browser TTS stopped as well
    try {
      stopBrowserTTS();
    } catch {
      // ignore
    }
  }, [clearAudioRef]);

  return { playServerAudio, pause, resume, stop };
}
