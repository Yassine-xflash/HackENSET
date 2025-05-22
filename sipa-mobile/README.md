# SIPA: Academic Integrity Preservation System

*Developed for the Hackathon IA Vigilante 2025*

This project is a prototype designed to demonstrate an integrated solution for detecting and preventing academic fraud. It combines text analysis, real-time visual and audio surveillance, and a proactive educational assistant to uphold academic integrity.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation and Setup](#installation-and-setup)
- [Using the Application](#using-the-application)
- [Ethical Considerations](#ethical-considerations)
- [Limitations of the MVP](#limitations-of-the-mvp)
- [Mobile Application (Expo App)](#mobile-application-expo-app)
  - [Get Started](#get-started)
  - [Get a Fresh Project](#get-a-fresh-project)
  - [Learn More](#learn-more)
  - [Join the Community](#join-the-community)

## Introduction

The SIPA (Système Intelligent de Préservation de l'Intégrité Académique) project is a Minimum Viable Product (MVP) developed for the Hackathon IA Vigilante 2025. It aims to combat academic dishonesty by integrating advanced detection mechanisms—such as plagiarism and AI-generated content analysis, real-time exam monitoring with facial recognition, and movement tracking—with a chatbot that educates users on academic integrity.

## Features

- **Text Submission Analysis:** Simulated detection of semantic plagiarism and AI-generated content.
- **Real-Time Exam Simulation:**
  - **Facial Recognition:** Simulated identity verification using a webcam.
  - **Head Movement Tracking:** Alerts for abnormal movements (e.g., looking sideways).
  - **Multiple Face Detection:** Alerts if another person appears in the frame.
  - **Suspicious Object Detection:** Alerts for detected phones or papers.
  - **External Voice Detection:** Alerts for unexpected vocal activity via microphone.
  - *Note:* AI models in this MVP are simplified/simulated; no video or audio is recorded.
- **Proactive Assistant (Chatbot):** A rule-based chatbot offering guidance on academic integrity and contextual advice post-detection.
- **Educator Dashboard:** Displays logged detection alerts (textual and visual/audio) for oversight.
- **Simple Database:** Utilizes SQLite to store detection logs.

## Installation and Setup

Follow these steps to set up and run the application locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Yassine-xflash/HackENSET.git
   cd HackENSET
   ```

2. **Set Up a Virtual Environment and Install Dependencies:**
   Using a virtual environment is highly recommended to isolate dependencies.
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   *Note:* Installing `dlib` and `PyAudio` may require system compilation tools. Refer to their official documentation if issues arise.

3. **Prepare the Facial Enrollment Image:**
   - Create a `static/img/` folder at the root of `HackENSET/` if it doesn’t exist.
   - Place a clear face image named `known_student_face.jpg` in this folder for simulated student enrollment. If omitted, a placeholder image is generated at startup.

4. **Launch the Flask Application:**
   ```bash
   python app.py
   ```
   The server will start and be accessible at `http://127.0.0.1:5000/` or `http://localhost:5000/`.

## Using the Application

- **Home Page (`/`):** Select either the Student or Educator portal.
- **Student Portal (`/student`):**
  - **Text Analysis:** Paste text and click "Analyze Assignment" to view results (plagiarism, AI detection).
  - **Exam Simulation:** Click "Start Exam," grant webcam and microphone permissions, and observe real-time alerts. End with "Stop Exam."
  - **Proactive Assistant:** Engage with the chatbot for academic integrity queries.
- **Educator Dashboard (`/educator`):**
  - Review logged detection alerts (textual and visual/audio), updated automatically.

## Ethical Considerations

This prototype prioritizes ethical design:
- **Transparency:** Users are informed that no video or audio is recorded.
- **Non-Storage of Raw Data:** Only detection metadata is logged.
- **False Positives:** Acts as an alert indicator, requiring human review.
- **Education:** The assistant focuses on educating rather than punishing.

## Limitations of the MVP

- Simplified AI models use pre-trained libraries with basic detection logic, not tailored to academic fraud datasets.
- Real-time audio/video integration relies on HTTP POST, a simplification; WebSockets would be ideal for robustness.
- Lacks user management and authentication.
- SQLite database is basic and not suited for concurrent, large-scale use.

## Mobile Application (Expo App)

The React Native mobile app, built with Expo, extends the SIPA prototype’s functionality.

### Get Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the App:**
   ```bash
   npx expo start
   ```
   Options to run the app include:
   - [Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) (a sandbox for testing)

   Edit files in the **app** directory to develop, using [file-based routing](https://docs.expo.dev/router/introduction).

### Get a Fresh Project

To reset and start anew:
```bash
npm run reset-project
```
This moves starter code to **app-example** and creates a blank **app** directory.

### Learn More

Explore these resources for Expo development:
- [Expo Documentation](https://docs.expo.dev/): Core concepts and advanced [guides](https://docs.expo.dev/guides).
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/): Step-by-step project creation for Android, iOS, and web.

### Join the Community

Connect with developers:
- [Expo on GitHub](https://github.com/expo/expo): Contribute to the open-source platform.
- [Discord Community](https://chat.expo.dev): Discuss and seek help.
