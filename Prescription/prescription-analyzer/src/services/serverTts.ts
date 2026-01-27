// src/services/serverTts.ts
// Simple client helper that calls /api/tts (server) and plays returned audio blob.

export async function playServerTTS(text: string, lang = 'hi-IN'): Promise<void> {
  if (!text) return;
  // adjust URL if your server runs on a different host/port in development
  const resp = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang })
  });
  if (!resp.ok) throw new Error(`TTS server failed: ${resp.status}`);
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
  // revoke after a short delay to avoid cutting playback on some browsers
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
