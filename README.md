<div align="center">

# 💊 Prescription Analyzer

### Inscribed Prescription Digitalization and Multilingual Accessibility

<p align="center">

<img src="https://img.shields.io/github/license/ajay-yv/prescription?style=for-the-badge">

<img src="https://img.shields.io/github/stars/ajay-yv/prescription?style=for-the-badge">

<img src="https://img.shields.io/github/forks/ajay-yv/prescription?style=for-the-badge">

<img src="https://img.shields.io/github/last-commit/ajay-yv/prescription?style=for-the-badge">

</p>

<p align="center">

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white">

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">

<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white">

<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express">

<img src="https://img.shields.io/badge/Tesseract.js-OCR-success?style=for-the-badge">

<img src="https://img.shields.io/badge/Google%20Cloud-Text%20to%20Speech-4285F4?style=for-the-badge&logo=googlecloud">

</p>

### Transforming Handwritten Medical Prescriptions into Intelligent Digital Healthcare Records

**OCR • Artificial Intelligence • Healthcare • Translation • Text-to-Speech • Prescription History**

</div>

---

# 📚 Table of Contents

* About the Project
* Key Features
* System Architecture
* Workflow
* Technology Stack
* Project Structure
* Prerequisites
* Installation
* Environment Variables
* Running the Project
* Usage
* Applications
* Future Enhancements
* Contributing
* License
* Author

---

# 📖 About the Project

Prescription Analyzer is an AI-powered healthcare application that converts handwritten medical prescriptions into structured digital records using Optical Character Recognition (OCR).

The system extracts prescription details, identifies medicine information, translates prescriptions into multiple languages, provides voice assistance using Text-to-Speech, and maintains a searchable prescription history for future reference.

This project demonstrates the practical application of Artificial Intelligence in healthcare digitization, improving accessibility, reducing manual interpretation errors, and supporting digital healthcare workflows.

---

# ✨ Key Features

## 🔍 OCR-Based Prescription Recognition

* Upload handwritten prescription images
* Extract handwritten text using Tesseract.js
* Convert scanned prescriptions into editable digital text
* High-accuracy OCR processing

---

## 💊 Medicine Information Extraction

Automatically identifies:

* Medicine Name
* Dosage
* Frequency
* Duration
* Quantity
* Medical Instructions

---

## 🌍 Multi-Language Translation

Translate prescriptions into multiple languages including:

* English
* Kannada
* Hindi
* Telugu
* Tamil
* Malayalam
  

---

## 🔊 Text-to-Speech

Read prescriptions aloud using speech synthesis.

Useful for:

* Elderly patients
* Visually impaired users
* Rural healthcare
* Accessibility support

---

## 📜 Prescription History

Maintain a digital history of processed prescriptions.

Features:

* View previous prescriptions
* Search previous records
* Access translated prescriptions
* Organized chronological history
* Easy retrieval of patient records

---

## 🔒 Secure Backend

* Express REST APIs
* Helmet Security
* CORS Protection
* Environment Variables
* Rate Limiting

---

# 🏗️ System Architecture

```text
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
      Digital Prescription Information
                      │
                      ▼
         Prescription History Storage
                      │
                      ▼
             User Dashboard
```

---

# 🔄 Project Workflow

```text
Upload Prescription Image
           │
           ▼
OCR Text Extraction
           │
           ▼
Medicine Information Extraction
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

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### OCR

* Tesseract.js

### APIs

* Translation API
* Google Cloud Text-to-Speech

### Security

* Helmet
* CORS
* Express Rate Limiter
* dotenv

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

---

# 📂 Project Structure

```text
prescription/
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
│   ├── middleware/
│   └── utils/
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

* Node.js (v18 or later)
* npm
* Git

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
git clone https://github.com/ajay-yv/prescription.git
```

Navigate into the project:

```bash
cd prescription
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

Create a `.env` file in the project root:

```env
REACT_APP_TRANSLATE_API_URL=
REACT_APP_TRANSLATE_API_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
PORT=5000
```

Fill these values with your API credentials before running the application.

---

# ▶️ Running the Project

### Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

### Start the Backend

Open a new terminal:

```bash
cd server
```

Run:

```bash
node app.js
```

If your entry file is different:

```bash
node index.js
```

Or, if you use Nodemon:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

# 🧪 How to Use

1. Launch the frontend and backend servers.
2. Upload a handwritten prescription image.
3. OCR extracts the handwritten text.
4. Review the detected medicine information.
5. Translate the prescription into your preferred language.
6. Listen to the translated prescription using Text-to-Speech.
7. Save the prescription.
8. Access previous prescriptions from the History section.

---

# 🎯 Real-World Applications

* Hospitals
* Clinics
* Pharmacies
* Telemedicine Platforms
* Rural Healthcare
* Digital Health Services
* Medical Education
* Healthcare Research

---

# 🚀 Future Enhancements

* AI-based Medicine Recommendation
* Drug Interaction Detection
* Electronic Health Records (EHR)
* Doctor Dashboard
* Patient Authentication
* Hospital Management Integration
* AI Medical Chatbot
* Mobile Application
* Offline OCR Processing
* Cloud Synchronization
* Smart Search Filters
* Medicine Reminder Notifications

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.

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

# 👨‍💻 Author

**Ajay Y V**

Computer Science & Engineering (Data Science)

Sai Vidya Institute of Technology

📍 Bengaluru, Karnataka, India

**GitHub:** https://github.com/ajay-yv

**LinkedIn:** https://www.linkedin.com/in/ajay-y-v-987755292/

---

<div align="center">

### ⭐ If you found this project useful, please give it a Star!

Made with ❤️ by **Ajay Y V**

</div>
