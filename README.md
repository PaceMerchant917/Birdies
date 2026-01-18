# McGill Dating App

A McGill-exclusive dating app built for students, by students.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Running Locally

```bash
# Start frontend (http://localhost:3000)
cd frontend
npm run dev

# In a separate terminal, start backend (http://localhost:3001)
cd backend
npm run dev
```

Or use the convenience scripts from the root:

```bash
# Start frontend
npm run dev:frontend

# Start backend
npm run dev:backend
```

### Database Setup (Supabase)

The app uses a centralized Supabase Postgres database shared by all developers.

**For detailed setup instructions, see `SETUP_INSTRUCTIONS.md`**

Quick setup:

```bash
# 1. Copy environment template
cd backend
cp .env.example .env

# 2. Edit .env and add your Supabase DATABASE_URL
# Get from: Supabase Project Settings > Database > Connection string (URI)

# 3. Run migrations (ONLY ONCE per database, coordinate with team)
npm run migrate

# 4. Optional: Seed sample profiles for testing
npm run seed-profiles
```

### Environment Setup

Backend environment (`backend/.env`):

```bash
# Supabase Database Connection (Primary)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# API Configuration
API_PORT=3001

# Auth
JWT_SECRET=your-secret-key-here

# Optional: Force SSL (auto-detected for Supabase)
DB_SSL=true
```

Frontend environment (`frontend/.env.local`):

```bash
# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📁 Project Structure

```
├── frontend/         # Next.js web app (mobile-first)
│   ├── src/
│   │   ├── app/     # Next.js app router pages
│   │   └── types/   # Shared TypeScript types
│   └── package.json
├── backend/          # Express API server
│   ├── src/
│   │   ├── index.ts # Main server file
│   │   └── types/   # Shared TypeScript types
│   └── package.json
├── docs/
│   └── CONTRACTS.md  # 📋 SINGLE SOURCE OF TRUTH - READ THIS FIRST
└── README.md         # You are here
```

## 📖 Documentation

**👉 Read `/docs/CONTRACTS.md` first** - it contains:
- Complete API endpoint documentation
- Data models and types
- UI screen map
- Team ownership boundaries
- Parallel work guidelines

**👉 Read `/DISCOVER_SETUP.md`** for details on:
- How the discover page connects to the database
- Profile browsing implementation
- Testing with sample data
- Next steps for like/match functionality

## 🏗️ Current Status

✅ **What's Working:**
- ✅ User authentication (signup, login)
- ✅ Centralized Supabase Postgres database (users, profiles, likes, matches, blocks)
- ✅ JWT-based authentication middleware
- ✅ Discover page with profile browsing
- ✅ Profile cards with Like/Pass actions
- ✅ Protected routes requiring authentication
- ✅ Complete technical contracts document

🚧 **In Progress:**
- Like/Match functionality (UI ready, backend pending)
- Profile photo uploads
- Preference-based filtering
- Real-time messaging
- Match notifications

❌ **Not Yet Implemented:**
- File uploads for profile photos
- Advanced matching algorithm
- Real-time chat
- Admin panel
- Email sending (currently logs to console)

## 👥 Team Workflow

### Branch Naming
- `auth/*` - Authentication features
- `profile/*` - Profile management
- `match/*` - Discovery & matching
- `chat/*` - Messaging features

### Before Starting Work
1. Read `/docs/CONTRACTS.md`
2. Create a feature branch
3. Keep PRs small and focused
4. Keep `main` green

### Making Changes
- **API changes?** Update `CONTRACTS.md` first
- **Shared types?** Update in both `frontend/src/types` and `backend/src/types`
- **Database?** Coordinate migrations

## 🧪 Testing

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:frontend
npm run build:backend
```

## 🔒 Security Notes

- Never commit `.env` files
- McGill email verification is required (not implemented yet)
- All user data must stay within McGill community
- Report/block features are critical for safety

## 📱 Mobile-First Design

The web app is built mobile-first and can later be wrapped with:
- Capacitor (iOS/Android)
- Expo WebView
- React Native Web migration

## 🤝 Contributing

1. Pull latest `main`
2. Create feature branch following naming convention
3. Implement your feature
4. Update docs if needed
5. Create PR with clear description
6. Get review from relevant team members

## 📞 Support

- Technical questions: Check `/docs/CONTRACTS.md`
- Team coordination: Use team channels
- Issues: Create GitHub issue

---

Built with ❤️ for the McGill community
