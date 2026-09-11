# 🎥 Connekt: A Full-Stack Real-Time Video Conferencing Platform

**Connekt** is a modern full-stack real-time video conferencing platform designed to make online communication simple, interactive, and accessible. It enables users to create or join meeting rooms using unique meeting codes and communicate through real-time video, audio, screen sharing, and chat.

The application provides a complete conferencing workflow — from user authentication and meeting creation/joining to real-time peer-to-peer communication, messaging, screen sharing, and meeting history.

Connekt combines **React, Vite, Node.js, Express.js, MongoDB, Mongoose, Socket.IO, WebRTC, Tailwind CSS, Shadcn/ui, Lucide React and Axios** to demonstrate the architecture and implementation of a real-world real-time communication application.

The frontend communicates with the backend through REST APIs and Socket.IO, while WebRTC is used for peer-to-peer media communication. Meeting history is persisted in MongoDB and associated with authenticated users.

With a responsive interface, real-time communication features, protected routes, and production deployment, Connekt is designed as a portfolio-ready full-stack application demonstrating modern web development and real-time system concepts.

---

# 🌐 Live Demo

🔗 **Website:** https://connekt-avishek.onrender.com

🔗 **Backend:** https://connekt-avishek-backend.onrender.com

> ⚠️ The backend is hosted on Render's free tier, so the first request after a period of inactivity may take longer while the service wakes up.

---

# 🎯 Key Features

- 🔐 User Login & Signup
- 🎥 Real-Time Video Conferencing
- 🎙️ Audio Communication
- 🖥️ Screen Sharing
- 💬 Real-Time Chat
- 🏠 Meeting Room Creation & Joining
- 🔑 Unique Meeting Codes
- 📜 Meeting History
- 🛡️ Protected Routes
- 📱 Responsive Meeting Interface
- ⚡ Real-Time Signaling with Socket.IO
- 🌐 WebRTC Peer-to-Peer Communication
- 🗄️ MongoDB-Based Data Persistence

---

# ✨ Features

## 🔐 Authentication & Authorization

- User registration with username and password
- Password hashing using `bcrypt`
- User login with token-based authentication
- Authentication-aware frontend routing
- Protected application pages
- Automatic logout functionality

## 🎥 Real-Time Video Conferencing

- Multi-user meeting rooms
- Real-time audio and video communication
- Meeting rooms based on shareable meeting codes
- WebRTC peer connections
- Socket.IO signaling
- Camera enable / disable controls
- Microphone enable / disable controls
- End-call functionality

## 🖥️ Screen Sharing

- Browser-based screen capture
- Screen-share start / stop controls
- Screen stream replacement during a meeting
- Automatic transition back to media after screen sharing ends

## 💬 Real-Time Chat

- Real-time meeting chat
- Message sending through Socket.IO
- Incoming message handling
- Sender identification
- Chat window toggle
- New-message indicator
- Message persistence for the active meeting session

## 🏠 Meeting Management

- Enter a meeting code to join a room
- Automatically save joined meetings to history
- Navigate directly to meeting rooms
- Return to the Home page after ending a call
- Authentication-protected meeting workflow

## 📜 Meeting History

- Save previously joined meeting codes
- Retrieve authenticated user's meeting history
- Display meeting codes with dates
- Navigate between Home and History pages
- Persistent storage using MongoDB

## 🛡️ Protected Routes

The Home page is protected using an authentication wrapper that checks whether an authentication token exists before allowing access. Unauthenticated users are redirected to the authentication page. 

## 🎨 User Interface

Connekt uses **TailwindCSS** and **Shadcn/ui** components for the authentication and meeting interfaces, combined with custom CSS modules for the conferencing experience.

The interface includes:

- Tailwind CSS buttons and form controls
- Responsive meeting layouts
- Dedicated chat panel
- Video participant layouts
- Meeting control buttons
- Responsive navigation
- Custom meeting-room styling

---

# 🏗️ Application Architecture

Connekt follows a client-server architecture with three primary components:

```text
                         ┌────────────────────────┐
                         │      React + Vite      │
                         │       Frontend         │
                         │                        │
                         │  Auth / Home / Meeting │
                         │  Chat / History / UI   │
                         └───────────┬────────────┘
                                     │
                         REST API / Socket.IO
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │   Node.js + Express    │
                         │        Backend         │
                         │                        │
                         │ Authentication / APIs  │
                         │ Socket.IO Signaling    │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │      MongoDB Atlas     │
                         │                        │
                         │ Users / Meetings       │
                         └────────────────────────┘

                                  WebRTC
                      Browser ◄──────────────► Browser
                        │                        │
                        └── Peer-to-Peer Media ──┘
```

---

# 🚀 Tech Stack

## 🖌️ Frontend

- React
- Vite
- JavaScript
- React Router
- TailwindCSS
- Shadcn/ui
- Axios
- Socket.IO Client
- CSS / CSS Modules

## ⚙️ Backend

- Node.js
- Express.js
- Socket.IO
- Mongoose
- bcrypt
- dotenv
- CORS

## 🎥 Real-Time Communication

- WebRTC
- RTCPeerConnection
- Socket.IO
- Google STUN Server

## 🗄️ Database

- MongoDB Atlas
- Mongoose ODM

---

# 📁 Project Structure

```text
connekt/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js
│   │   │   └── user.controller.js
│   │   │
│   │   ├── models/
│   │   │   ├── meeting.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── routes/
│   │   │   └── users.routes.js
│   │   │
│   │   └── app.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── background.png
│   │   ├── logo.png
│   │   └── mobile.png
│   │
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── authentication.jsx
│   │   │   ├── history.jsx
│   │   │   ├── home.jsx
│   │   │   ├── landing.jsx
│   │   │   └── videoMeet.jsx
│   │   │
│   │   ├── styles/
│   │   │   └── videoComponent.module.css
│   │   │
│   │   ├── utils/
│   │   │   └── withAuth.jsx
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── environment.js
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md
└── ...
```

---

# 🔌 API Endpoints

## Authentication

### Signup

```http
POST /api/v1/users/register
```

### Login

```http
POST /api/v1/users/login
```

## Meeting History

### Add Meeting to History

```http
POST /api/v1/users/add_to_activity
```

### Get User Meeting History

```http
GET /api/v1/users/get_all_activity?token=<token>
```

The backend defines these routes under `/api/v1/users`.

---

# 🔑 Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8080
```

---

# 🚀 Installation & Local Development

## 1. Clone the Repository

```bash
git clone https://github.com/AvishekAmin/connekt.git
cd connekt
```

## 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:8080
```

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs on:

```text
http://localhost:5173
```

---

# 🔄 Real-Time Communication Flow

A typical Connekt meeting follows this flow:

```text
1. User opens a meeting URL
          ↓
2. Browser requests camera / microphone access
          ↓
3. Client connects to Socket.IO backend
          ↓
4. Client joins the meeting room
          ↓
5. Socket.IO exchanges signaling information
          ↓
6. RTCPeerConnection objects are created
          ↓
7. WebRTC establishes peer-to-peer media connections
          ↓
8. Video / audio streams are exchanged
          ↓
9. Socket.IO handles real-time chat and signaling
```

---

# 🧩 Project Highlights

✅ Full-Stack Real-Time Communication Platform

✅ React + Vite Frontend

✅ Node.js + Express Backend

✅ MongoDB Atlas Database

✅ WebRTC-Based Video Communication

✅ Socket.IO Signaling

✅ Real-Time Chat

✅ Screen Sharing

✅ Audio / Video Controls

✅ Authentication & Protected Routes

✅ Meeting History

✅ RESTful API Architecture

✅ TailwindCSS, Shadcn/ui Interface

✅ Production Deployment

✅ Separate Frontend and Backend Services

✅ Responsive Meeting Experience

---

# 👨‍💻 Author

## Avishek Amin

🔗 **LinkedIn:** https://www.linkedin.com/in/avishekamin

🔗 **Email:** avishekamin207@gmail.com

🔗 **GitHub:** https://github.com/AvishekAmin

---

### ⭐ **If you like this project, consider giving it a star!**

---