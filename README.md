<div align="center">

# 💊 Prescription Analyzer

### AI-Powered Prescription Digitization & Healthcare Assistant

<p align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>

<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express"/>

<img src="https://img.shields.io/badge/Tesseract.js-OCR-success?style=for-the-badge"/>

<img src="https://img.shields.io/badge/Google%20Cloud-Text%20to%20Speech-4285F4?style=for-the-badge&logo=googlecloud"/>

<img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge"/>

</p>

### 🏥 Transforming Handwritten Prescriptions into Digital Healthcare Records

**OCR • Artificial Intelligence • Translation • Voice Assistance • Prescription History**

</div>

---

# 📖 About The Project

Prescription Analyzer is an AI-powered healthcare application designed to digitize handwritten medical prescriptions into structured, readable, and multilingual digital records.

The application combines Optical Character Recognition (OCR), language translation, speech synthesis, and secure prescription history management to improve accessibility for patients, doctors, and pharmacists.

It simplifies prescription understanding while reducing manual interpretation errors and enabling digital healthcare workflows.

---

# ✨ Features

## 🔍 Intelligent OCR

Convert handwritten prescriptions into editable digital text using **Tesseract.js OCR**.

### Capabilities

- Upload prescription images
- Detect handwritten text
- Extract medicine information
- Recognize dosage and instructions

---

## 💊 Medicine Information Extraction

Automatically identifies

- Medicine Name
- Dosage
- Quantity
- Frequency
- Duration
- Medical Instructions

---

## 🌍 Multi-language Translation

Translate prescriptions into regional and international languages.

Supported Languages

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

Listen to translated prescriptions using speech synthesis.

Useful for

- Elderly Patients
- Visually Impaired Users
- Rural Healthcare
- Accessibility Support

---

## 📜 Prescription History

Store and revisit previously scanned prescriptions.

Features

- View previous scans
- Organized prescription timeline
- Quick search
- Revisit translated results
- Persistent digital records

---

## 🔒 Secure Processing

- Express Backend APIs
- Helmet Security
- Rate Limiting
- Environment Variables
- Secure API Communication

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
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
 Translation API   Medicine Parser   Text-to-Speech
        │             │              │
        └─────────────┼──────────────┘
                      ▼
         Digital Prescription Record
                      │
                      ▼
          Prescription History Storage
                      │
                      ▼
            Patient Dashboard
```

---

# 📂 Project Structure

```
Prescription-Analyzer/
│
├── api/
│   ├── translate.js
│   ├── speech.js
│   └── services/
│
├── public/
│
├── server/
│   ├── app.js
│   ├── routes/
│   ├── controllers/
│   └── middleware/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
│
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- HTML5
- CSS3

---

## Backend

- Node.js
- Express.js

---

## OCR

- Tesseract.js

---

## APIs

- Translation API
- Google Cloud Text-to-Speech

---

## Security

- Helmet
- CORS
- Express Rate Limiter
- dotenv

---

## Development Tools

- VS Code
- Git
- GitHub
- npm

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/ajay-yv/prescription.git
```

---

## Navigate

```bash
cd prescription
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Frontend

```bash
npm run dev
```

---

## Start Backend

```bash
node server/app.js
```

---

# ⚙️ Environment Variables

Create a `.env` file.

```env
REACT_APP_TRANSLATE_API_URL=

REACT_APP_TRANSLATE_API_KEY=

GOOGLE_APPLICATION_CREDENTIALS=

PORT=5000
```

---

# 🔄 Workflow

```
Upload Prescription

        │

        ▼

OCR Processing

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

Save Prescription History

        │

        ▼

View Previous Records
```

---

# 🎯 Applications

✔ Hospitals

✔ Clinics

✔ Pharmacies

✔ Rural Healthcare

✔ Telemedicine

✔ Medical Education

✔ Digital Health Platforms

---

# 🚀 Future Enhancements

- AI Medicine Recommendation
- Drug Interaction Detection
- Patient Authentication
- Doctor Dashboard
- Hospital Management Integration
- Electronic Health Records (EHR)
- Cloud Synchronization
- AI Medical Chatbot
- Mobile Application
- Offline OCR
- Smart Search Filters
- Medicine Reminder Notifications

---

# 📸 Screenshots

| Home | OCR Result |
|------|------------|
| Add Screenshot | Add Screenshot |

| Translation | History |
|-------------|---------|
| Add Screenshot | Add Screenshot |

---

# 📊 Project Highlights

- AI-powered OCR Recognition
- Handwritten Prescription Digitization
- Medicine Information Extraction
- Multi-language Translation
- Google Text-to-Speech
- Prescription History
- Secure Backend APIs
- Responsive User Interface
- Healthcare Accessibility

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.

2. Create your feature branch.

```bash
git checkout -b feature-name
```

3. Commit changes.

```bash
git commit -m "Add new feature"
```

4. Push to GitHub.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

## Ajay Y V

**Computer Science & Engineering (Data Science)**

Sai Vidya Institute of Technology

📍 Bengaluru, Karnataka, India

### GitHub

https://github.com/ajay-yv

### LinkedIn

https://www.linkedin.com/in/ajay-y-v-987755292/

---

<div align="center">

## ⭐ If you found this project useful, please consider giving it a Star!

Made with ❤️ by **Ajay Y V**

</div>
