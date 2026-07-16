<div align="center">

# 💊 Inscribed Prescription Digitalization and Multilingual Accessibility

### AI-Powered Healthcare Solution for Digitizing Handwritten Medical Prescriptions

<p align="center">

<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>

<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express"/>

<img src="https://img.shields.io/badge/Tesseract.js-OCR-success?style=for-the-badge"/>

<img src="https://img.shields.io/badge/Google%20Cloud-Text--to--Speech-4285F4?style=for-the-badge&logo=googlecloud"/>

<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>

</p>

### Transforming Handwritten Prescriptions into Accessible Digital Healthcare Records

**OCR • Artificial Intelligence • Multilingual Translation • Text-to-Speech • Prescription History**

</div>

---

# 📖 Overview

Healthcare providers still rely heavily on handwritten prescriptions, which are often difficult to interpret and prone to human error. This project provides an AI-powered solution that digitizes handwritten prescriptions into structured digital records.

Using Optical Character Recognition (OCR), multilingual translation, and text-to-speech technology, the application improves accessibility for patients, pharmacists, and healthcare professionals while preserving prescription history for future reference.

---

# 🎯 Objectives

- Digitize handwritten prescriptions using OCR.
- Improve readability of medical prescriptions.
- Support multilingual translation for better accessibility.
- Enable voice playback using Text-to-Speech.
- Maintain a searchable prescription history.
- Reduce prescription interpretation errors.

---

# ✨ Features

## 🔍 OCR-Based Prescription Recognition

- Upload handwritten prescription images.
- Extract text using Tesseract.js OCR.
- Convert handwritten prescriptions into digital text.
- High-accuracy text recognition.

---

## 💊 Medicine Information Extraction

Automatically extracts:

- Medicine Name
- Dosage
- Frequency
- Duration
- Quantity
- Medical Instructions

---

## 🌍 Multilingual Translation

Translate extracted prescription text into multiple languages.

Supported languages include:

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

Convert translated prescription text into speech.

Benefits:

- Accessibility for visually impaired users.
- Support for elderly patients.
- Easy understanding of prescription instructions.

---

## 📜 Prescription History

Maintain a digital history of previously processed prescriptions.

Features include:

- View previous prescriptions.
- Search prescription records.
- Revisit translated prescriptions.
- Organized chronological history.

---

## 🔒 Secure Backend

- Express REST APIs
- Environment Variables
- Helmet Security
- CORS Protection
- Rate Limiting

---

# 🏗️ System Architecture

```
                    User
                      │
                      ▼
         Upload Prescription Image
                      │
                      ▼
               Tesseract.js OCR
                      │
                      ▼
          Extracted Prescription Text
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
 Translation API  Medicine Parser  Text-to-Speech
        │             │             │
        └─────────────┼─────────────┘
                      ▼
         Digital Prescription Record
                      │
                      ▼
          Prescription History
```

---

# 🔄 Workflow

```
Upload Image
      │
      ▼
OCR Recognition
      │
      ▼
Medicine Extraction
      │
      ▼
Language Translation
      │
      ▼
Text-to-Speech
      │
      ▼
Save to History
      │
      ▼
View Previous Prescriptions
```

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- HTML5
- CSS3

## Backend

- Node.js
- Express.js

## OCR

- Tesseract.js

## APIs

- Translation API
- Google Cloud Text-to-Speech

## Security

- Helmet
- CORS
- Express Rate Limiter
- dotenv

## Development Tools

- Git
- GitHub
- Visual Studio Code
- npm

---

# 📂 Project Structure

```
project-root/
│
├── api/
├── public/
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── services/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── .env
└── README.md
```

---

# 📋 Prerequisites

Install the following software:

- Node.js (v18+)
- npm
- Git

Verify installation:

```bash
node -v
npm -v
git --version
```

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repository.git
```

Navigate to the project:

```bash
cd your-repository
```

Install dependencies:

```bash
npm install
```

If the backend has a separate `package.json`:

```bash
cd server
npm install
cd ..
```

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
REACT_APP_TRANSLATE_API_URL=
REACT_APP_TRANSLATE_API_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
PORT=5000
```

---

# ▶️ Running the Project

### Start the Frontend

```bash
npm run dev
```

Frontend URL:

```
http://localhost:5173
```

---

### Start the Backend

Open another terminal:

```bash
cd server
```

Start the server:

```bash
node app.js
```

If using another entry point:

```bash
node index.js
```

Or with Nodemon:

```bash
npm run dev
```

Backend URL:

```
http://localhost:5000
```

---

# 🧪 Usage

1. Start the frontend and backend servers.
2. Upload a handwritten prescription image.
3. Wait for OCR to process the image.
4. Review the extracted prescription details.
5. Translate the prescription into the preferred language.
6. Listen to the translated text using Text-to-Speech.
7. Save the prescription.
8. View and manage previous prescriptions through the History section.

---

# 🌍 Real-World Applications

- Hospitals
- Clinics
- Pharmacies
- Telemedicine Platforms
- Rural Healthcare
- Digital Health Services
- Healthcare Research
- Medical Education

---

# 🚀 Future Enhancements

- AI Medicine Recommendation
- Drug Interaction Detection
- Electronic Health Records (EHR)
- Patient Authentication
- Doctor Dashboard
- Hospital Management Integration
- Mobile Application
- Offline OCR
- Cloud Synchronization
- Smart Search Filters
- Medicine Reminder Notifications

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you find this project helpful:

- ⭐ Star this repository
- 🍴 Fork the repository
- 🐛 Report issues
- 💡 Suggest new features

---

<div align="center">

### Built to improve healthcare accessibility through Artificial Intelligence.

**Making handwritten prescriptions readable, understandable, and accessible for everyone.**

</div>
