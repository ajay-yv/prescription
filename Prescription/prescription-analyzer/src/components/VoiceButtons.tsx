// src/components/VoiceButtons.tsx
import React, { useState } from 'react';
import type { PrescriptionData } from '../utils/imageUtils';
import { speakAllFromImageGetText } from '../utils/speakAllText';
import { speakFromServer } from '../utils/serverTtsClient';
import { speakWithBrowserTTS } from '../utils/tts';
import { useVoiceControls } from '../utils/useVoiceControls';

const LANG_OPTIONS = [
  { label: 'English', short: 'en' },
  { label: 'Hindi', short: 'hi' },
  { label: 'Tamil', short: 'ta' },
  { label: 'Telugu', short: 'te' },
  { label: 'Kannada', short: 'kn' },
  { label: 'Malayalam', short: 'ml' }
];

export default function VoiceButtons({ prescriptionData }: { prescriptionData: PrescriptionData }) {
  const [langShort, setLangShort] = useState<'en'|'hi'|'ta'|'te'|'kn'|'ml'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { playServerAudio, pause, resume, stop } = useVoiceControls();

  const handleSpeak = async () => {
    try {
      setIsSpeaking(true);

      // Get final text + TTS lang
      const { finalText, ttsLang } = await speakAllFromImageGetText(prescriptionData, { targetTranslate: langShort });

      // Request server TTS
      const tts = await speakFromServer(prescriptionData as any, finalText, ttsLang, 'mp3');

      if (tts && tts.base64) {
        playServerAudio(tts.base64, tts.mime, () => setIsSpeaking(true), () => setIsSpeaking(false), (e) => {
          console.error('server audio error', e);
          setIsSpeaking(false);
        });
      } else {
        // fallback to browser TTS
        await speakWithBrowserTTS(finalText, ttsLang, () => setIsSpeaking(true), () => setIsSpeaking(false), (e) => {
          console.error('browser tts error', e);
          setIsSpeaking(false);
        });
      }
    } catch (err) {
      console.error('speak flow error', err);
      setIsSpeaking(false);
    }
  };

  const handlePause = () => { pause(); };
  const handleResume = () => { resume(); };
  const handleStop = () => {
    stop();
    setIsSpeaking(false);
  };

  return (
    <div className="flex items-center gap-2">
      <select value={langShort} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLangShort(e.target.value as any)} className="border px-2 py-1 rounded">
        {LANG_OPTIONS.map(l => <option key={l.short} value={l.short}>{l.label}</option>)}
      </select>

      <button onClick={handleSpeak} className="px-3 py-1 bg-green-600 text-white rounded">Speak</button>
      <button onClick={handlePause} className="px-3 py-1 bg-yellow-400 text-white rounded">Pause</button>
      <button onClick={handleResume} className="px-3 py-1 bg-blue-500 text-white rounded">Resume</button>
      <button onClick={handleStop} className="px-3 py-1 bg-red-600 text-white rounded">Stop</button>

      <div className="ml-4 text-sm">
        {isSpeaking ? <span className="text-green-600">Speaking…</span> : <span className="text-gray-600">Idle</span>}
      </div>
    </div>
  );
}
