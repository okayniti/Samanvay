# 🤝 Samanvay — A Two-Way Sign Language Interpreter

> *Bridging the gap between signed and spoken language through AI-powered real-time interpretation.*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?logo=tensorflow)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-4285F4?logo=google)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

<img width="1920" height="1080" alt="Samanvay — Sign Language Interpreter" src="https://github.com/user-attachments/assets/32dad445-9377-4dfb-8396-246d597222be" />

---

## 🎯 Vision

**Samanvay** (समन्वय — meaning *harmony, coordination*) was born from a personal journey of wanting to learn Indian Sign Language and realizing the vast communication gap between the hearing and deaf communities.

This is not a toy demo — it's a **modular, production-ready architecture** for a two-way sign language interpreter that runs **entirely in the browser**. A trained Dense neural network classifies hand landmarks extracted by MediaPipe into 29 sign classes in real-time. The system is designed so the model can be swapped with CNN/LSTM architectures without touching the rest of the codebase.

---

## ✨ Features

### Two-Way Communication

| 🖐️ Sign → Text | ✏️ Text → Sign |
|---|---|
| Real-time webcam hand tracking | Text & voice input |
| ML-powered gesture recognition (29 classes) | Animated sign avatar display |
| Sentence building from detected signs | Word-by-word sign sequence |
| Text-to-Speech output | Fingerspelling fallback |
| Emotion-aware tone modification | — |

### Core Capabilities

- **🧠 ML Sign Classification** — Dense neural network trained on 29K+ hand landmark samples (ASL Alphabet dataset), exported to TensorFlow.js for browser inference
- **🖐️ Hand Landmark Detection** — MediaPipe HandLandmarker with 21-point tracking and GPU acceleration
- **😊 Emotion Detection** — Facial expression analysis (Happy, Sad, Neutral, Angry, Surprised) via face landmarks
- **🎓 Teach Me Mode** — Interactive learning with keypoint visualization, confidence scores, and real-time feedback
- **🔊 Speech Integration** — Text-to-Speech & Speech-to-Text via Web Speech API
- **🌐 Multilingual Architecture** — Translation abstraction layer ready for Hindi and beyond

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        App Shell                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Header     │  │ Mode Toggle  │  │  Teach Me Toggle    │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
├────────────────────────┬─────────────────────────────────────┤
│     Left Panel         │         Right Panel                 │
│  ┌──────────────────┐  │  ┌───────────────────────────────┐  │
│  │  WebcamFeed /     │  │  │  OutputPanel / SignAvatar     │  │
│  │  TextInput        │  │  │                               │  │
│  └──────────────────┘  │  └───────────────────────────────┘  │
├────────────────────────┴─────────────────────────────────────┤
│                     Engine Layer                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ ModelLoader  │  │ EmotionDetect│  │ TranslationService  │ │
│  │ + Gesture   │  │              │  │ + TextToSign        │ │
│  │ + Dictionary│  │              │  │                     │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                │                                   │
│  ┌──────┴──────┐  ┌──────┴───────┐  ┌─────────────────────┐ │
│  │ MediaPipe   │  │ MediaPipe    │  │  TensorFlow.js      │ │
│  │ HandLandmark│  │ FaceLandmark │  │  Sign Classifier    │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  State: Zustand    Speech: Web Speech API    Styles: CSS     │
└──────────────────────────────────────────────────────────────┘
```

### Project Structure

```
Samanvay/
├── src/
│   ├── engine/          # GestureEngine, ModelLoader, LandmarkProcessor, SignDictionary
│   ├── emotion/         # Facial emotion classification from face landmarks
│   ├── translation/     # Abstraction layer for multi-language support
│   ├── speech/          # Text-to-Speech and Speech-to-Text wrappers
│   ├── store/           # Zustand-based global state management
│   ├── hooks/           # useWebcam, useMediaPipe, useTeachMe
│   ├── components/
│   │   ├── Layout/      # Header, ModeSelector, SplitScreen
│   │   ├── Camera/      # WebcamFeed with live hand tracking
│   │   ├── Chat/        # OutputPanel, SentenceDisplay, TextInput
│   │   ├── Avatar/      # SignAvatar for sign animation
│   │   └── TeachMe/     # ConfidenceScore, interactive learning UI
│   └── styles/          # CSS variables, animations, global styles
├── training/
│   ├── train_sign_model.py   # ML training pipeline (MediaPipe → Dense NN → TF.js)
│   ├── collect_custom.py     # Custom sign data collection tool
│   └── requirements.txt
└── public/models/            # Trained TF.js model (auto-loaded by app)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **Python 3.10+** (only for model training)
- A modern browser with WebGL support (Chrome recommended)
- Webcam (for Sign → Text mode)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/okayniti/Samanvay.git
cd Samanvay

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in Chrome. The pre-trained model loads automatically — start signing! 🤟

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧠 Model Training (Optional)

The app ships with a pre-trained model. If you want to retrain or customize:

```bash
cd training
python -m venv venv

# Activate virtual environment
# Windows (Git Bash): source venv/Scripts/activate
# macOS/Linux:        source venv/bin/activate

# Install dependencies
pip install opencv-python mediapipe tensorflow numpy scikit-learn Pillow tqdm kagglehub tf-keras matplotlib

# Run training pipeline
python train_sign_model.py
```

### Pipeline Overview

| Step | What Happens |
|---|---|
| **1. Data** | Downloads the ASL Alphabet dataset (87K images, 29 classes) via Kaggle API |
| **2. Extraction** | MediaPipe extracts 21 hand landmarks (63 features) per image |
| **3. Training** | Dense neural network trains on normalized landmark vectors |
| **4. Export** | Model exports to TensorFlow.js format → `public/models/sign_classifier/` |

**First run** takes ~15–30 min for extraction (cached for future runs). Training takes ~2 min.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **State Management** | Zustand |
| **Hand/Face Detection** | MediaPipe Tasks Vision |
| **Sign Classification** | TensorFlow.js (Dense NN) |
| **Speech** | Web Speech API (SpeechSynthesis + SpeechRecognition) |
| **Styling** | Vanilla CSS with custom design tokens |
| **ML Training** | TensorFlow + scikit-learn + MediaPipe (Python) |

---

## 💡 Why I Built This

Learning sign language opened my eyes to how isolated deaf and hard-of-hearing people can feel in everyday interactions. Existing tools are either:

- **Research prototypes** locked behind academic paywalls
- **Toy demos** that recognize a handful of ASL letters
- **ASL-only** — ignoring Indian Sign Language entirely

Samanvay is my attempt at building something **real**: a modular, extensible platform that respects sign language as a first-class language, with an architecture that grows from heuristic matching to full neural models.

---

## 🔮 Roadmap

| Feature | Status |
|---|---|
| Dense NN sign classifier (29 classes) | ✅ Complete |
| TF.js browser inference pipeline | ✅ Complete |
| Two-way communication (Sign ↔ Text) | ✅ Complete |
| Teach Me learning mode | ✅ Complete |
| Emotion-aware speech output | ✅ Complete |
| CNN/LSTM sequence model | 🏗️ Architecture ready |
| 3D avatar for sign animation | 🏗️ Plug-in point created |
| Hindi language support | 🏗️ Translation layer abstracted |
| ISL-specific gesture dataset | 📋 Planned |
| Mobile responsive PWA | 📋 Planned |
| Analytics dashboard | 📋 Planned |

---

## 📄 License

MIT © [Niti](https://github.com/okayniti)

---

<p align="center">
  <strong>Samanvay</strong> — Because communication is a human right, not a privilege. 🤟
</p>
