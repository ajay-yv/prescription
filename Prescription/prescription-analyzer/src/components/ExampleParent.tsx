// src/components/ExampleParent.tsx
import React, { useState } from 'react';
import PrescriptionResults from './PrescriptionResults';
import type { PrescriptionData } from '../utils/imageUtils';
import { speakFromServer, stopServerSpeak } from '../utils/serverTtsClient';
import { speakAllFromImageGetText } from '../utils/speakAllText';
import { useVoiceControls } from '../utils/useVoiceControls';

export default function ExampleParent({
  prescriptionData,
  matchResult
}: {
  prescriptionData: PrescriptionData;
  matchResult?: any;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { playServerAudio, pause, resume, stop } = useVoiceControls();

  const handleSpeak = async () => {
    try {
      setIsSpeaking(true);
      // Build final text (OCR + structured fields + optional translation)
      const { finalText, ttsLang } = await speakAllFromImageGetText(prescriptionData, { targetTranslate: 'en' });

      // Request server TTS
      const tts = await speakFromServer(prescriptionData, finalText, ttsLang, 'mp3');

      if (tts && tts.base64) {
        playServerAudio(
          tts.base64,
          tts.mime,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          (e) => {
            console.error('server audio play error', e);
            setIsSpeaking(false);
          }
        );
      } else {
        // server TTS unavailable - fallback to browser TTS handled elsewhere (or you can call speakWithBrowserTTS here)
        console.warn('Server TTS not available — fallback to browser TTS if implemented.');
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('handleSpeak error', err);
      setIsSpeaking(false);
    }
  };

  const handleStopAll = () => {
    stop(); // stops any created audio element or browser TTS (via hook)
    stopServerSpeak(); // best-effort cancel server-side synth if any
    setIsSpeaking(false);
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <button onClick={handleSpeak} className="px-3 py-1 rounded bg-indigo-600 text-white">
          Speak (Parent)
        </button>

        <button onClick={pause} className="px-3 py-1 rounded bg-gray-200">
          Pause
        </button>

        <button onClick={resume} className="px-3 py-1 rounded bg-gray-200">
          Resume
        </button>

        <button onClick={handleStopAll} className="px-3 py-1 rounded bg-red-500 text-white">
          Stop
        </button>

        <div className="ml-4 text-sm">
          {isSpeaking ? <span className="text-green-600">Speaking…</span> : <span className="text-gray-600">Idle</span>}
        </div>
      </div>

      <PrescriptionResults
        prescriptionData={prescriptionData}
        matchResult={matchResult}
        // If you still want PrescriptionResults' internal Speak button to work,
        // pass an onSpeak that triggers the same parent flow:
        onSpeak={() => void handleSpeak()}
      />
    </div>
  );
}
