# Implementation Summary: Messaging, Matching & Dev Seeding

## ✅ Completed Features

### 1. Backend: Messages Table & Endpoints

#### Database Schema (`backend/src/db/schema.sql`)
- ✅ Added `messages` table with:
  - `id` (UUID, primary key)
  - `match_id` (UUID, FK to matches)
  - `sender_id` (UUID, FK to users)
  - `body` (TEXT, required)
  - `created_at` (TIMESTAMP)
  - `read_at` (TIMESTAMP, nullable)
  - Indexes on `match_id` and `created_at`

#### API Endpoints (`backend/src/index.ts`)
- ✅ **GET /api/matches/:matchId/messages**
  - Requires authentication
  - Verifies user is part of the match (403 if not)
  - Returns messages ordered by `created_at` ASC
  - Returns 404 if match not found

- ✅ **POST /api/matches/:matchId/messages**
  - Requires authentication
  - Validates message body (non-empty, max 2000 chars)
  - Verifies user is part of the match
  - Updates `matches.last_message_at` on send
  - Returns created message

### 2. Backend: Dev Data Seeding System

#### Helper Scripts
- ✅ **`seed-likes.ts`**
  - `createLike()` - Create single like (idempotent)
  - `createMatch()` - Create match with proper user ordering
  - `createMutualLikes()` - Create bidirectional likes + match
  - `getRandomUsers()` - Get random user IDs

- ✅ **`seed-messages.ts`**
  - `seedMessagesForMatch()` - Create 1-5 random messages in a match
  - Only seeds if match has 0 messages (prevents duplicates)
  - Uses realistic message templates
  - Updates match's `last_message_at`

- ✅ **`seed-dev.ts`** (Main Orchestrator)
  - Creates 80 sample profiles with:
    - Unique emails: `seed+001@mail.mcgill.ca` to `seed+080@mail.mcgill.ca`
    - Random display names, bios, faculties, years, pronouns, genders, intents
    - Placeholder photos from `https://picsum.photos/seed/*/800/900`
  - Accepts `TARGET_EMAIL` from env var or command line arg
  - Creates 20 likes from random users to target
  - Creates 10 mutual matches with target
  - Seeds 1-5 messages in each match
  - Fully idempotent (safe to re-run)

#### NPM Script (`backend/package.json`)
- ✅ Added `"seed-dev": "tsx src/db/seed-dev.ts"`

**Usage:**
```bash
cd backend
TARGET_EMAIL=your.email@mail.mcgill.ca npm run seed-dev
```

### 3. Frontend: API Client (`frontend/src/lib/api.ts`)

Added new API methods:
- ✅ `createLike(targetUserId)` → POST /likes
- ✅ `getMatches()` → GET /matches
- ✅ `getMessages(matchId)` → GET /matches/:matchId/messages
- ✅ `sendMessage(matchId, body)` → POST /matches/:matchId/messages

### 4. Frontend: Discover Page (`frontend/src/app/discover/page.tsx`)

- ✅ Wired like button to backend via `createLike()`
- ✅ Added match modal that shows when `matched: true`
- ✅ Modal displays:
  - "It's a Match!" celebration
  - Other user's display name
  - "Send Message" button (links to `/chat/:matchId`)
  - "Keep Swiping" button
- ✅ Advances to next profile automatically

### 5. Frontend: Matches Page (`frontend/src/app/matches/page.tsx`)

- ✅ Fetches real matches from `GET /matches`
- ✅ Displays list of match rows with:
  - Profile photo (or placeholder)
  - Display name
  - Faculty & year
  - Tap to navigate to `/chat/:matchId`
- ✅ Shows placeholder when no matches exist
- ✅ Error handling with retry button

### 6. Frontend: Chat Page (`frontend/src/app/chat/[matchId]/page.tsx`)

- ✅ Fetches messages on mount
- ✅ Polls for new messages every 2 seconds
- ✅ Cleans up polling interval on unmount
- ✅ Renders messages in bubble UI:
  - Sent messages (right side, purple gradient)
  - Received messages (left side, white)
  - Timestamps
- ✅ Message input with send button
- ✅ Auto-scrolls to bottom on new messages
- ✅ 2000 character limit
- ✅ Disables input while sending

### 7. Frontend: Settings Page (`frontend/src/app/settings/page.tsx`)

- ✅ Added dev-only "Developer Tools" section
- ✅ Only visible when `NEXT_PUBLIC_ENV !== 'production'`
- ✅ Shows seed command with user's email pre-filled
- ✅ Explains what the seed script does
- ✅ Yellow/gold styling to distinguish from production features

## 🎯 Acceptance Criteria

All requirements met:

### ✅ Backend
- [x] Messages table added to `schema.sql` with proper FKs and indexes
- [x] `GET /api/matches/:matchId/messages` endpoint with auth & verification
- [x] `POST /api/matches/:matchId/messages` endpoint with validation & auth
- [x] Seeding scripts are idempotent and safe to re-run
- [x] `npm run seed-dev` creates 80 profiles + likes + matches + messages

### ✅ Frontend
- [x] Discover like button calls backend and shows match modal
- [x] Matches page lists real matches from API
- [x] Chat page shows messages and polls every 2 seconds
- [x] Can send new messages from chat page
- [x] Dev-only seed instructions in settings page

### ✅ Auth Untouched
- [x] No modifications to signup/login/logout flows
- [x] All features work with existing Supabase DB connection

## 🧪 Testing Instructions

### 1. Run Migrations
```bash
cd backend
npm run migrate
```
Expected: Messages table created successfully

### 2. Seed Dev Data
```bash
cd backend
TARGET_EMAIL=your.email@mail.mcgill.ca npm run seed-dev
```
Expected:
- 80 profiles created
- 20 likes to your account
- 10 matches created
- Messages seeded in each match

### 3. Test Discovery
1. Log in with your account
2. Navigate to Discover page
3. Click like button on profiles
4. If you match with someone, should see "It's a Match!" modal
5. Click "Send Message" to go to chat

### 4. Test Matches
1. Navigate to Matches page
2. Should see list of 10 matched profiles
3. Click on a match to open chat

### 5. Test Chat
1. Open a chat from matches page
2. Should see seeded messages
3. Type a message and click send
4. Message should appear immediately
5. Open chat in another window - messages should sync within 2 seconds

## 📁 Files Created

- `backend/src/db/seed-likes.ts` (helper)
- `backend/src/db/seed-messages.ts` (helper)
- `backend/src/db/seed-dev.ts` (orchestrator)

## 📝 Files Modified

- `backend/src/db/schema.sql` (added messages table)
- `backend/src/index.ts` (added messaging endpoints)
- `backend/package.json` (added seed-dev script)
- `frontend/src/lib/api.ts` (added messaging API methods)
- `frontend/src/app/discover/page.tsx` (wired like button + match modal)
- `frontend/src/app/matches/page.tsx` (real implementation)
- `frontend/src/app/chat/[matchId]/page.tsx` (real implementation with polling)
- `frontend/src/app/settings/page.tsx` (added dev tools section)

## 🚀 Next Steps

The app is now fully functional for:
- Discovering and liking profiles
- Creating matches
- Sending and receiving messages in real-time
- Testing with realistic sample data

All features are production-ready and follow the existing code patterns and conventions.
