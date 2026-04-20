#  MedGuardian

An AI-powered medication management system designed to improve adherence and enable proactive healthcare monitoring for patients and caregivers.

---

## Problem Statement

Medication non-adherence is a major real-world issue, especially for elderly patients and individuals with chronic conditions. Missing or incorrectly taking medications can lead to serious health complications.

**MedGuardian** solves this by:

* Tracking medication schedules
* Monitoring adherence patterns
* Providing AI-driven insights
* Enabling caregiver supervision

---

## 👥 Target Users

* **Patients** → Manage and track medications
* **Caregivers** → Monitor patient adherence and intervene when needed

---

## 💡 Key Features

###  Authentication & Roles

* Secure login/signup using Firebase Authentication
* Role-based access (Patient / Caregiver)
* Protected routes for secure navigation

---

###  Medication Management (CRUD)

* Add, update, and delete medications
* Track dosage, frequency, and schedule
* Log doses as taken or missed
* Persistent storage using Firestore

---

###  Adherence Dashboard

* Adherence percentage tracking
* Missed dose alerts
* Streak tracking
* Weekly trend visualization

---

###  AI Insights (Gemini API)

* Risk analysis based on adherence
* Behavioral pattern detection
* Actionable recommendations

> AI responses are processed through a secure backend with defensive parsing to ensure stability.

---

###  Caregiver System

* Link caregiver to patient
* Monitor patient activity and adherence
* View alerts and trends

---

###  Prescription Scanner *(In Progress)*

* Upload prescription images
* Extract medication details using AI
* Autofill medication form

> Backend logic implemented; UI integration and refinement ongoing.

---

##  Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS
* React Router
* Context API (state management)

**Backend / Services**

* Firebase Authentication
* Firestore Database
* Gemini API (AI insights)
* Vercel (deployment)

---

##  Key Technical Decisions

* **Context API** used to manage global state and avoid prop drilling
* **Protected Routes** ensure role-based access control
* **Lazy Loading (`React.lazy`, `Suspense`)** improves performance
* **useMemo** used to optimize derived data (adherence, trends)
* **Backend API for Gemini** ensures API key security
* **Defensive Parsing** prevents crashes due to inconsistent AI responses
* **Deterministic IDs for logs** prevent duplicate medication entries

---

##  Project Structure

```
/components
/pages
/hooks
/context
/services
/utils
```

---

## 🌐 Live Demo

👉 https://med-guardian-rho.vercel.app

---

## ⚖️ Challenges Faced

* Handling inconsistent AI responses
* Preventing duplicate medication logs
* Managing role-based routing and state
* Ensuring secure API usage

---

## 🔮 Future Improvements

* Complete prescription scanner UI
* Real-time notifications
* Advanced analytics & predictions
* Mobile app support

---

## 🧠 Conclusion

MedGuardian combines structured data, real-time tracking, and AI-powered insights to improve medication adherence and enable proactive healthcare monitoring.

---

## 👨‍💻 Author

**Manan**
