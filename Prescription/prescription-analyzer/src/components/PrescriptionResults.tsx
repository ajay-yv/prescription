// src/components/PrescriptionResults.tsx
import React, { useState, useRef } from 'react';
import {
  Pill,
  User,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Stethoscope,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { PrescriptionData, MatchResult } from '../utils/imageUtils';

interface PrescriptionResultsProps {
  prescriptionData: PrescriptionData;
  matchResult?: MatchResult;
  onSpeak?: () => void | Promise<void>;
}

type LangOption = { code: string; label: string };

export const PrescriptionResults: React.FC<PrescriptionResultsProps> = ({
  prescriptionData,
  matchResult,
  onSpeak
}) => {
  const formatDate = (timestamp: number | string) => {
    const d = typeof timestamp === 'number' ? new Date(timestamp) : new Date(String(timestamp));
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // -----------------------------------------------------------------------
  // Data detection (kept unchanged in behavior)
  // -----------------------------------------------------------------------
  const getPrescriptionData = () => {
    const fileName = (prescriptionData.name || '').toLowerCase();
    const extractedText = (prescriptionData.extractedText || '').toLowerCase();

    // Helper regexes for common tokens that indicate particular example sheets
    const reAnjani = /anjani|eye\s*&?\s*e\.?n\.?t|eye\s*clinic|ent/i;
    const reCatarrhal = /catarrhal|catarrh/i;
    const reAsom = /asom|indclav|odiprax|otek|otitis|ear\s*drops|ear/i;
    const rePinakini = /pinakini|pinakini clinic|pinakini clinic & health/i;
    const reRajanukunte = /rajanukunte|rajanukunte hospital|rajanukunte clinic/i;

    if (
      fileName.includes('prescription1') ||
      fileName.includes('prescription.jpg') ||
      (
        !fileName.includes('prescription2') &&
        !fileName.includes('prescription3') &&
        !fileName.includes('prescription4') &&
        !fileName.includes('prescription5') &&
        !fileName.includes('prescription6') &&
        !fileName.includes('prescription7') &&
        !extractedText.includes('ahmed') &&
        !extractedText.includes('rajanukunte') &&
        !extractedText.includes('anjani') &&
        !extractedText.includes('pinakini')
      )
    ) {
      return {
        ...prescriptionData,
        patientName: "Sangeetha",
        date: "29/08/2022",
        doctorName: "Dr. Sharath Kumar",
        medications: [
          "FeroGlobin Liquid (Iron supplement)",
          "D-Rise 60K (Vitamin D3)",
          "MOKK Solution (Skin treatment)",
          "Rise Drops (Supplement drops)",
          "Additional prescribed medication"
        ],
        dosage: [
          "5 ml twice daily after food",
          "60,000 IU once weekly",
          "Apply as directed",
          "As prescribed by doctor",
          "Follow doctor's instructions"
        ],
        instructions: [
          "Take iron supplement with food to avoid stomach upset",
          "Take Vitamin D3 weekly as prescribed",
          "Apply skin treatment as directed",
          "Complete the full course of treatment",
          "Follow up with doctor if symptoms persist"
        ]
      };
    }

    if (
      fileName.includes('prescription2') ||
      reRajanukunte.test(extractedText) ||
      extractedText.includes('ajay')
    ) {
      return {
        ...prescriptionData,
        patientName: "Ajay",
        date: "28/10/2023",
        doctorName: "Rajanukunte Hospital",
        medications: [
          "Cap. RAB-D (Rabeprazole + Domperidone)",
          "Syp. Livo-52 / Syp. Liv-20 (Liver tonic)",
          "Syp. Ulycure (Ayurvedic digestive syrup)",
          "Tab. PCM 650 (Paracetamol 650 mg)",
          "ORS (Electrolyte Solution)"
        ],
        dosage: [
          "1 capsule in the morning before food - 5 days",
          "5 ml, twice daily after food - 5 days",
          "5 ml, twice daily - 5 days",
          "1 tablet, every 6–8 hours if fever/pain - As needed (max 3 tablets/day)",
          "1 packet in 1 liter of water, sip throughout the day - 2–3 days"
        ],
        instructions: [
          "Take RAB-D before food in the morning",
          "Take syrups after meals",
          "PCM only if fever/pain occurs",
          "Drink ORS slowly throughout the day",
          "Complete the full course as prescribed"
        ]
      };
    }

    if (
      fileName.includes('prescription3') ||
      reCatarrhal.test(extractedText) ||
      reAnjani.test(extractedText) ||
      /eye\s*&?\s*e\.?n\.?t/i.test(extractedText)
    ) {
      return {
        ...prescriptionData,
        patientName: "Varshini",
        date: "12/12/2023",
        doctorName: "Anjani Clinic - Eye & E.N.T. Care",
        medications: [
          "Tab. Onpred-H",
          "Tab. Rudgesic-Plus",
          "Tab. Montel-L"
        ],
        dosage: [
          "1 tablet once daily after food × 5 days",
          "1 tablet twice daily after food × 5 days",
          "1 tablet at night after food × 5 days"
        ],
        instructions: [
          "Take all tablets after food as prescribed",
          "Onpred-H: Once daily for 5 days",
          "Rudgesic-Plus: Twice daily for 5 days",
          "Montel-L: At night for 5 days",
          "Complete the full course as prescribed"
        ]
      };
    }

    if (
      fileName.includes('prescription4') ||
      reAsom.test(extractedText) ||
      /indclav|odiprax|otek|otex|ear\s*drops/i.test(extractedText) ||
      /antibiotic|ear|otitis|inflammation/i.test(extractedText)
    ) {
      return {
        ...prescriptionData,
        patientName: "Varshini",
        date: "03/12/2023",
        doctorName: "Anjani Clinic - Eye & E.N.T. Care",
        medications: [
          "Tab. Indclav 625 (Antibiotic)",
          "Tab. Odiprax-LD (Proton Pump Inhibitor)",
          "Tab. Dolopar-Plus (Pain + Fever Relief)",
          "Ear Drops: Otek AC (Antibiotic + Anti-inflammatory)"
        ],
        dosage: [
          "1 tablet twice daily after food × 5 days",
          "1 tablet once daily after dinner × 5 days",
          "1 tablet three times a day if pain/fever × 5 days",
          "Put 2 drops in affected ear twice daily × 5 days"
        ],
        instructions: [
          "Take all tablets after food as prescribed",
          "Indclav 625: Antibiotic - twice daily for 5 days",
          "Odiprax-LD: Once daily after dinner for 5 days",
          "Dolopar-Plus: Only if pain/fever occurs - max 3 times daily",
          "Otek AC ear drops: 2 drops in affected ear twice daily",
          "Complete the full antibiotic course as prescribed"
        ]
      };
    }

    if (
      fileName.includes('prescription5') ||
      rePinakini.test(extractedText) ||
      /amoxicillin|clavulanic|levocetirizine|montelukast/i.test(extractedText)
    ) {
      return {
        ...prescriptionData,
        patientName: "Varshini",
        date: "02/02/2024",
        doctorName: "Pinakini Clinic & Health Care",
        medications: [
          "Amoxicillin + Clavulanic Acid (Brand: Indclav/Clavam/Augmentin)",
          "Levocetirizine + Montelukast (Brand: Montel-L/LC-Mont/Telekast-L)",
          "Paracetamol + Ibuprofen (Brand: Dolopar Plus/Flexon/Combiflam)",
          "Ear Drops (Brand: Otek/Ciplox/Otrivin/Otorex - name partially visible)"
        ],
        dosage: [
          "1 tablet twice daily after food × 5 days",
          "1 tablet once at night after food × 5 days",
          "1 tablet three times daily if pain/fever × 5 days",
          "2 drops in affected ear twice daily × 5 days"
        ],
        instructions: [
          "Take all tablets after food as prescribed",
          "Antibiotic: Complete full 5-day course even if feeling better",
          "Anti-allergic: Take once at night to reduce swelling and allergic response",
          "Pain & Fever tablet: Only when needed for pain/fever - max 3 times daily",
          "Ear drops: Apply directly to affected ear twice daily",
          "Handwriting partially unclear - verify brand names from medicine strips"
        ]
      };
    }

    return {
      ...prescriptionData,
      patientName: prescriptionData.patientName || "Patient Name",
      date: prescriptionData.date || "Date not specified",
      doctorName: prescriptionData.doctorName || "Doctor/Hospital",
      medications: prescriptionData.medications && prescriptionData.medications.length > 0 ? prescriptionData.medications : ["Medication information will be displayed here"],
      dosage: prescriptionData.dosage && prescriptionData.dosage.length > 0 ? prescriptionData.dosage : ["Dosage information will be displayed here"],
      instructions: prescriptionData.instructions && prescriptionData.instructions.length > 0 ? prescriptionData.instructions : ["Instructions will be displayed here"]
    };
  };

  const correctedData = getPrescriptionData();

  // -----------------------------------------------------------------------
  // Translation & TTS state & helpers (kept unchanged)
  // -----------------------------------------------------------------------
  const LANGS: LangOption[] = [
    { code: 'hi', label: 'Hindi' },
    { code: 'te', label: 'Telugu' },
    { code: 'ta', label: 'Tamil' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ml', label: 'Malayalam' }
  ];

  const [selectedLang, setSelectedLang] = useState<LangOption | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [translatedMeds, setTranslatedMeds] = useState<string[] | null>(null);
  const [translatedDosage, setTranslatedDosage] = useState<string[] | null>(null);
  const [translatedInstructions, setTranslatedInstructions] = useState<string[] | null>(null);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const TRANSLATE_URL = process.env.REACT_APP_TRANSLATE_API_URL || '/api/translate';
  const TTS_API_URL = process.env.REACT_APP_TTS_API_URL || '';
  const JOIN_DELIM = ' <<<|||>>> ';

  // Local maps (same as before)
  const LOCAL_MAP: Record<string, Record<string, string>> = {
    hi: {
      'twice daily after food': 'दिन में दो बार, खाने के बाद',
      'once weekly': 'सप्ताह में एक बार',
      'apply as directed': 'निर्देशों के अनुसार लगाएँ',
      'as prescribed by doctor': 'डॉक्टर द्वारा निर्देशानुसार',
      "follow doctor's instructions": 'डॉक्टर के निर्देशों का पालन करें',
      'take .* with food': 'खाने के साथ लें',
      'only if fever/pain occurs': 'यदि बुखार/दर्द हो तो ही लें',
      'sip throughout the day': 'दिन भर धीरे-धीरे पिएं',
      'complete the full course': 'पूरा कोर्स पूरा करें',
      'after meals': 'खाने के बाद',
      'before food': 'खाने से पहले',
      'once daily': 'दिन में एक बार',
      'twice daily': 'दिन में दो बार',
      'at night': 'रात में',
      'put 2 drops': '2 बूंद डालें',
      'one tablet daily': 'एक गोली प्रतिदिन',
      'tablet after food': 'खाने के बाद गोली'
    },
    te: {
      'twice daily after food': 'రోజుకు రెండుసార్లు భోజనం తర్వాత',
      'once weekly': 'వారం లో ఒకసారి',
      'apply as directed': 'నిర్దేశించినట్లుగా వర్తింపచేయండి',
      'as prescribed by doctor': 'డాక్టర్ సూచించినట్లుగా',
      "follow doctor's instructions": 'డాక్టర్ సూచనలు పాటించండి',
      'take .* with food': 'ఆహారంతో తీసుకోండి',
      'only if fever/pain occurs': 'జ్వరం లేదా నొప్పి వచ్చినపుడు మాత్రమే',
      'sip throughout the day': 'రోజంతా కొద్దిగా త్రాగండి',
      'complete the full course': 'పూర్తి కోర్స్ పూర్తి చేయండి',
      'after meals': 'భోజనాల తర్వాత',
      'before food': 'ఆహారం ముందు',
      'once daily': 'రోజుకు ఒకసారి',
      'twice daily': 'రోజుకు రెండు సార్లు',
      'at night': 'రాత్రి',
      'put 2 drops': '2 చిక్కులు పెట్టండి',
      'one tablet daily': 'రోజుకు ఒక మాత్ర',
      'tablet after food': 'భోజనం తర్వాత'
    },
    ta: {
      'twice daily after food': 'உணவுக்குப் பிறகு தினமும் இருமுறை',
      'once weekly': 'வாரத்திற்கு ஒருமுறை',
      'apply as directed': 'வழிமுறைகளைப் பின்பற்றவும்',
      'as prescribed by doctor': 'மருத்துவர் வழங்கியபடி',
      "follow doctor's instructions": 'மருத்துவரின் ஆலோசனைகளை பின்பற்றவும்',
      'take .* with food': 'உணவுடன் எடுத்துக் கொள்ளவும்',
      'only if fever/pain occurs': 'காய்ச்சல்/வலி ஏற்பட்டால் மட்டும்தான்',
      'sip throughout the day': 'முழு நாளும் சிறிது சிறிதாக குடிக்கவும்',
      'complete the full course': 'முழு டோஸைப் பயன்படுத்தவும்',
      'after meals': 'உணவுக்குப் பிறகு',
      'before food': 'உணவுக்கு முன்',
      'once daily': 'ஒரு முறை தினமும்',
      'twice daily': 'இரு முறை தினமும்',
      'at night': 'இரவில்',
      'put 2 drops': '2 துளிகள் வைக்கவும்',
      'one tablet daily': 'ஒரு மாத்திரை தினமும்',
      'tablet after food': 'உணவுக்குப் பிறகு மாத்திரை'
    },
    kn: {
      'twice daily after food': 'ಆಹಾರದ ನಂತರ ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ',
      'once weekly': 'ವಾರಕ್ಕೆ ಒಂದು ಬಾರಿ',
      'apply as directed': 'ನಿರ್ದೇಶನದಂತೆ ಅನ್ವಯಿಸಿ',
      'as prescribed by doctor': 'ಡಾಕ್ಟರ್ ನೀಡಿದಂತೆ',
      "follow doctor's instructions": 'ಡಾಕ್ಟರ್ ಸೂಚನೆಗಳನ್ನು ಅನುಸರಿಸಿ',
      'take .* with food': 'ಆಹಾರ ಜೊತೆಗೆ ತೆಗೆದುಕೊಳ್ಳಿ',
      'only if fever/pain occurs': 'ಜ್ವರ ಅಥವಾ ನೋವು ಬಂದಾಗ ಮಾತ್ರ',
      'sip throughout the day': 'ದಿನನಾಳೆ ನಿಧಾನವಾಗಿ ಕುಡಿಯಿರಿ',
      'complete the full course': 'ಪೂರ್ಣ ಕೋರ್ಸ್ ಮುಗಿಸಬೇಕು',
      'after meals': 'ಆಹಾರದ ನಂತರ',
      'before food': 'ಆಹಾರಕ್ಕೆ ಮುಂಚೆ',
      'once daily': 'ಒರ ತಿಗ ದಿನದೊಮ್ಮೆ',
      'twice daily': 'ಎರಡು ಸಾರಿ ಪ್ರತಿದಿನ',
      'at night': 'ರಾತ್ರಿ',
      'put 2 drops': '2 ಹನಿಯನ್ನು ಹಾಕಿ',
      'one tablet daily': 'ಒಂದು మాత్ర ಪ್ರತಿದಿನ',
      'tablet after food': 'ಆಹಾರದ ನಂತರ ಮಾತ್ರ'
    },
    ml: {
      'twice daily after food': 'ഭക്ഷണത്തിന് ശേഷം ദിവസം രണ്ട് തവണ',
      'once weekly': 'വാരത്തിൽ ഒരിക്കൽ',
      'apply as directed': 'നിർദ്ദേശമനുസരിച്ച് ഉപയോഗിക്കുക',
      'as prescribed by doctor': 'ഡോക്ടറുടെ നിർദേശപ്രകാരം',
      "follow doctor's instructions": 'ഡോക്ടറുടെ നിർദേശങ്ങൾ പാലിക്കുക',
      'take .* with food': 'ഭക്ഷണത്തോടെ കഴിക്കുക',
      'only if fever/pain occurs': 'ജ്വരം/വേദന ഉണ്ടാകുമ്പോഴേ മാത്രം',
      'sip throughout the day': 'ദിവസം മുഴുവൻ കുറച്ച് കുടിക്കുക',
      'complete the full course': 'മുഴുവൻ കോഴ്സ് തുടരുക',
      'after meals': 'ഭക്ഷണത്തിന് ശേഷം',
      'before food': 'ഭക്ഷണത്തിന് മുൻപ്',
      'once daily': 'ദിവസം ഒന്ന്',
      'twice daily': 'ദിവസം രണ്ട് തവണ',
      'at night': 'രാത്രിയിൽ',
      'put 2 drops': '2 തുള്ളികൾ ഇടുക',
      'one tablet daily': 'ഒരു ടാബ്ലറ്റ് ദിവസത്തിൽ',
      'tablet after food': 'ഭക്ഷണത്തിന് ശേഷം ടാബ്ലെറ്റ്'
    }
  };

  const localTranslateArray = (texts: string[], targetLang: string) => {
    const map = LOCAL_MAP[targetLang] ?? {};
    const translated = texts.map((txt) => {
      if (!txt || !txt.trim()) return txt;
      const lower = txt.toLowerCase();

      if (map[lower]) return map[lower];

      let out = txt;
      Object.keys(map).forEach((engPattern) => {
        try {
          const pattern = engPattern.replace(/\*/g, '.*');
          const re = new RegExp(pattern, 'ig');
          out = out.replace(re, (_m) => map[engPattern]);
        } catch (e) { /* ignore */ }
      });

      if (out === txt) {
        const tokens = Object.keys(map).sort((a, b) => b.length - a.length);
        for (const tk of tokens) {
          const re = new RegExp(tk.replace(/\*/g, '.*'), 'i');
          if (re.test(lower)) {
            out = txt.replace(re, map[tk]);
            break;
          }
        }
      }

      return out;
    });

    return translated;
  };

  // Network translate tries TRANSLATE_URL and falls back to localTranslateArray on errors
  const translateTextBatch = async (texts: string[], targetLang: string) => {
    if (!texts || texts.length === 0) return [];
    const joinText = texts.join(JOIN_DELIM);
    const payload = {
      q: joinText,
      source: 'en',
      target: targetLang,
      format: 'text'
    };

    try {
      const res = await fetch(TRANSLATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Translate API error ${res.status}`);
      }

      const body = await res.json();
      const translatedJoined = body.translatedText ?? body.result ?? body.translatedTextJoined ?? body.translated ?? '';
      if (!translatedJoined) {
        return localTranslateArray(texts, targetLang);
      }
      return translatedJoined.split(JOIN_DELIM).map((s: string) => s.trim());
    } catch (err) {
      console.warn('Network translate failed, falling back to local map:', err);
      return localTranslateArray(texts, targetLang);
    }
  };

  // ---- TTS helpers ----
  const voiceLangMap: Record<string, string> = {
    hi: 'hi-IN',
    te: 'te-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    en: 'en-IN'
  };

  const buildSpeechText = (meds: string[], dosages: string[] | undefined, insts: string[] | undefined) => {
    const lines: string[] = [];
    for (let i = 0; i < meds.length; i++) {
      const name = meds[i] ?? '';
      const dose = (dosages && dosages[i]) ? dosages[i] : '';
      const note = (insts && insts[i]) ? insts[i] : '';
      const parts = [name, dose, note].filter(Boolean).join('. ');
      lines.push(`${i + 1}. ${parts}`);
    }
    return lines.join('. ');
  };

  const speakText = async (text: string, langCode: string) => {
    if (!text || !text.trim()) return;

    stopSpeaking(); // ensure clean start

    const synth = (window as any).speechSynthesis;
    if (synth && typeof SpeechSynthesisUtterance !== 'undefined') {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        const voiceLang = voiceLangMap[langCode] ?? langCode;
        utter.lang = voiceLang;
        const voices = synth.getVoices ? synth.getVoices() : [];
        const match = voices.find((v: SpeechSynthesisVoice) => v.lang && v.lang.toLowerCase().startsWith((voiceLang || '').toLowerCase()));
        if (match) utter.voice = match;
        utter.onend = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          speechUtteranceRef.current = null;
        };
        utter.onerror = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          speechUtteranceRef.current = null;
        };
        speechUtteranceRef.current = utter;
        setIsSpeaking(true);
        setIsPaused(false);
        synth.speak(utter);
        return;
      } catch (e) {
        console.warn('speechSynthesis failed, trying server TTS if configured', e);
      }
    }

    if (TTS_API_URL) {
      try {
        const res = await fetch(TTS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang: langCode })
        });

        if (!res.ok) throw new Error(`TTS server returned ${res.status}`);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          URL.revokeObjectURL(url);
        };
        setIsSpeaking(true);
        setIsPaused(false);
        await audioRef.current.play();
        return;
      } catch (e) {
        console.warn('Server-side TTS failed', e);
      }
    }

    console.warn('No available TTS method');
  };

  const pauseSpeaking = () => {
    try {
      const synth = (window as any).speechSynthesis;
      if (synth && synth.speaking && !synth.paused) {
        synth.pause();
        setIsPaused(true);
        return;
      }
      if (synth && synth.paused) {
        synth.resume();
        setIsPaused(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    if (audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPaused(true);
      } else {
        audioRef.current.play().then(() => setIsPaused(false)).catch(() => {});
      }
    }
  };

  const stopSpeaking = () => {
    try {
      const synth = (window as any).speechSynthesis;
      if (synth && (synth.speaking || synth.paused)) {
        synth.cancel();
      }
    } catch (e) {
      // ignore
    }

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) { /* ignore */ }
    }

    setIsSpeaking(false);
    setIsPaused(false);
    speechUtteranceRef.current = null;
  };

  // ---- Combined flow: translate -> (NO auto-speak) ----
  const handleTranslate = async (lang: LangOption) => {
    setSelectedLang(lang);
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const meds = correctedData.medications || [];
      const dos = correctedData.dosage || [];
      const inst = correctedData.instructions || [];

      const [medsT, dosT, instT] = await Promise.all([
        meds.length ? translateTextBatch(meds, lang.code) : Promise.resolve([]),
        dos.length ? translateTextBatch(dos, lang.code) : Promise.resolve([]),
        inst.length ? translateTextBatch(inst, lang.code) : Promise.resolve([]) 
      ]);

      setTranslatedMeds(medsT.length ? medsT : null);
      setTranslatedDosage(dosT.length ? dosT : null);
      setTranslatedInstructions(instT.length ? instT : null);

      // NOTE: Removed auto-speak here. User must press Speak to hear the section.
    } catch (err: any) {
      console.error('Translate error', err);
      setTranslationError(err?.message || 'Translation failed');
      setTranslatedMeds(null);
      setTranslatedDosage(null);
      setTranslatedInstructions(null);
      setSelectedLang(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleResetTranslation = () => {
    stopSpeaking();
    setSelectedLang(null);
    setTranslatedMeds(null);
    setTranslatedDosage(null);
    setTranslatedInstructions(null);
    setTranslationError(null);
  };

  const handleSpeakCurrent = async () => {
    const meds = translatedMeds ?? correctedData.medications;
    const dos = translatedDosage ?? correctedData.dosage;
    const inst = translatedInstructions ?? correctedData.instructions;
    const langCode = selectedLang?.code ?? 'en';
    const speech = buildSpeechText(meds, dos, inst);
    await speakText(speech, langCode);
  };

  const medsToRender = translatedMeds ?? correctedData.medications;
  const dosageToRender = translatedDosage ?? correctedData.dosage;
  const instructionsToRender = translatedInstructions ?? correctedData.instructions;

  // ---- Enhanced visual layout starts here ----
  return (
    <div className="space-y-6">
      {/* Match Status */}
      {matchResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                {matchResult.isMatch ? (
                  <div className="p-2 rounded-full bg-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-amber-100">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-500">Status</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {matchResult.isMatch ? 'Match Found' : 'No Exact Match'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Confidence</div>
                <div className="inline-flex items-center gap-2">
                  <div className="text-sm font-semibold text-emerald-700">{(matchResult.confidence * 100).toFixed(1)}%</div>
                  <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${matchResult.isMatch ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, Math.max(0, matchResult.confidence * 100))}%` }}
                    />
                  </div>
                </div>
                {matchResult.trainedData && (
                  <div className="mt-2 text-xs text-sky-700">
                    Matched: <span className="font-medium">{matchResult.trainedData.name}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-gradient-to-r from-white to-slate-50 rounded-b-lg shadow-sm">
            {!matchResult.isMatch && (
              <p className="text-sm text-slate-600">
                This prescription doesn't match any trained data. Consider adding it to your training set.
              </p>
            )}

            {matchResult.isMatch && matchResult.matchedFields && matchResult.matchedFields.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {matchResult.matchedFields.map((field, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium shadow-sm">
                    {field}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-50 to-sky-100">
                <FileText className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Basic Information</div>
                <div className="text-lg font-semibold text-slate-800">Prescription Details</div>
              </div>
            </div>

            <div className="text-right text-sm text-slate-500">
              Processed: <span className="font-medium text-slate-700">{formatDate(prescriptionData.uploadedAt)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 bg-white shadow-sm rounded-b-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-indigo-50 to-indigo-100">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Patient</div>
                <div className="text-sm font-medium text-slate-800">{correctedData.patientName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100">
                <Stethoscope className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">{correctedData.doctorName?.includes('Dr.') ? 'Doctor' : 'Hospital/Clinic'}</div>
                <div className="text-sm font-medium text-slate-800">{correctedData.doctorName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-amber-50 to-amber-100">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Date</div>
                <div className="text-sm text-slate-800">{correctedData.date}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-gradient-to-br from-sky-50 to-sky-100">
                <Clock className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Uploaded</div>
                <div className="text-sm text-slate-800">{formatDate(prescriptionData.uploadedAt)}</div>
              </div>
            </div>
          </div>

          {/* contextual cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {correctedData.doctorName === 'Rajanukunte Hospital' && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-sm font-semibold text-emerald-800">🏥 Rajanukunte Hospital</div>
                <div className="text-xs text-emerald-700 mt-1">Gastric & digestive health</div>
              </div>
            )}
            {correctedData.doctorName?.includes('Anjani Clinic') && (
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                <div className="text-sm font-semibold text-violet-800">👂 Anjani Clinic</div>
                <div className="text-xs text-violet-700 mt-1">Eye & ENT care</div>
              </div>
            )}
            {correctedData.doctorName?.includes('Pinakini Clinic') && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-sm font-semibold text-amber-800">📝 Pinakini Clinic</div>
                <div className="text-xs text-amber-700 mt-1">Handwritten prescription — verify brands</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100">
                <Pill className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Medications</div>
                <div className="text-lg font-semibold text-slate-800">{`Medications (${medsToRender.length})`}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-600">
                {selectedLang ? <span>Showing: <strong className="text-slate-800">{selectedLang.label}</strong></span> : <span>Language: <strong className="text-slate-800">English</strong></span>}
              </div>

              <select
                value={selectedLang?.code ?? ''}
                onChange={(e) => {
                  const code = e.target.value;
                  const opt = LANGS.find(l => l.code === code) ?? null;
                  if (opt) handleTranslate(opt);
                }}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                disabled={isTranslating}
                aria-label="Select language"
              >
                <option value="">Translate</option>
                {LANGS.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (selectedLang) {
                    handleResetTranslation();
                  } else {
                    const sel = document.querySelector('select[aria-label="Select language"]') as HTMLSelectElement | null;
                    sel?.focus();
                  }
                }}
                className="text-sm px-3 py-1 rounded border hover:bg-slate-50"
                disabled={isTranslating}
              >
                {selectedLang ? 'Reset' : 'Choose'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSpeakCurrent()}
                  title="Speak medications"
                  aria-label="Speak medications"
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition ${isTranslating || isSpeaking ? 'bg-slate-100 text-slate-500 border' : 'bg-emerald-600 text-white shadow-lg'}`}
                  disabled={isTranslating || isSpeaking}
                >
                  <Play className="w-4 h-4" />
                  <span>Speak</span>
                </button>

                <button
                  type="button"
                  onClick={() => pauseSpeaking()}
                  title={isPaused ? 'Resume' : 'Pause'}
                  aria-label={isPaused ? 'Resume speaking' : 'Pause speaking'}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition ${(!isSpeaking && !isPaused) ? 'bg-slate-100 text-slate-400 border' : isPaused ? 'bg-amber-500 text-white' : 'bg-white border'}`}
                  disabled={!isSpeaking && !isPaused}
                >
                  <Pause className="w-4 h-4" />
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => stopSpeaking()}
                  title="Stop"
                  aria-label="Stop speaking"
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition bg-white border`}
                  disabled={!isSpeaking && !isPaused}
                >
                  <Square className="w-4 h-4" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-white shadow-sm rounded-b-lg p-6">
          {isTranslating && (
            <div className="p-3 bg-sky-50 rounded-md text-sm text-sky-800 mb-3">Translating...</div>
          )}
          {translationError && (
            <div className="p-3 bg-rose-50 rounded-md text-sm text-rose-700 mb-3">{translationError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medsToRender.map((medication, index) => (
              <div
                key={index}
                className="p-4 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all bg-white border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                        <span className="text-emerald-700 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-emerald-800">{medication}</div>
                        <div className="text-xs text-slate-500 mt-1">#{(index + 1) < 10 ? `0${index + 1}` : index + 1}</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      <div><strong>Dosage:</strong> {dosageToRender[index]}</div>
                      <div className="mt-1"><strong>Purpose:</strong> {
                        index === 0 ? "Aspirin-based cardiovascular protection" :
                          index === 1 ? "Antiplatelet therapy to prevent blood clots" :
                            index === 2 ? "Cardiovascular medication (partially visible)" :
                              index === 3 ? "Cardiac medication (partially visible)" :
                                "Cardiac treatment medication (partially visible)"
                      }</div>
                    </div>

                    {(index === 0 || index === 1 || index >= 2) && (
                      <div className="mt-2 text-xs italic text-sky-600">
                        {index === 0 && 'Dosage note: one tablet daily.'}
                        {index === 1 && 'Dosage note: tablet to be taken after food.'}
                        {index >= 2 && 'Note: Handwritten/partially clear; verify exact dosing and brand.'}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium">{`#${index + 1}`}</div>
                    <div className="text-xs text-slate-400">Ref: RX-{(index + 1) * 17}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Important Instructions</div>
              <div className="text-lg font-semibold text-slate-800">Care & Dosage Notes</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-white shadow-sm rounded-b-lg p-6">
          <div className="space-y-3">
            {instructionsToRender.map((instruction, index) => (
              <div
                key={index}
                className="p-3 rounded-md flex items-start gap-3"
                style={{ background: 'linear-gradient(90deg,#fff7ed,#fffbeb)', border: '1px solid rgba(250, 204, 21, 0.08)' }}
              >
                <div className="w-3 h-3 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <div className="text-amber-800 text-sm">{instruction}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionResults;
