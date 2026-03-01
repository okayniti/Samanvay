# 🤝 Samanvay — A Two-Way Indian Sign Language Interpreter

> *Bridging the gap between signed and spoken language through AI-powered real-time interpretation.*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-4285F4?logo=google)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e58b8781-ce8d-4018-9b9c-2127672e7847" />

---

## 🎯 Vision

Samanvay (समन्वय — meaning *harmony, coordination*) was born from a personal journey of wanting to learn Indian Sign Language and realizing the vast communication gap between the hearing and deaf communities.

This is not a toy demo — it's a **modular, production-ready architecture** for a two-way ISL interpreter that runs entirely in the browser. MediaPipe powers real-time hand and face landmark detection, while a pluggable gesture engine maps hand configurations to ISL signs. The system is designed so that the heuristic matching can be replaced with trained CNN/LSTM models without touching the rest of the codebase.

---

## ✨ Features

### Two-Way Communication
| ISL → English | English → ISL |
|---|---|
| Real-time webcam hand tracking | Text & voice input |
| Gesture recognition (15 ISL signs) | Animated sign avatar display |
| Text-to-Speech output | Word-by-word sign sequence |
| Emotion-aware tone modification | Fingerspelling fallback |

### Core Capabilities
- **🖐️ Hand Landmark Detection** — MediaPipe HandLandmarker with GPU acceleration
- **😊 Emotion Detection** — Facial expression analysis (Happy, Sad, Neutral, Angry, Surprised)
- **🎓 Teach Me Mode** — Keypoint visualization, confidence scores, slow-motion replay
- **🔊 Speech Integration** — Text-to-Speech & Speech-to-Text via Web Speech API
- **🌐 Multilingual Architecture** — Translation abstraction layer ready for Hindi and beyond

---

## 🏗️ Technical Architecture

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
│  │ GestureEngine│  │ EmotionDetect│  │ TranslationService  │ │
│  │ + Dictionary │  │              │  │ + TextToSign        │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                │                                   │
│  ┌──────┴──────┐  ┌──────┴───────┐                           │
│  │ MediaPipe   │  │ MediaPipe    │                           │
│  │ HandLandmark│  │ FaceLandmark │                           │
│  └─────────────┘  └──────────────┘                           │
├──────────────────────────────────────────────────────────────┤
│  State: Zustand    Speech: Web Speech API    Styles: CSS     │
└──────────────────────────────────────────────────────────────┘
```

### Module Breakdown

| Module | Purpose |
|---|---|
| `engine/` | Gesture recognition — `GestureEngine`, `LandmarkProcessor`, `SignDictionary` |
| `emotion/` | Facial emotion classification from face landmarks |
| `translation/` | Abstraction layer for multi-language support |
| `speech/` | Text-to-Speech and Speech-to-Text wrappers |
| `store/` | Zustand-based global state management |
| `hooks/` | `useWebcam`, `useMediaPipe`, `useTeachMe` |
| `components/` | `Layout/`, `Camera/`, `Chat/`, `Avatar/`, `TeachMe/` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A modern browser with WebGL support (Chrome recommended)
- Webcam (for ISL → English mode)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/your-username/samanvay.git
cd samanvay

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 💡 Why I Built This

Learning sign language opened my eyes to how isolated deaf and hard-of-hearing people can feel in everyday interactions. Existing tools are either:
- **Research prototypes** locked behind academic paywalls
- **Toy demos** that recognize 5 letters of ASL
- **ASL-only** — ignoring Indian Sign Language entirely

Samanvay is my attempt at building something **real**: a modular, extensible platform that respects ISL as a first-class language, with an architecture that grows from heuristic matching today to full neural models tomorrow.

---

## 🔮 Future Scope

| Feature | Status |
|---|---|
| CNN/LSTM model for gesture recognition | 🏗️ Architecture ready |
| 3D avatar for sign animation | 🏗️ Plug-in point created |
| Hindi language support | 🏗️ Translation layer abstracted |
| Gesture-based learning games | 📋 Planned |
| Analytics dashboard | 📋 Planned |
| Mobile responsive PWA | 📋 Planned |
| ISL video dataset collection tool | 📋 Planned |

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite 6
- **State**: Zustand
- **Vision AI**: MediaPipe Tasks Vision (Hand + Face Landmarker)
- **Speech**: Web Speech API (SpeechSynthesis + SpeechRecognition)
- **Styling**: Vanilla CSS with custom design tokens

---

## 📄 License

MIT

---

<p align="center">
  <em>Samanvay — Because communication is a human right, not a privilege.</em>
</p>
