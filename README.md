# Blog Management + Real-Time Tracking

A full-stack demo with role-based admin/customer panels, blog CRUD, and real-time presence and blog updates using Socket.IO.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO
- Frontend: React (Vite), Axios, TailwindCSS, socket.io-client

## Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB URI

## Project Structure
- `backend/`: Express API, MongoDB models, Socket.IO server
- `frontend/`: React app (Vite) consuming the API and sockets

## Setup
1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

2) Configure environment
Create `backend/.env` with at least:
```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/blog_realtime
JWT_SECRET=supersecret
```

3) Run the apps (in separate terminals)
```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

- Backend runs on `http://localhost:4000`
- Frontend runs on `http://localhost:5173` by default

## Authentication
- JWT-based. The frontend stores the token in `localStorage` and attaches it to API requests and the socket handshake.

## Real-Time (Socket.IO) Overview
- Server initialization: `backend/src/server.js` creates HTTP server, initializes Socket.IO, and sets up presence middleware.
- Auth for sockets: `backend/src/realtime/presence.js` verifies JWT on connection using `socket.handshake.auth.token` or `Authorization` header.
- Presence updates: on connect/disconnect (and on API activity) server updates `User.status`/`lastActive` and emits `presence:update`.
- Blog events emitted from controllers:
  - `blog:created`, `blog:updated`, `blog:deleted`, `blog:status`
- Profile updates: `profile:update`
- Frontend listens in pages like `AdminCustomers.jsx`, `AdminBlogs.jsx`, `Blogs.jsx` using a singleton from `frontend/src/lib/socket.js`.

## Useful Scripts
Backend (`backend/package.json`): `npm start`
Frontend (`frontend/package.json`): `npm run dev`
