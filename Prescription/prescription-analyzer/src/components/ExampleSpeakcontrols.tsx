// src/components/ExampleSpeakcontrols.tsx
import React, { useState } from 'react';
import { speakAllFromImageGetText } from '../utils/speakAllText';
import type { PrescriptionData } from '../utils/imageUtils';

const LANG_OPTIONS = [
  { label: 'English', short: 'en' },
  { label: 'Hindi', short: 'hi' },
  { label: 'Tamil', short: 'ta' },
  { label: 'Telugu', short: 'te' },
  { label: 'Kannada', short: 'kn' },
  { label: 'Malayalam', short: 'ml' },
];

export default function ExampleSpeakcontrols({ prescriptionData }: { prescriptionData: PrescriptionData }) {
  const [lang, setLang] = useState<'en'|'hi'|'ta'|'te'|'kn'|'ml'>('en');

  const handleSpeak = async () => {
    try {
      const { finalText, ttsLang } = await speakAllFromImageGetText(prescriptionData, { targetTranslate: lang });
      // finalText is ready — you can pass it to TTS pipeline now (parent or other UI)
      console.log('Text ready to speak:', finalText, 'TTS lang:', ttsLang);
    } catch (err) {
      console.error('Error preparing text to speak', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={lang}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLang(e.target.value as any)}
        className="border px-2 py-1"
      >
        {LANG_OPTIONS.map(o => <option key={o.short} value={o.short}>{o.label}</option>)}
      </select>
      <button onClick={handleSpeak} className="px-3 py-1 bg-indigo-600 text-white rounded">
        Prepare Text
      </button>
    </div>
  );
}
