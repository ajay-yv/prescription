// src/utils/ttsLang.ts
// Maps short language codes used in the UI to TTS locale codes.
// Named export `getTtsLang` (matches App.tsx import).

export function getTtsLang(code: string): string {
  switch ((code || '').toLowerCase()) {
    case 'hi': return 'hi-IN';
    case 'ta': return 'ta-IN';
    case 'te': return 'te-IN';
    case 'kn': return 'kn-IN';
    case 'ml': return 'ml-IN';
    case 'en': return 'en-IN';
    default: return 'en-IN';
  }
}
