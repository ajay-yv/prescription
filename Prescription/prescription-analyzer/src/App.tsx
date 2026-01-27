// src/App.tsx
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Stethoscope,
  Brain,
  Upload as UploadIcon,
  History
} from 'lucide-react';

import { ImageUpload } from './components/ImageUpload';
import PrescriptionResults from './components/PrescriptionResults';
import { TrainingDataManager } from './components/TrainingDataManager';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';

import { ocrService } from './services/ocrService';
import { storageService } from './services/storageService';
import {
  fileToBase64,
  generateImageHash,
  extractMedications,
  extractDosage,
  extractInstructions,
  extractDoctorName,
  extractPatientName,
  extractDate,
  findPrescriptionMatch,
  PrescriptionData,
  MatchResult
} from './utils/imageUtils';

// TTS / voice helpers (kept as before)
import { speakAllFromImageGetText } from './utils/speakAllText';
import { speakFromServer } from './utils/serverTtsClient';
import { useVoiceControls } from './utils/useVoiceControls';
import { speakWithBrowserTTS, stopBrowserTTS } from './utils/tts';
import { getTtsLang } from './utils/ttsLang';

// Optional: small test helper file (if created earlier)
import { testTranslationConnection } from './testTranslate';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' }
] as const;

function App(): React.ReactElement {
  // --- Main states ---
  const [activeTab, setActiveTab] = useState<'analyze' | 'training' | 'history'>('analyze');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [viewingTrainingData, setViewingTrainingData] = useState<PrescriptionData | null>(null);

  // --- Voice (kept) ---
  const [selectedLanguage] = useState<string>(INDIAN_LANGUAGES[0].code);
  const [speaking, setSpeaking] = useState<boolean>(false);

  // useVoiceControls returns helpers to play/stop server audio; omit `pause` since it's unused
  const { playServerAudio, stop } = useVoiceControls();

  // mounted ref to avoid setState after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (typeof testTranslationConnection === 'function') {
      try {
        void testTranslationConnection();
      } catch {
        // ignore optional test errors
      }
    }
    return () => {
      isMountedRef.current = false;
      // cleanup audio / tts on unmount
      try {
        stop();
      } catch {
        // ignore
      }
      try {
        stopBrowserTTS();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // central speak handler that translates & speaks the *combined* prescription text.
  const handleSpeak = useCallback(
    async (onlyExtracted = false) => {
      if (!prescriptionData) {
        alert('No prescription loaded. Please upload or select a prescription first.');
        return;
      }

      if (speaking || processing) return;

      setSpeaking(true);

      try {
        const { finalText, ttsLang: helperTtsLang } = await speakAllFromImageGetText(prescriptionData, {
          targetTranslate: selectedLanguage as 'en' | 'hi' | 'kn' | 'te' | 'ta' | 'ml'
        });

        const textToSpeak = onlyExtracted ? (prescriptionData.extractedText || finalText) : finalText;
        const clientTtsLang = getTtsLang(helperTtsLang ?? selectedLanguage);

        // If speakFromServer returns a URL string, use playServerAudio(url, mime)
        if (typeof speakFromServer === 'function') {
          try {
            const serverUrl = await speakFromServer(textToSpeak, clientTtsLang);
            if (typeof serverUrl === 'string' && serverUrl) {
              playServerAudio(serverUrl, 'audio/mpeg');
            } else {
              await speakWithBrowserTTS(textToSpeak, clientTtsLang,
                () => { if (isMountedRef.current) setSpeaking(true); },
                () => { if (isMountedRef.current) setSpeaking(false); },
                (e) => { console.error('Browser TTS fallback error', e); if (isMountedRef.current) setSpeaking(false); }
              );
            }
          } catch (serverErr) {
            console.warn('Server TTS failed, falling back to browser TTS', serverErr);
            try {
              await speakWithBrowserTTS(textToSpeak, clientTtsLang,
                () => { if (isMountedRef.current) setSpeaking(true); },
                () => { if (isMountedRef.current) setSpeaking(false); },
                (e) => { console.error('Browser TTS fallback error', e); if (isMountedRef.current) setSpeaking(false); }
              );
            } catch (browserErr) {
              console.error('Both server and browser TTS failed', browserErr);
              if (isMountedRef.current) setSpeaking(false);
            }
          }
        } else {
          await speakWithBrowserTTS(textToSpeak, clientTtsLang,
            () => { if (isMountedRef.current) setSpeaking(true); },
            () => { if (isMountedRef.current) setSpeaking(false); },
            (e) => { console.error('Browser TTS error', e); if (isMountedRef.current) setSpeaking(false); }
          );
        }
      } catch (err) {
        console.error('handleSpeak error', err);
        if (isMountedRef.current) alert('TTS failed. Check console for details.');
        if (isMountedRef.current) setSpeaking(false);
      }
    },
    [prescriptionData, selectedLanguage, playServerAudio, speaking, processing]
  );

  // Existing OCR processing function
  const processImage = useCallback(async (file: File, imageUrl: string) => {
    setProcessing(true);
    try {
      const extractedText = await ocrService.extractText(file);

      const imageBase64 = await fileToBase64(file);
      const hash = generateImageHash(imageBase64);

      const medications = extractMedications(extractedText);
      const dosage = extractDosage(extractedText);
      const instructions = extractInstructions(extractedText);
      const doctorName = extractDoctorName(extractedText);
      const patientName = extractPatientName(extractedText);
      const date = extractDate(extractedText);

      const newPrescriptionData: PrescriptionData = {
        id: uuidv4(),
        name: `Prescription_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
        image: imageBase64,
        extractedText,
        medications,
        dosage,
        instructions,
        doctorName,
        patientName,
        date,
        hash,
        isTrainedData: false,
        uploadedAt: Date.now()
      };

      const trainedData = storageService.getTrainedData();
      const match = findPrescriptionMatch(newPrescriptionData, trainedData);

      if (!isMountedRef.current) return;

      setPrescriptionData(newPrescriptionData);
      setMatchResult(match);
      storageService.saveUploadHistory(newPrescriptionData);
    } catch (error) {
      console.error('Error processing image:', error);
      if (isMountedRef.current) alert('Error processing the image. Please try again.');
    } finally {
      if (isMountedRef.current) setProcessing(false);
    }
  }, []);

  const handleImageSelect = useCallback((file: File, imageUrl: string) => {
    setCurrentFile(file);
    setCurrentImage(imageUrl);
    setPrescriptionData(null);
    setMatchResult(null);
    void processImage(file, imageUrl);
  }, [processImage]);

  const handleRemoveImage = useCallback(() => {
    setCurrentImage('');
    setCurrentFile(null);
    setPrescriptionData(null);
    setMatchResult(null);
  }, []);

  const handleAddToTraining = useCallback(() => {
    if (!prescriptionData) {
      setActiveTab('analyze');
      return;
    }

    const name = window.prompt('Enter a name for this training data:', prescriptionData.name || '');
    if (!name) return;

    const trainingData = {
      ...prescriptionData,
      name: name.trim(),
      isTrainedData: true
    };

    try {
      storageService.saveTrainedData(trainingData);
      if (isMountedRef.current) alert('Added to training data successfully!');
    } catch (e) {
      console.error('Failed saving training data', e);
      if (isMountedRef.current) alert('Failed to save training data. See console.');
    }
  }, [prescriptionData]);

  const handleViewTrainingData = useCallback((data: PrescriptionData) => {
    setViewingTrainingData(data);
    setActiveTab('training');
  }, []);

  const handleCloseTrainingDataView = useCallback(() => {
    setViewingTrainingData(null);
  }, []);

  const uploadHistory = useMemo(() => storageService.getUploadHistory(), []);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fbff] to-white p-6">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg">
              <Stethoscope size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">Prescription Analyzer</h1>
              <p className="text-sm text-slate-500">Upload prescriptions, identify medicines and instructions, and manage training data.</p>
            </div>
          </div>

          <nav className="flex gap-3 items-center">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'analyze' ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-700 hover:shadow-sm'}`}
            >
              <UploadIcon className="inline mr-2" /> Analyze
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'training' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-700 hover:shadow-sm'}`}
            >
              <Brain className="inline mr-2" /> Training
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'history' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-700 hover:shadow-sm'}`}
            >
              <History className="inline mr-2" /> History
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <aside className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon /> Upload Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ImageUpload
                  onImageSelect={(file: File, url: string) => handleImageSelect(file, url)}
                  onRemove={() => handleRemoveImage()}
                />
                <div className="flex gap-2">
                  <Button onClick={() => { if (currentFile && currentImage) void processImage(currentFile, currentImage); }} disabled={!currentFile || processing} variant="primary">
                    {processing ? 'Processing...' : 'Re-run OCR'}
                  </Button>
                  <Button onClick={handleAddToTraining} disabled={!prescriptionData} variant="outline">
                    <Brain className="inline mr-1" /> Add to Training
                  </Button>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Tip: Upload clear photos (well-lit, straight) for better OCR detection.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training & Quick Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={() => { setPrescriptionData(null); setMatchResult(null); setCurrentImage(''); setCurrentFile(null); }} variant="outline">Clear Current</Button>
                <Button onClick={() => { const h = uploadHistory.slice().reverse()[0]; if (h) { setPrescriptionData(h); setActiveTab('analyze'); } }} variant="primary">Load Recent Upload</Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT PANEL */}
        <section className="md:col-span-2 space-y-4">
          {activeTab === 'analyze' && (
            <Card>
              <CardHeader>
                <div className="w-full flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">Analysis Results</CardTitle>
                  <div className="text-sm text-slate-500">Processed: {prescriptionData ? new Date(prescriptionData.uploadedAt).toLocaleString() : '—'}</div>
                </div>
              </CardHeader>
              <CardContent>
                {prescriptionData ? (
                  <PrescriptionResults
                    prescriptionData={prescriptionData}
                    matchResult={matchResult ?? undefined}
                    onSpeak={() => void handleSpeak(false)}
                  />
                ) : (
                  <div className="text-sm text-slate-600 p-8 rounded-lg bg-gradient-to-r from-white to-slate-50 border border-slate-100 text-center">
                    <p className="mb-2">No prescription loaded</p>
                    <p className="text-xs text-slate-400">Upload an image on the left to analyze</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'training' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800"><Brain /> Training Data Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <TrainingDataManager onViewTrainingData={(d) => handleViewTrainingData(d)} onAddToTraining={() => handleAddToTraining()} />
                {viewingTrainingData && (
                  <div className="mt-4 border rounded p-3 bg-white shadow-sm">
                    <h3 className="font-semibold mb-2">Viewing: {viewingTrainingData.name}</h3>
                    <img src={viewingTrainingData.image} alt="training" className="max-h-48 object-contain mb-2 rounded-lg" />
                    <pre className="whitespace-pre-wrap text-sm bg-slate-50 p-2 rounded">{viewingTrainingData.extractedText}</pre>
                    <div className="mt-2 flex gap-2">
                      <Button onClick={() => void handleSpeak(true)} variant="primary">Speak this</Button>
                      <Button className="ml-2" onClick={handleCloseTrainingDataView} variant="outline">Close</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'history' && (
            <Card>
              <CardHeader><CardTitle className="text-lg font-semibold text-slate-800"><History /> Upload History</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(!uploadHistory || uploadHistory.length === 0) && <li className="text-slate-500">No uploads yet.</li>}
                  {uploadHistory && uploadHistory.slice().reverse().map((h) => (
                    <li key={h.id} className="mb-3 border-b pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-slate-800">{h.name}</strong>
                          <div className="text-sm text-slate-500">{new Date(h.uploadedAt).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => { setPrescriptionData(h); setActiveTab('analyze'); }} variant="outline">View</Button>
                          <Button onClick={() => { setPrescriptionData(h); void handleSpeak(false); }} variant="primary">Speak</Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
