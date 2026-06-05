PulseAid 🩸
PulseAid is a smart Blood Donation & Emergency Assistance Platform built to connect Patients, Donors, Hospitals, Blood Banks, and NGOs in real-time during medical emergencies.
The platform helps patients quickly find blood donors, allows donors to respond to requests, and enables hospitals to manage blood inventories and emergency blood requirements efficiently.
🚀 Features
👨‍⚕️ Patient Module
User Registration & Login
Create Blood Request
Select Blood Group & Units Required
Hospital Name & Location Selection
Request Tracking
Real-Time Donor Tracking
Donor-Patient Chat
Request History
Profile Management
Notifications
🩸 Donor Module
Donor Registration & Login
View Nearby Blood Requests
Accept / Reject Requests
Digital Blood Vault
Donation History
Notifications
Profile Management
🏥 Hospital Module
Hospital Dashboard
Blood Inventory Management
Create Emergency Blood Requests
View Active Requests
Request Monitoring
Hospital Profile Management
🔔 Real-Time Features
Live Notifications
Real-Time Chat
Live Donor Tracking
Emergency Alerts
Socket.IO Integration
🛠️ Tech Stack
Frontend
React Native (Expo)
React Navigation
JavaScript
Backend
Node.js
Express.js
Socket.IO
Firebase Authentication
Firebase Firestore
Other Services
Firebase Cloud Services
Razorpay Payment Gateway
PDF Certificate Generation
📂 Project Structure
Plain text
PulseAid/
│
├── assets/
├── src/
│   ├── navigation/
│   ├── screens/
│   │   ├── patient/
│   │   ├── donor/
│   │   └── hospital/
│   ├── services/
│   └── components/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── App.js
└── package.json
📱 Modules Overview
Patient Workflow
Plain text
Register/Login
      ↓
Patient Dashboard
      ↓
Create Blood Request
      ↓
Donors Notified
      ↓
Donor Accepts Request
      ↓
Live Tracking
      ↓
Chat with Donor
      ↓
Blood Donation Completed
Donor Workflow
Plain text
Register/Login
      ↓
View Requests
      ↓
Accept Request
      ↓
Navigate to Patient
      ↓
Donate Blood
      ↓
Donation History Updated
Hospital Workflow
Plain text
Hospital Login
      ↓
Manage Inventory
      ↓
Create Blood Request
      ↓
Monitor Responses
      ↓
Track Donor Status
🎯 Problem Statement
During emergencies, finding compatible blood donors quickly is often difficult and time-consuming. PulseAid bridges this gap by creating a centralized platform where patients, donors, hospitals, NGOs, and blood banks can collaborate in real time.
💡 Future Enhancements
AI-Based Donor Matching
Blood Bank Integration
NGO Collaboration System
Ambulance Support
Geo-Fencing for Nearby Donors
Multi-Language Support
Push Notifications
Admin Analytics Dashboard
👥 Team Members
Name
Role
Aabir Roy
Backend Development, Authentication, DevOps
Souvik Samanta
Frontend Development
Debayan
Database & Backend Development
Amartya Ghosh
Backend Routes & API Development
⚙️ Installation
Frontend
Bash
npm install
npx expo start
Backend
Bash
cd backend

npm install

npm run dev
📄 License
This project is developed for educational, social impact, and hackathon purposes.
❤️ PulseAid
Connecting Donors. Saving Lives. Building Hope. 🩸🚑
