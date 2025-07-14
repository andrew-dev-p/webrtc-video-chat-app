# Group Video Chat App 🎥

A **full-stack group video chat** application built with **React**, **WebRTC Mesh architecture**, and **Socket.IO**, inspired by platforms like Google Meet and Zoom.

## 🔍 Description

This project is a group video chat application using **WebRTC Mesh architecture** for peer-to-peer connections, with **Socket.IO** as the signaling server. It supports connecting multiple users in a room, exchanging media streams, and real-time chat using WebRTC data channels. The app features a modern UI and supports both video and audio-only calls.

## 📁 Project Structure

```
.
├── client/   # React frontend (WebRTC, UI, logic)
└── server/   # Express.js + Socket.IO backend (signaling)
```

## 🚀 Features

- **Group video calls** with WebRTC Mesh
- **Real-time chat** via WebRTC data channels
- **Audio-only mode** option
- **Room-based connections**
- **TURN server support** for NAT traversal
- **Responsive UI** built with React
- **Socket.IO signaling server**
- **Simple-peer** for easier WebRTC integration

## 🛠️ Tech Stack

### Frontend

- **React**
- **JavaScript**
- **Simple-peer** (WebRTC abstraction)
- **Socket.IO-client**
- **Vite** (bundler)

### Backend

- **Node.js**
- **Express.js**
- **Socket.IO**

## ⚙️ Installation

### 1. Clone the Repo

```bash
git clone https://github.com/andrew-dev-p/webrtc-video-chat-app
cd webrtc-video-chat-app
```

### 2. Setup Client

```bash
cd client
npm install
```

### 3. Setup Server

```bash
cd ../server
npm install
```

## 🧪 Running Locally

### Client

```bash
cd client
npm run dev
```

### Server

```bash
cd server
npm start
```

## 🔐 Environment Variables

### 📦 Client (`client/.env`)

```env
VITE_TURN_SERVER_URL=your_turn_server_url
VITE_TURN_SERVER_USERNAME=your_turn_username
VITE_TURN_SERVER_CREDENTIAL=your_turn_credential
```

### 🔧 Server (`server/.env`)

```env
PORT=5000
```