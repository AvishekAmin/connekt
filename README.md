# 🎥 Connekt: Real-Time Video Conferencing Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey?style=flat-square&logo=express)](https://expressjs.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-333333?style=flat-square&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Mongoose%209.9-forestgreen?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-purple?style=flat-square)](LICENSE)

**Connekt** is an enterprise-grade, full-stack real-time video conferencing platform built with modern WebRTC, Socket.IO, React 19, Express 5, and MongoDB Atlas. Engineered for ultra-low latency peer-to-peer media communication, robust session security, and a sleek, futuristic dark cyberpunk aesthetic with neon accents.

Connekt delivers seamless multi-peer video meetings, crystal-clear audio with real-time level metering, zero-renegotiation screen sharing, synchronized in-meeting chat, meeting history persistence, and comprehensive authentication with refresh token reuse detection.

---

## 🌐 Live Deployment

- 🔗 **Production Web App:** [https://connekt-avishek.onrender.com](https://connekt-avishek.onrender.com)
- 🔗 **Production Backend API:** [https://connekt-avishek-backend.onrender.com](https://connekt-avishek-backend.onrender.com)

> ⚠️ **Note on Render Free Tier:** The backend is hosted on Render's free compute tier, which automatically spins down when idle. The initial request or login after inactivity may take 20–30 seconds while the container spins up. Subsequent requests run at full speed.

---

## 🎯 Architectural Pillars

1. **Modern Unified-Plan WebRTC**: Multi-peer mesh using standard transceivers (`addTrack`/`ontrack`), smooth track replacement for instant screen sharing (`sender.replaceTrack()`), and real-time audio energy level metering via the Web Audio API.
2. **Hardened Dual-Token Security**: Short-lived (15m) JWT access tokens combined with secure, `httpOnly`, `sameSite: strict` refresh tokens featuring session family rotation and automatic replay attack revocation.
3. **Isolated Real-Time Signaling**: Socket.IO handshake authenticated via JWT, strict single-room enforcement per socket, cross-room signal injection prevention, and sliding-window chat rate limiting.
4. **Resilient Layered API**: Express 5.x layered architecture (Routes → Middleware → Controllers → Services → Models) with Zod schema validation, Helmet security headers, and automated rate limiting.

---

## 🏗️ System Architecture

Connekt separates RESTful state management and identity verification from real-time WebRTC signaling and peer-to-peer media streaming.

### High-Level Topology

```text
                                  ┌─────────────────────────────────────────┐
                                  │            Client (Browser)             │
                                  │                                         │
                                  │  React 19 + Vite + TailwindCSS v4       │
                                  │  - AuthContext (Bootstrap & Tokens)     │
                                  │  - Axios Interceptors (Silent Refresh)  │
                                  │  - WebRTC Peer Connection Manager       │
                                  │  - Web Audio API (AnalyserNode)         │
                                  └─────────────┬───────────────────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       │ REST APIs (HTTPS)                               │ Socket.IO Signaling (WSS)
                       ▼                                                 ▼
        ┌─────────────────────────────┐                   ┌───────────────────────────────┐
        │     Express 5.x Backend     │                   │       Socket.IO Gateway       │
        │                             │                   │                               │
        │  - Helmet Security Headers  │                   │  - Handshake JWT Verification │
        │  - Global / Auth Rate Limit │                   │  - Single-Room Enforcement    │
        │  - Zod Request Validation   │                   │  - Cross-Room Signal Firewall │
        │  - Cookie Parser (HttpOnly) │                   │  - Sliding Window Chat Limit  │
        └──────────────┬──────────────┘                   └───────────────┬───────────────┘
                       │                                                  │
                       ▼                                                  ▼
        ┌─────────────────────────────┐                   ┌────────────────────────────────────┐
        │        Service Layer        │                   │     WebRTC Mesh Topology           │
        │                             │                   │                                    │
        │  - authService (JWT/Family) │                   │  Peer A ◄─── P2P Media ───► Peer B │
        │  - historyService (MongoDB) │                   │    ▲                         ▲     │
        └──────────────┬──────────────┘                   │    └──────── Peer C ─────────┘     │
                       │                                  │   (Google STUN: stun.l.google.com) │
                       ▼                                  └────────────────────────────────────┘
        ┌─────────────────────────────┐
        │        MongoDB Atlas        │
        │                             │
        │  - Users & Refresh Sessions │
        │  - User Meeting Activities  │
        └─────────────────────────────┘
```

### Detailed Component Interaction

```text
+---------------------------------------------------------------------------------------------------+
| FRONTEND CLIENT (React 19 / Vite)                                                                 |
|                                                                                                   |
|  +--------------------+   +-----------------------+   +-------------------+   +----------------+  |
|  | AuthContext        |   | Axios API Client      |   | Socket Client     |   | WebRTC Manager |  |
|  | State & User Auth  |-->| Bearer Auth Header    |-->| Handshake with    |-->| RTCPeerConnect |  |
|  | Session Lifecycle  |   | 401 Silent Token Rot. |   | Active JWT Token  |   | Unified Plan   |  |
|  +--------------------+   +-----------------------+   +-------------------+   +----------------+  |
+---------------------------------------|-------------------------|-----------------------|---------+
                                        |                         |                       |
                             HTTPS REST |              WSS Events |                       |
                                        v                         v                       |
+-----------------------------------------------------------------+                       |
| BACKEND SERVER (Node.js / Express 5 / Socket.IO)                |                       |
|                                                                 |                       |
|  [Middleware Pipeline]                                          |                       |
|  Helmet -> CORS -> RateLimiter -> CookieParser -> JsonParser    |                       |
|                                                                 |                       |
|  [REST Routes & Controllers]       [Socket.IO Manager]          |                       |
|  - /api/v1/auth/*                  - Connection Auth Gate       |                       |
|  - /api/v1/meetings/*              - room:join / peer:joined    |                       |
|  - /health                         - signal:offer/answer/ice    |                       |
|                                    - chat:message Rate Limiter  |                       |
|  [Services & Data Layer]                                        |                       |
|  - authService.js (Bcrypt + JWT + Session Family Tree)          |                       |
|  - historyService.js (Atomic Mongoose Queries)                  |                       |
+---------------------------------------|-------------------------+                       |
                                        |                                                 |
                       Database Queries |                                     STUN / ICE  |
                                        v                                                 v
+-----------------------------------------------+             +-------------------------------------+
| MONGODB ATLAS CLUSTER                         |             | GOOGLE STUN INFRASTRUCTURE          |
| - Users Collection (Bcrypt Passwords, Tokens) |             | stun:stun.l.google.com:19302        |
| - Meetings Collection (User History Activity) |             | NAT Traversal & Candidate Discovery |
+-----------------------------------------------+             +-------------------------------------+
```

---

## ✨ Feature Deep-Dive

### 🔐 1. Authentication & Session Security
- **Dual-Token System**:
  - **Access Token**: Stateless JWT (15-minute expiration) sent in `Authorization: Bearer <token>` header.
  - **Refresh Token**: Cryptographically secure UUID token (7-day expiration) stored exclusively in an `httpOnly`, `sameSite: strict`, `secure` cookie to prevent XSS exfiltration.
- **Refresh Token Rotation & Reuse Detection**:
  - Every refresh token exchange generates a new token while preserving the lineage (`sessionId`, `revokedAt`, `replacedBySessionId`).
  - If a revoked token is replayed (indicating a compromised token), the backend immediately revokes the **entire session family**, protecting the account against hijack attempts.
- **Brute Force Protection**: Dedicated rate limiter restricts authentication attempts to 20 requests per 15 minutes per IP.
- **Input Validation**: All payloads validated using strict Zod schemas before reaching the service layer.

### 🎥 2. Modern WebRTC Real-Time Audio & Video
- **Unified-Plan RTCPeerConnection**: Audio and video tracks are managed via standard transceivers (`sendrecv`), fully compliant with modern browser standards.
- **Zero-Renegotiation Screen Sharing**: When a user initiates or terminates screen sharing, `sender.replaceTrack()` swaps the video track directly on existing peer connections. This eliminates screen flickering and connection drops.
- **Active Audio Level Metering**: Integrated `AudioContext` and `AnalyserNode` measure microphone RMS energy, providing real-time visual indicators when a participant speaks.
- **Track Lifecycle Management**: All microphone and webcam tracks are explicitly stopped upon leaving a call, preventing lingering device activity indicators in the browser.

### ⚡ 3. Hardened Socket.IO Signaling
- **Handshake Authentication**: Socket.IO connections require a valid JWT passed in `auth.token`. Unauthenticated or expired socket connections are rejected at handshake.
- **Single-Room Enforcement**: A client socket can only belong to one room at any time. Joining a new room automatically detaches and notifies peers in the previous room.
- **Cross-Room Signal Firewall**: The server verifies that both the sender and the recipient socket are in the exact same room before routing `signal:offer`, `signal:answer`, or `signal:ice-candidate`.
- **Chat Validation & Rate Limiting**: Chat messages are restricted to 1,000 characters and rate-limited via a sliding window (maximum 5 messages every 5 seconds) to prevent spam. Sender identity is stamped directly from the authenticated session.

### 🎨 4. Futuristic Cyberpunk UI & Responsiveness
- **Aesthetic**: Deep space-grade dark theme (`#050814`) with cyan (`#00d8f6`) and violet (`#7b61ff`) glow accents.
- **Responsive Layouts**: Dynamic CSS Grid meeting video layout that automatically shifts between 1-to-1 spotlight views and multi-peer gallery tiles.
- **Dedicated Chat Drawer**: In-meeting real-time chat with unread message badges and sender attribution.
- **Meeting Lobby & Controls**: Pre-join device previews, one-click camera/microphone toggling, screen sharing controls, and end-meeting redirection to Dashboard.
- **Informational Pages**: Dedicated Privacy & Terms, About Us, and Contact Us pages styled uniformly.

---

## 📷 Screenshots

### 1. Landing Page
![Landing Page](./screenshots/landing.png)

### 2. User Authentication (Login)
![Login Page](./screenshots/login.png)

### 3. New Account Registration (Signup)
![Signup Page](./screenshots/signup.png)

### 4. User Dashboard & Meeting Launchpad
![Dashboard](./screenshots/dashboard.png)

### 5. Pre-Meeting Lobby & Device Preview
![Meeting Lobby](./screenshots/meeting_lobby.png)

### 6. Real-Time Multi-Peer Video Conference
![Video Conference](./screenshots/video_conference.png)

### 7. Instant Screen Sharing
![Screen Sharing](./screenshots/screen_sharing.png)

### 8. In-Meeting Real-Time Chat
![Real-Time Chat](./screenshots/chat.png)

### 9. Meeting History & Activity Logs
![Meeting History](./screenshots/history.png)

---

## 🚀 Tech Stack

### Frontend Architecture
- **Framework:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (Client Environment)
- **Routing:** [React Router 7](https://reactrouter.com/) (Protected Routes & Auth-aware redirects)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Component Primitives:** [Radix UI](https://www.radix-ui.com/) (`@radix-ui/react-slot`)
- **Iconography:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/) (With request interceptor for Bearer JWT & response interceptor for silent token refresh queue)
- **Real-Time Client:** [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **Audio Processing:** Web Audio API (`AudioContext` + `AnalyserNode` for microphone volume level metering)
- **Utilities:** `clsx`, `tailwind-merge`, `class-variance-authority`, `cn`

### Backend Architecture
- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js 5](https://expressjs.com/)
- **Real-Time Engine:** [Socket.IO 4.8](https://socket.io/) (Scoped room signaling & real-time messaging)
- **Database ODM:** [Mongoose 9.9](https://mongoosejs.com/) (MongoDB connection pooling & schema models)
- **Authentication:** [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (Stateless access tokens) + [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (Salted password hashing)
- **Validation:** [Zod 4](https://zod.dev/) (Runtime schema enforcement)
- **Security Middleware:** [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [cookie-parser](https://github.com/expressjs/cookie-parser), [cors](https://github.com/expressjs/cors)
- **Automated Testing:** Node Native Test Runner (`node --test`), [Supertest](https://github.com/ladjs/supertest)

### Real-Time & Cloud Infrastructure
- **Media Protocol:** Modern WebRTC Unified Plan (`RTCPeerConnection`, `addTrack`, `ontrack`, `replaceTrack`)
- **NAT Traversal:** Google Public STUN (`stun:stun.l.google.com:19302`)
- **Database Cluster:** [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Deployment Platform:** [Render](https://render.com/)

---

# 📁 Project Structure

```text
connekt/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js             # MongoDB connection setup
│   │   │   └── env.js                  # Environment configuration & validation
│   │   ├── controllers/
│   │   │   ├── auth.controller.js      # Auth request handlers (login, signup, refresh, logout)
│   │   │   └── user.controller.js      # Meeting history & user activity handlers
│   │   ├── middleware/
│   │   │   ├── asyncHandler.js         # Async error wrapper
│   │   │   ├── auth.js                 # JWT Bearer authentication guard
│   │   │   ├── errorHandler.js         # Centralized error handler
│   │   │   ├── rateLimiter.js          # Auth and global rate limiters
│   │   │   └── validate.js             # Zod schema validation middleware
│   │   ├── models/
│   │   │   ├── meeting.model.js        # Meeting activity schema
│   │   │   ├── session.model.js        # Refresh token session family schema
│   │   │   └── user.model.js           # User credentials schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js          # Authentication endpoints (/api/v1/auth)
│   │   │   ├── health.routes.js        # Health check endpoint (/health)
│   │   │   └── users.routes.js         # Meeting history & backward compat routes
│   │   ├── services/
│   │   │   ├── authService.js          # Auth business logic, token rotation & reuse detection
│   │   │   └── historyService.js       # Meeting history business logic
│   │   ├── sockets/
│   │   │   ├── chatHandler.js          # Real-time chat & rate-limited message handling
│   │   │   ├── roomManager.js          # Scoped room membership & presence tracking
│   │   │   ├── signalingHandler.js     # WebRTC SDP offer, answer & ICE candidate relay
│   │   │   ├── socketAuth.js           # Socket handshake JWT verification
│   │   │   └── socketManager.js        # Main Socket.IO connection dispatcher
│   │   ├── utils/
│   │   │   └── AppError.js             # Custom operational error class
│   │   ├── validators/
│   │   │   └── auth.validator.js       # Zod schemas for credentials & registration
│   │   └── app.js                      # Express application & HTTP server bootstrap
│   ├── test/
│   │   ├── auth.test.js                # Auth, token rotation & reuse detection tests
│   │   └── socket.test.js              # Socket handshake, room isolation & chat tests
│   ├── .env.example                    # Backend environment template
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg                 # Application favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx          # Header navigation bar with user profile
│   │   │   ├── meeting/
│   │   │   │   ├── ChatPanel.jsx       # In-meeting real-time chat drawer
│   │   │   │   ├── MeetingControls.jsx # Audio, video, screen share & end-call buttons
│   │   │   │   ├── MeetingHeader.jsx   # Meeting code display & meeting timer
│   │   │   │   ├── MeetingLobby.jsx    # Pre-meeting device check & preview lobby
│   │   │   │   ├── VideoGrid.jsx       # Adaptive multi-peer video grid layout
│   │   │   │   └── VideoTile.jsx       # Individual participant video & status tile
│   │   │   └── ui/
│   │   │       ├── badge.jsx           # Shadcn badge primitive
│   │   │       ├── button.jsx          # Shadcn button primitive
│   │   │       ├── input.jsx           # Shadcn input primitive
│   │   │       └── skeleton.jsx        # Loading skeleton primitive
│   │   ├── config/
│   │   │   └── environment.js          # Dynamic environment & backend URL selector
│   │   ├── constants/
│   │   │   └── routes.js               # Application route path constants
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx         # Global authentication state provider
│   │   ├── hooks/
│   │   │   ├── useAuth.js              # Hook for authentication operations
│   │   │   ├── useMediaStream.js       # Hook for camera & microphone stream management
│   │   │   ├── useMeetingHistory.js    # Hook for fetching meeting activity history
│   │   │   ├── useMeetingSocket.js     # Hook for Socket.IO signaling lifecycle
│   │   │   └── useWebRTC.js            # Hook for peer connections & screen sharing
│   │   ├── pages/
│   │   │   ├── about.jsx               # About Us information page
│   │   │   ├── authentication.jsx      # Login and registration page
│   │   │   ├── contact.jsx             # Contact Us page
│   │   │   ├── dashboard.jsx           # User dashboard for starting/joining calls
│   │   │   ├── history.jsx             # Past meeting history page
│   │   │   ├── landing.jsx             # Landing page with hero & footer
│   │   │   ├── privacy.jsx             # Terms & Privacy policy page
│   │   │   └── videoMeet.jsx           # Real-time WebRTC conferencing page
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client with silent token refresh interceptor
│   │   │   ├── authService.js          # Auth API request methods
│   │   │   └── historyService.js       # Meeting history API request methods
│   │   ├── utils/
│   │   │   ├── formatters.js           # Date and text formatting utilities
│   │   │   └── withAuth.jsx            # Protected route Higher-Order Component
│   │   ├── App.jsx                     # Application routing & route tree
│   │   ├── index.css                   # Global styles & theme custom properties
│   │   └── main.jsx                    # React application entry point
│   ├── components.json                 # Shadcn UI configuration
│   ├── eslint.config.js                # ESLint configuration
│   ├── index.html                      # HTML entry template
│   ├── jsconfig.json                   # Path alias mappings (@/*)
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js                  # Vite bundler configuration
│
├── screenshots/                        # Production UI screenshot assets
│   ├── chat.png
│   ├── dashboard.png
│   ├── history.png
│   ├── landing.png
│   ├── login.png
│   ├── meeting_lobby.png
│   ├── screen_sharing.png
│   ├── signup.png
│   └── video_conference.png
│
├── .gitignore
└── README.md
```

---

## 🔄 Real-Time Signaling & WebRTC Lifecycle

```text
Peer A (Host)                      Socket.IO Server                      Peer B (Joiner)
      │                                   │                                      │
      │── 1. room:join { roomId } ───────>│                                      │
      │<─ 2. room:joined { roomId } ──────│                                      │
      │                                   │                                      │
      │                                   │<── 3. room:join { roomId } ──────────│
      │                                   │─── 4. room:joined { roomId, peers }─>│
      │<─ 5. peer:joined { peerId: B } ───│                                      │
      │                                   │                                      │
      │── 6. signal:offer ───────────────>│ (Verify same-room co-location)       │
      │                                   │─── 7. signal:offer ─────────────────>│
      │                                   │                                      │
      │                                   │<── 8. signal:answer ─────────────────│
      │<─ 9. signal:answer ───────────────│                                      │
      │                                   │                                      │
      │── 10. signal:ice-candidate ──────>│─── 11. signal:ice-candidate ────────>│
      │<─ 13. signal:ice-candidate ───────│<── 12. signal:ice-candidate ─────────│
      │                                   │                                      │
      │================== 14. Direct P2P Media Stream Established ===============│
      │                                   │                                      │
      │── 15. media:state-change ────────>│─── 16. media:state-change ──────────>│
      │── 17. chat:message ──────────────>│─── 18. chat:message ────────────────>│
      │                                   │                                      │
      │                                   │<── 19. disconnect ───────────────────│
      │<─ 20. peer:left { peerId: B } ────│                                      │
```

---

## 🔌 REST API Specification

### Health Check

```http
GET /health
```
- **Response `200 OK`:**
  ```json
  { "status": "ok", "db": "connected" }
  ```

---

### Authentication (`/api/v1/auth`)

#### 1. Register User
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "Alex Mercer",
  "username": "alexmercer",
  "password": "Password123"
}
```
- **Response `201 Created`:**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "670...",
      "name": "Alex Mercer",
      "username": "alexmercer"
    }
  }
  ```

#### 2. User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "alexmercer",
  "password": "Password123"
}
```
- **Response `200 OK`:**
  - Sets HTTP-Only cookie: `refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`
  ```json
  {
    "accessToken": "eyJhbG...",
    "user": {
      "id": "670...",
      "name": "Alex Mercer",
      "username": "alexmercer"
    }
  }
  ```

#### 3. Refresh Access Token
```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<token>
```
- **Response `200 OK`:**
  - Rotates refresh cookie with a newly minted token.
  ```json
  { "accessToken": "eyJhbG..." }
  ```
- **Response `401 Unauthorized` (Token Reuse Detected):**
  - Triggers immediate session family revocation.
  ```json
  { "error": "Invalid refresh token", "code": "REFRESH_TOKEN_REUSE" }
  ```

#### 4. Current User Profile
```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```
- **Response `200 OK`:**
  ```json
  {
    "user": {
      "id": "670...",
      "name": "Alex Mercer",
      "username": "alexmercer"
    }
  }
  ```

#### 5. User Logout
```http
POST /api/v1/auth/logout
Cookie: refreshToken=<token>
```
- **Response `200 OK`:**
  - Clears `refreshToken` cookie and marks session as revoked in the database.
  ```json
  { "message": "Logged out successfully" }
  ```

---

### Meeting Management (`/api/v1/meetings`)

#### 1. Record Meeting to History
```http
POST /api/v1/meetings/activity
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "meetingCode": "alpha-room-123"
}
```
- **Response `201 Created`:**
  ```json
  { "message": "Meeting added to history" }
  ```

#### 2. Retrieve User Meeting History
```http
GET /api/v1/meetings/activity
Authorization: Bearer <accessToken>
```
- **Response `200 OK`:**
  ```json
  [
    {
      "_id": "670...",
      "meetingCode": "alpha-room-123",
      "date": "2026-09-13T11:00:00.000Z"
    }
  ]
  ```

*(Note: Legacy endpoints `/api/v1/users/login`, `/api/v1/users/signup`, `/api/v1/users/add_to_activity`, and `/api/v1/users/get_all_activity` remain fully functional as compatibility aliases).*

---

## ⚡ Socket.IO Event Specification

All socket connections require an authenticated JWT token during handshake:
```javascript
const socket = io(SERVER_URL, {
  auth: { token: accessToken }
});
```

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `room:join` | Client → Server | `{ roomId: string }` | Join a meeting room. Enforces single-room per socket. |
| `room:joined` | Server → Client | `{ roomId: string, peers: Array }` | Confirms room entry and provides active peer list. |
| `peer:joined` | Server → Client | `{ peerId: string, name: string }` | Broadcast to peers when a new user enters the room. |
| `peer:left` | Server → Client | `{ peerId: string }` | Broadcast to peers when a user exits or disconnects. |
| `signal:offer` | Client ⇄ Server | `{ to: string, offer: RTCSessionDescription }` | Relays WebRTC SDP offer (cross-room isolated). |
| `signal:answer` | Client ⇄ Server | `{ to: string, answer: RTCSessionDescription }` | Relays WebRTC SDP answer (cross-room isolated). |
| `signal:ice-candidate` | Client ⇄ Server | `{ to: string, candidate: RTCIceCandidate }` | Relays ICE candidate for NAT traversal. |
| `media:state-change` | Client ⇄ Server | `{ isAudioMuted: boolean, isVideoOff: boolean }` | Broadcasts microphone/camera status to peers. |
| `chat:message` | Client ⇄ Server | `{ message: string }` | Sends a chat message (rate-limited, server-verified sender). |
| `chat:error` | Server → Client | `{ error: string }` | Emitted when message exceeds length or rate limit. |

---

## 🔑 Environment Configuration

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/connekt?retryWrites=true&w=majority

# JWT Secrets (Minimum 32 characters)
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars_long
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_long

# Token Expiry Durations
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS Allowed Origin
FRONTEND_URL=http://localhost:5173

# WebRTC ICE Configuration (Optional - Defaults to Google Public STUN)
WEBRTC_STUN_URL=stun:stun.l.google.com:19302
WEBRTC_TURN_URL=
WEBRTC_TURN_USERNAME=
WEBRTC_TURN_CREDENTIAL=
```

### Frontend (`frontend/.env`)

```env
# Optional override (defaults automatically based on import.meta.env.PROD)
VITE_BACKEND_URL=http://localhost:8080
```

---

## 🛠️ Local Development Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

---

### Step 1: Clone Repository
```bash
git clone https://github.com/AvishekAmin/connekt.git
cd connekt
```

---

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secrets

# Start development server
npm run dev
```
The backend will launch at `http://localhost:8080`.

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 🧪 Testing & Verification

Connekt includes comprehensive automated test suites for security and real-time operations:

### Run Backend Tests
```bash
cd backend
npm test
```
**Test Coverage Includes (40 tests across 16 suites):**
- ✅ User registration validation and duplicate detection
- ✅ Login authentication, password verification, and credential security
- ✅ Bearer token validation and protected route authorization
- ✅ Refresh token rotation, cookie attributes, and session revocation
- ✅ Replay attack and token reuse detection (family invalidation)
- ✅ Cross-user meeting isolation (User A cannot access User B's history)
- ✅ Socket.IO handshake JWT authentication and rejection of invalid/expired tokens
- ✅ Single-room-per-socket enforcement and auto-leave mechanics
- ✅ Scoped signaling isolation (prevention of cross-room signal injection)
- ✅ Chat sliding-window rate limiting and server-side sender stamping
- ✅ Health endpoint verification

### Run Frontend Verification
```bash
cd frontend

# Run ESLint check
npm run lint

# Run production build
npm run build
```

---

## 👨‍💻 Author

**Avishek Amin**  
Full-Stack Developer & Software Engineer

- 🔗 **LinkedIn:** [linkedin.com/in/avishekamin](https://www.linkedin.com/in/avishekamin)
- 🔗 **GitHub:** [github.com/AvishekAmin](https://github.com/AvishekAmin)
- 📧 **Email:** [avishekamin207@gmail.com](mailto:avishekamin207@gmail.com)

---

### ⭐ If you find this project valuable or interesting, consider giving it a star!

---