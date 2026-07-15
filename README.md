<div align="center">

# 💊 Prescription Analyzer
### AI-Powered Digital Prescription Processing System

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)
![OCR](https://img.shields.io/badge/OCR-Tesseract.js-green?style=for-the-badge)
![Google TTS](https://img.shields.io/badge/Text--to--Speech-Google-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

### 🩺 Transforming Handwritten Prescriptions into Digital Healthcare Records

**AI • OCR • Translation • Voice Assistance • QR Code • PDF Export**

---

</div>

# 📖 Overview

Prescription Analyzer is an intelligent healthcare application that converts handwritten medical prescriptions into structured digital records using **Optical Character Recognition (OCR)** and AI-assisted text processing.

The application helps patients, pharmacists, and healthcare professionals understand prescriptions more easily by offering multilingual translation, voice playback, PDF export, and QR code generation.

This project demonstrates the practical application of Artificial Intelligence in healthcare digitization.

---

# ✨ Features

## 🔍 AI OCR Recognition

- Extracts handwritten prescription text
- Supports scanned images and photographs
- Powered by **Tesseract.js OCR**

---

## 💊 Medicine Detection

Automatically identifies

- Medicine Name
- Dosage
- Frequency
- Instructions
- Prescription Notes

---

## 🌍 Multilingual Translation

Translate prescriptions into multiple languages.

Examples:

- English
- Kannada
- Hindi
- Telugu
- Tamil
- Malayalam
- Marathi
- Bengali

---

## 🔊 Text-to-Speech

Listen to prescription instructions using

- Google Text-to-Speech
- Browser Speech API

Helpful for

- Elderly patients
- Visually impaired users
- Patients with reading difficulties

---

## 📄 PDF Export

Generate professional PDF reports containing

- Patient Prescription
- Medicine Details
- Doctor Instructions
- Translated Content

---

## 📱 QR Code Generation

Generate QR codes that allow digital access to prescription information.

---

## 🔒 Secure Processing

- Environment Variables
- Express API
- Helmet Security
- Rate Limiting
- CORS Protection

---

# 🏗 System Architecture

```
                    User Upload
                         │
                         ▼
                Prescription Image
                         │
                         ▼
                 Tesseract.js OCR
                         │
                         ▼
              Extracted Prescription
                         │
        ┌────────────────┼──────────────┐
        ▼                ▼              ▼
 Translation API      Text-to-Speech   Medicine Parser
        │                │              │
        └────────────┬───┴──────────────┘
                     ▼
          Digital Prescription Report
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
     PDF Export              QR Code
```

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- HTML5
- CSS3

---

## Backend

- Express.js
- Node.js

---

## AI & OCR

- Tesseract.js

---

## Voice

- Google Cloud Text-to-Speech
- Browser Speech API

---

## APIs

- Translation API
- Express REST APIs

---

## Security

- Helmet
- CORS
- Express Rate Limiter
- Dotenv

---

## Utilities

- UUID
- CryptoJS
- Body Parser
- Morgan Logging

---

# 📂 Project Structure

```
Prescription/
│
├── prescription-analyzer/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── App.tsx
│   └── index.tsx
│
├── api/
│   ├── translate.js
│   └── text-to-speech.js
│
├── server/
│   ├── translate_proxy.js
│   └── translate_tts.js
│
├── public/
│
├── package.json
│
└── README.md
```

---

# ⚙ Installation

Clone Repository

```bash
git clone https://github.com/ajay-yv/prescription.git
```

Move into project

```bash
cd prescription
```

Install dependencies

```bash
npm install
```

Run project

```bash
npm start
```

Application starts on

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create

```
.env
```

Example

```env
REACT_APP_TRANSLATE_API_URL=

REACT_APP_TRANSLATE_API_KEY=

GOOGLE_APPLICATION_CREDENTIALS=

PORT=5000
```

---

# 📷 Application Workflow

### Step 1

Upload Prescription Image

↓

### Step 2

OCR extracts handwritten text

↓

### Step 3

Medicine details are identified

↓

### Step 4

Translate into preferred language

↓

### Step 5

Listen using Voice Assistant

↓

### Step 6

Download PDF

↓

### Step 7

Generate QR Code

---

# 🚀 Future Enhancements

- AI Medicine Recommendation
- Drug Interaction Detection
- Doctor Portal
- Patient Login
- Hospital Dashboard
- Electronic Health Records
- Cloud Database Integration
- AI Chatbot for Prescription Guidance
- Mobile Application
- Offline OCR Support

---

# 📊 Key Highlights

✔ OCR-Based Prescription Recognition

✔ AI Assisted Text Processing

✔ Voice Assistance

✔ Multi-language Translation

✔ PDF Generation

✔ QR Code Sharing

✔ Secure Backend APIs

✔ Healthcare Digitization

---

# 🎯 Real World Applications

- Hospitals
- Clinics
- Medical Stores
- Telemedicine
- Rural Healthcare
- Digital Health Platforms
- Healthcare Research

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Create Pull Request

---

# 👨‍💻 Author

## Ajay Y V

Computer Science & Engineering (Data Science)

Sai Vidya Institute of Technology

Bengaluru, Karnataka

### GitHub

https://github.com/ajay-yv

### LinkedIn

https://www.linkedin.com/in/ajay-y-v-987755292/

---

# ⭐ Support

If you found this project useful,

⭐ Star this repository

🍴 Fork it

🩺 Share it with others

---

<div align="center">

### ⭐ If you like this project, don't forget to Star the Repository ⭐

Made with ❤️ by **Ajay Y V**

</div>
