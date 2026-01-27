// src/components/professionalTranslator.tsx
import React, { useEffect, useState } from 'react';
import { FileText, Languages } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { translateText, LangCode } from '../utils/translate';
import { PrescriptionData, MatchResult } from '../utils/imageUtils';

// Demo image path (your environment supplies this file)
const IMAGE_PREVIEW_URL = '/mnt/data/8ee6cb04-4a73-4652-9dfe-32e67639d607.jpeg';

const LANGS: { code: LangCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' }
];

interface Props {
  imageUrl?: string;
  onSpeak?: (text: string, lang: LangCode) => void;
  matchResult?: MatchResult | null;
}

const ensureString = (v?: string) => (v || '');

export const ProfessionalTranslator: React.FC<Props> = ({
  imageUrl = IMAGE_PREVIEW_URL,
  onSpeak,
  matchResult = null
}) => {
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrRunning, setOcrRunning] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);

  const [selectedLangs, setSelectedLangs] = useState<Record<LangCode, boolean>>({ en: true, hi: true });
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Run OCR when imageUrl changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setOcrRunning(true);
      setOcrError(null);
      setOcrText('');
      try {
        const res = await Tesseract.recognize(imageUrl, 'eng', { logger: () => {} });
        if (cancelled) return;
        setOcrText(res.data.text || '');
      } catch (err: any) {
        if (cancelled) return;
        console.error('OCR error', err);
        setOcrError(String(err?.message || err || 'OCR failed'));
      } finally {
        if (!cancelled) setOcrRunning(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [imageUrl]);

  // Heuristic parser: OCR -> structured PrescriptionData
  useEffect(() => {
    if (!ocrText) return;

    const lines = ocrText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const meds: string[] = [];
    const dosage: string[] = [];
    const instructions: string[] = [];
    let patientName = '';
    let doctorName = '';
    let date = '';

    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/;

    for (const ln of lines) {
      const l = ln.toLowerCase();

      if (!date && dateRegex.test(ln)) { date = ln; continue; }
      if (!doctorName && /\bdr\.?\b|hospital|clinic|md\b/.test(l)) { doctorName = ln; continue; }
      if (!patientName && /patient|name|patient:|pt\.|mr\.|mrs\.|ms\.|age\b/.test(l)) {
        const parts = ln.split(':'); patientName = parts.length > 1 ? parts.slice(1).join(':').trim() : ln; continue;
      }
      if (/\b(tab|tablet|cap|capsule|syp|syrup|drops|ointment|mg|ml|tds|bd|od|hs)\b/.test(l)) { meds.push(ln); continue; }
      if (/\b\d+\s?(mg|ml)\b|once|twice|daily|week|bd|tds|od|hs/.test(l)) {
        if (meds.length > dosage.length) dosage.push(ln); else instructions.push(ln);
        continue;
      }
      if (ln.length > 3 && ln.length < 120) {
        if (meds.length && Math.random() > 0.6) dosage.push(ln); else instructions.push(ln);
      }
    }

    const structured: PrescriptionData = {
      id: '',
      image: imageUrl,
      hash: '',
      isTrainedData: false,

      name: imageUrl,
      extractedText: ocrText,
      patientName: patientName || 'Unknown',
      doctorName: doctorName || 'Unknown',
      date: date || new Date().toLocaleDateString(),
      medications: meds.length ? meds : ['(unable to parse medications — see raw text)'],
      dosage: dosage.length ? dosage : meds.map(() => '(dosage not parsed)'),
      instructions: instructions.length ? instructions : ['(instructions not parsed)'],
      uploadedAt: Date.now()
    };

    setPrescription(structured);
  }, [ocrText, imageUrl]);

  // Toggle language
  const toggleLang = (code: LangCode) => setSelectedLangs(prev => ({ ...prev, [code]: !prev[code] }));

  // Translate structured fields per-language
  const translateAll = async () => {
    if (!prescription) return;
    setTranslationError(null);
    setTranslating(true);

    const langs = Object.keys(selectedLangs).filter(k => (selectedLangs as any)[k]) as LangCode[];
    if (langs.length === 0) {
      setTranslationError('Select at least one language');
      setTranslating(false);
      return;
    }

    try {
      const base = {
        patientName: ensureString(prescription.patientName),
        doctorName: ensureString(prescription.doctorName),
        date: ensureString(prescription.date),
        medications: prescription.medications || [],
        dosage: prescription.dosage || [],
        instructions: prescription.instructions || []
      };

      const jobs = langs.map(async (lang) => {
        const [pName, dName, dt] = await Promise.all([
          translateText(base.patientName, lang, 'auto'),
          translateText(base.doctorName, lang, 'auto'),
          translateText(base.date, lang, 'auto')
        ]);

        const medsTranslated = await Promise.all(base.medications.map(m => translateText(ensureString(m), lang, 'auto')));
        const dosageTranslated = await Promise.all(base.dosage.map(d => translateText(ensureString(d), lang, 'auto')));
        const instrTranslated = await Promise.all(base.instructions.map(i => translateText(ensureString(i), lang, 'auto')));

        return {
          lang,
          name: LANGS.find(l => l.code === lang)?.name || lang,
          translated: { patientName: pName, doctorName: dName, date: dt, medications: medsTranslated, dosage: dosageTranslated, instructions: instrTranslated }
        };
      });

      const results = await Promise.all(jobs);
      const out: Record<string, any> = {};
      results.forEach(r => out[r.lang] = r);
      setTranslations(out);
    } catch (err: any) {
      console.error(err);
      setTranslationError(String(err?.message || err || 'Translation failed'));
    } finally {
      setTranslating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); alert('Copied'); } catch { alert('Copy failed'); }
  };

  const speak = (text: string, lang: LangCode) => {
    if (onSpeak) return onSpeak(text, lang);
    if (!('speechSynthesis' in window)) { alert('TTS not available'); return; }
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Professional Translator</h2>
        <div className="text-sm text-gray-500">Image: {imageUrl}</div>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="bg-white border rounded p-3">
            <img src={imageUrl} alt="prescription" className="w-full h-44 object-contain rounded" />
            <div className="mt-2 text-sm text-gray-600">OCR: {ocrRunning ? 'Running…' : ocrError ? <span className="text-red-600">{ocrError}</span> : 'Done'}</div>
            <div className="text-xs text-gray-500">Chars: {ocrText.length}</div>
          </div>

          <div className="mt-3 bg-white border rounded p-3">
            <div className="text-sm mb-2">Target languages</div>
            <div className="flex flex-wrap gap-2">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => toggleLang(l.code)}
                  className={`px-3 py-1 rounded-full border ${selectedLangs[l.code] ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}>
                  {l.name}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={translateAll} disabled={translating || !prescription} className="px-3 py-2 bg-indigo-600 text-white rounded">
                {translating ? 'Translating…' : 'Translate selected'}
              </button>
              <button onClick={() => { setTranslations({}); setTranslationError(null); }} className="px-3 py-2 border rounded">Clear</button>
            </div>
            {translationError && <div className="mt-2 text-sm text-red-600">{translationError}</div>}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="bg-white border rounded p-3">
            <div className="text-xs text-gray-500">Parsed prescription</div>
            {!prescription ? <div className="text-sm text-gray-500 mt-2">Waiting for OCR…</div> : (
              <>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div><div className="text-xs text-gray-500">Patient</div><div className="font-medium">{prescription.patientName}</div></div>
                  <div><div className="text-xs text-gray-500">Doctor</div><div className="font-medium">{prescription.doctorName}</div></div>
                </div>

                <div className="mt-3">
                  <div className="text-sm text-gray-500">Medications</div>
                  <div className="mt-2 space-y-2">
                    {prescription.medications.map((m, i) => (
                      <div key={i} className="p-2 border rounded flex justify-between">
                        <div>
                          <div className="font-semibold">{m}</div>
                          <div className="text-xs text-gray-500">Dosage: {prescription.dosage[i] ?? '(n/a)'}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => copyToClipboard(m)} className="px-2 py-1 border rounded text-xs">Copy</button>
                          <button onClick={() => speak(m, 'en')} className="px-2 py-1 border rounded text-xs">Speak</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm text-gray-500">Raw OCR</div>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs whitespace-pre-wrap max-h-48 overflow-auto">{prescription.extractedText}</pre>
                </div>
              </>
            )}
          </div>

          {/* Translations */}
          <div className="space-y-2">
            {Object.keys(translations).length === 0 ? (
              <div className="text-sm text-gray-500">No translations yet.</div>
            ) : (
              Object.entries(translations).map(([langCode, payload]: any) => (
                <div key={langCode} className="bg-white border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{payload.name} — {langCode}</div>
                        <div className="text-xs text-gray-500">Structured translation</div>
                      </div>
                    </div>
                    <div>
                      <button onClick={() => copyToClipboard(JSON.stringify(payload.translated, null, 2))} className="px-2 py-1 border rounded text-xs">Copy JSON</button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-gray-500">Patient</div>
                      <div className="font-medium">{payload.translated.patientName}</div>

                      <div className="mt-2 text-xs text-gray-500">Doctor</div>
                      <div className="font-medium">{payload.translated.doctorName}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Medications</div>
                      <div className="mt-2 space-y-2">
                        {payload.translated.medications.map((m: string, i: number) => (
                          <div key={i} className="p-2 border rounded">
                            <div className="font-semibold">{m}</div>
                            <div className="text-xs text-gray-500">Dosage: {payload.translated.dosage?.[i] ?? '(n/a)'}</div>
                            <div className="mt-1 flex gap-2">
                              <button onClick={() => copyToClipboard(m)} className="px-2 py-1 border rounded text-xs">Copy</button>
                              <button onClick={() => speak(m, langCode as LangCode)} className="px-2 py-1 border rounded text-xs">Speak</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Instructions</div>
                    <div className="mt-2 space-y-2">
                      {payload.translated.instructions.map((i: string, idx: number) => (
                        <div key={idx} className="p-2 border rounded flex justify-between">
                          <div>{i}</div>
                          <div className="flex gap-2">
                            <button onClick={() => copyToClipboard(i)} className="px-2 py-1 border rounded text-xs">Copy</button>
                            <button onClick={() => speak(i, langCode as LangCode)} className="px-2 py-1 border rounded text-xs">Speak</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTranslator;
