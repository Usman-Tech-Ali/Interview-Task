Backend (Node.js + Express + MongoDB)

Setup
- Copy `.env.example` to `.env` and fill values
- Install: `npm install`
- Dev server: `npm run dev`
- Prod start: `npm start`

Env Variables
- `PORT` (default 4000)
- `MONGO_URI` (e.g., mongodb://127.0.0.1:27017/blog_management)
- `JWT_SECRET` (any random string)

Auth Endpoints
- POST `/auth/signup` { name, email, password, role?, subscriptionPlan? }
- POST `/auth/login` { email, password }

Notes
- Passwords hashed with bcrypt
- JWT returned on signup/login
