# McGill Dating App - Technical Contracts

**Single Source of Truth for all developers and AI agents**

## Purpose

McGill-exclusive dating app (mobile-first, initially shipping as web app)

## Quick Start

```bash
# Install dependencies
npm install

# Run web app (port 3000)
npm run dev:web

# Run API server (port 3001)
npm run dev:api
```

## Directory Ownership

| Path | Owner/Team | Purpose |
|------|------------|---------|
| `/apps/web` | Frontend team | Next.js mobile-first web app |
| `/apps/api` | Backend team | Express API server |
| `/packages/shared` | Platform team | Shared TypeScript types & contracts |
| `/docs` | All | Documentation & contracts |

**Work in parallel safely:**
- Auth team: `auth/*` branches
- Profile team: `profile/*` branches  
- Match/Discovery team: `match/*` branches
- Chat team: `chat/*` branches

## UI Screen Map (Mobile-First)

### Auth Flow
- **`/`** - Landing/Welcome (app explanation, McGill trust signal, CTA)
- **`/auth/login`** - Login (email + password, forgot password)
- **`/auth/signup`** - Signup (McGill email verification, password/OAuth)
- **`/auth/verify`** - Email Verification (verify McGill email)

### Onboarding Flow
- **`/onboarding`** - Profile Setup (photos, bio/prompts, preferences, consent)

### Core App
- **`/discover`** - Discovery Feed (browse/swipe, like/pass, daily limits)
- **`/matches`** - Matches List (mutual likes, last message preview)
- **`/chat/[matchId]`** - Chat Thread (1-to-1 messaging)
- **`/profile`** - User Profile (edit info, photos, bio, privacy)
- **`/settings`** - Settings (account, privacy, blocking, delete account)

## Data Model

### User
```typescript
{
  id: string;
  email: string;              // Must be @mail.mcgill.ca
  mcgillVerified: boolean;    // Email verification status
  createdAt: Date;
}
```

### Profile
```typescript
{
  userId: string;
  displayName: string;
  bio: string;
  photos: string[];           // URLs or paths
  faculty?: string;           // e.g., "Engineering", "Arts"
  year?: number;              // Graduation year or current year
  pronouns?: string;          // e.g., "he/him", "she/her", "they/them"
  gender?: string;
  intent?: 'dating' | 'friendship' | 'networking' | 'casual';
  preferences: {
    ageMin?: number;
    ageMax?: number;
    genderPreference?: string[];
    maxDistance?: number;
  };
}
```

### Like
```typescript
{
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Date;
}
```

### Match
```typescript
{
  id: string;
  userAId: string;
  userBId: string;
  createdAt: Date;
  lastMessageAt?: Date;
}
```

### Message
```typescript
{
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  readAt?: Date;
}
```

### Report
```typescript
{
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  createdAt: Date;
}
```

### Block
```typescript
{
  id: string;
  blockerId: string;
  targetId: string;
  createdAt: Date;
}
```

## API Conventions

- **Base URL:** `/api`
- **Format:** JSON only
- **Auth:** `Authorization: Bearer <token>` (header)
- **Error shape:**
  ```json
  {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable message"
    }
  }
  ```

## API Endpoints

### Health

#### `GET /api/health`
**Purpose:** Check API status

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T12:00:00.000Z"
}
```

---

### Auth

#### `POST /api/auth/signup`
**Purpose:** Create new user account with McGill email

**Request:**
```json
{
  "email": "john.doe@mail.mcgill.ca",
  "password": "securePassword123"
}
```

**Response 201:**
```json
{
  "userId": "usr_abc123",
  "message": "Verification email sent to john.doe@mail.mcgill.ca"
}
```

**Errors:** 
- `400` - Invalid email domain (must be @mail.mcgill.ca)
- `409` - Email already registered

---

#### `POST /api/auth/login`
**Purpose:** Authenticate user and get session token

**Request:**
```json
{
  "email": "john.doe@mail.mcgill.ca",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_abc123",
    "email": "john.doe@mail.mcgill.ca",
    "mcgillVerified": true,
    "createdAt": "2026-01-17T12:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Email not verified

---

#### `POST /api/auth/verify-email`
**Purpose:** Verify McGill email with token from email

**Request:**
```json
{
  "token": "verify_token_abc123"
}
```

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- `400` - Invalid or expired token

---

#### `POST /api/auth/logout`
**Purpose:** Invalidate current session token

**Request:** None (uses token from Authorization header)

**Response 200:**
```json
{
  "success": true
}
```

---

### User/Profile

#### `GET /api/me`
**Purpose:** Get current user and profile data

**Request:** None (uses token from Authorization header)

**Response 200:**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "john.doe@mail.mcgill.ca",
    "mcgillVerified": true,
    "createdAt": "2026-01-17T12:00:00.000Z"
  },
  "profile": {
    "userId": "usr_abc123",
    "displayName": "John",
    "bio": "Engineering student who loves hiking",
    "photos": ["/uploads/photo1.jpg", "/uploads/photo2.jpg"],
    "faculty": "Engineering",
    "year": 2025,
    "pronouns": "he/him",
    "gender": "male",
    "intent": "dating",
    "preferences": {
      "ageMin": 19,
      "ageMax": 25,
      "genderPreference": ["female"],
      "maxDistance": 10
    }
  }
}
```

**Errors:**
- `401` - Unauthorized

---

#### `PATCH /api/me/profile`
**Purpose:** Update current user's profile

**Request:** (all fields optional)
```json
{
  "displayName": "John",
  "bio": "Updated bio text",
  "photos": ["/uploads/new_photo.jpg"],
  "faculty": "Engineering",
  "year": 2025,
  "pronouns": "he/him",
  "gender": "male",
  "intent": "dating",
  "preferences": {
    "ageMin": 19,
    "ageMax": 25,
    "genderPreference": ["female", "non-binary"],
    "maxDistance": 15
  }
}
```

**Response 200:**
```json
{
  "profile": {
    "userId": "usr_abc123",
    "displayName": "John",
    "bio": "Updated bio text",
    "photos": ["/uploads/new_photo.jpg"],
    "faculty": "Engineering",
    "year": 2025,
    "pronouns": "he/him",
    "gender": "male",
    "intent": "dating",
    "preferences": {
      "ageMin": 19,
      "ageMax": 25,
      "genderPreference": ["female", "non-binary"],
      "maxDistance": 15
    }
  }
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Invalid field values

---

### Discovery/Matching

#### `GET /api/discover`
**Purpose:** Get potential matches for discovery feed

**Request:** None (uses preferences from current user's profile)

**Response 200:**
```json
{
  "profiles": [
    {
      "userId": "usr_xyz789",
      "displayName": "Sarah",
      "bio": "Arts student, love coffee and books",
      "photos": ["/uploads/photo1.jpg"],
      "faculty": "Arts",
      "year": 2026,
      "pronouns": "she/her",
      "gender": "female",
      "intent": "dating",
      "preferences": {
        "ageMin": 19,
        "ageMax": 25,
        "genderPreference": ["male"],
        "maxDistance": 10
      }
    }
  ],
  "hasMore": true
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Profile not complete

---

#### `POST /api/likes`
**Purpose:** Like a user (creates match if mutual)

**Request:**
```json
{
  "targetUserId": "usr_xyz789"
}
```

**Response 200:**
```json
{
  "matched": true,
  "matchId": "match_abc123"
}
```
*OR if not matched:*
```json
{
  "matched": false
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Target user not found
- `429` - Daily like limit reached

---

#### `GET /api/matches`
**Purpose:** Get all current matches

**Request:** None

**Response 200:**
```json
{
  "matches": [
    {
      "match": {
        "id": "match_abc123",
        "userAId": "usr_abc123",
        "userBId": "usr_xyz789",
        "createdAt": "2026-01-17T12:00:00.000Z",
        "lastMessageAt": "2026-01-17T13:00:00.000Z"
      },
      "profile": {
        "userId": "usr_xyz789",
        "displayName": "Sarah",
        "bio": "Arts student, love coffee and books",
        "photos": ["/uploads/photo1.jpg"],
        "faculty": "Arts",
        "year": 2026,
        "pronouns": "she/her",
        "gender": "female",
        "intent": "dating",
        "preferences": {
          "ageMin": 19,
          "ageMax": 25,
          "genderPreference": ["male"],
          "maxDistance": 10
        }
      }
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

### Messaging

#### `GET /api/matches/:matchId/messages`
**Purpose:** Get all messages in a match

**Request:** None

**Response 200:**
```json
{
  "messages": [
    {
      "id": "msg_abc123",
      "matchId": "match_abc123",
      "senderId": "usr_abc123",
      "body": "Hey! How's it going?",
      "createdAt": "2026-01-17T12:00:00.000Z",
      "readAt": "2026-01-17T12:05:00.000Z"
    },
    {
      "id": "msg_def456",
      "matchId": "match_abc123",
      "senderId": "usr_xyz789",
      "body": "Great! How about you?",
      "createdAt": "2026-01-17T12:10:00.000Z",
      "readAt": null
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not part of this match
- `404` - Match not found

---

#### `POST /api/matches/:matchId/messages`
**Purpose:** Send a message in a match

**Request:**
```json
{
  "body": "Hey! How's it going?"
}
```

**Response 201:**
```json
{
  "message": {
    "id": "msg_abc123",
    "matchId": "match_abc123",
    "senderId": "usr_abc123",
    "body": "Hey! How's it going?",
    "createdAt": "2026-01-17T12:00:00.000Z",
    "readAt": null
  }
}
```

**Errors:**
- `401` - Unauthorized
- `403` - Not part of this match
- `404` - Match not found
- `400` - Empty message body

---

### Safety

#### `POST /api/report`
**Purpose:** Report a user for inappropriate behavior

**Request:**
```json
{
  "targetId": "usr_xyz789",
  "reason": "harassment",
  "details": "Sent inappropriate messages"
}
```

**Response 201:**
```json
{
  "reportId": "report_abc123"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Target user not found

---

#### `POST /api/block`
**Purpose:** Block a user

**Request:**
```json
{
  "targetId": "usr_xyz789"
}
```

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Target user not found
- `409` - User already blocked

---

## Parallel Work Rules

1. **Never change contracts without updating this document first**
2. **Branch naming:** `auth/*`, `profile/*`, `match/*`, `chat/*`
3. **Merge policy:** Small PRs, keep `main` green and deployable
4. **Shared types:** Changes to `/packages/shared` require review from all teams
5. **Database migrations:** Coordinate in #db-migrations channel
6. **API changes:** Announce in #api-changes before merging

## Definition of Done (Foundation Commit)

- ✅ Web app runs (`npm run dev:web`)
- ✅ API server runs (`npm run dev:api`)
- ✅ Shared package builds
- ✅ All routes/pages exist (placeholder)
- ✅ All API endpoints exist (stub responses)
- ✅ This document exists and is complete

## What's NOT Implemented Yet

- Database layer (no Postgres/Supabase/etc yet)
- Real authentication (JWT, sessions, password hashing)
- File uploads (photo storage)
- Email service (verification emails)
- Matching algorithm
- Real-time messaging (WebSockets/Pusher)
- Admin panel
- CI/CD pipeline
- Docker/deployment config

**These are intentionally left out.** This is a foundation commit only.
