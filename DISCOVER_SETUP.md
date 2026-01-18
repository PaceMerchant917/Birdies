# Discover Page Setup - Complete Guide

## Overview
This document explains how profiles stored in the database are connected to the discover page, allowing users to browse and interact with other McGill students.

## What Was Implemented

### 1. Database Schema Updates ✅
**File:** `backend/src/db/schema.sql`

Added the following tables:
- **`profiles`** - Stores user profile information (display name, bio, photos, preferences, etc.)
- **`likes`** - Tracks which users have liked each other
- **`matches`** - Stores mutual matches between users
- **`blocks`** - Tracks blocked users for safety

### 2. Authentication Middleware ✅
**File:** `backend/src/auth/middleware.ts`

Created `requireAuth` middleware that:
- Validates JWT tokens from the `Authorization` header
- Extracts the `userId` from the token
- Attaches `userId` to the request object for use in protected routes
- Returns proper error responses for invalid/missing tokens

### 3. Backend API Endpoint ✅
**File:** `backend/src/index.ts`

Implemented `GET /api/discover` endpoint that:
- Requires authentication (uses `requireAuth` middleware)
- Fetches profiles from the database excluding:
  - The current user's own profile
  - Profiles already liked by the user
  - Blocked users (both ways)
  - Incomplete profiles
- Returns up to 10 profiles (configurable via `?limit=N` query param)
- Transforms database rows into proper `Profile` objects matching the contract

### 4. Frontend API Client ✅
**File:** `frontend/src/lib/api.ts`

Added:
- `Profile` interface matching the backend response
- `DiscoverResponse` interface
- `getDiscoverFeed(limit?)` function that calls the backend API with authentication

### 5. Discover Page UI ✅
**File:** `frontend/src/app/discover/page.tsx`

Completely rebuilt the discover page with:
- **Profile fetching** - Loads profiles from the API on mount
- **Card-based UI** - Beautiful profile cards showing:
  - Profile photo (or placeholder)
  - Display name
  - Faculty and graduation year
  - Pronouns
  - Intent (dating/friendship/networking/casual)
  - Bio
- **Swipe actions** - Like (♥) and Pass (✕) buttons
- **Profile counter** - Shows current position (e.g., "3 / 10")
- **Error handling** - Graceful error states with retry button
- **Empty states** - Handles no profiles available
- **Responsive design** - Mobile-first with smooth animations

## How It Works

### Data Flow

```
User opens /discover
    ↓
Frontend checks authentication
    ↓
Frontend calls getDiscoverFeed()
    ↓
API validates JWT token (requireAuth middleware)
    ↓
API queries database for eligible profiles
    ↓
API returns profiles array
    ↓
Frontend displays first profile in card
    ↓
User clicks Like/Pass
    ↓
Frontend shows next profile
```

### Database Query Logic

The discover endpoint uses this SQL query:

```sql
SELECT profiles WHERE:
  - user_id != current_user (not yourself)
  - user_id NOT IN liked_users (haven't liked them yet)
  - user_id NOT IN blocked_users (not blocked)
  - user_id NOT IN users_who_blocked_you (they haven't blocked you)
  - display_name IS NOT NULL (has complete profile)
ORDER BY created_at DESC
LIMIT 10
```

## Testing the Feature

### 1. Migrate the Database

First, apply the new schema:

```bash
cd backend
npm run db:migrate
```

### 2. (Optional) Seed Sample Profiles for Testing

**Note:** You don't need to run this anymore! Profiles are now created automatically when users sign up and complete onboarding.

However, if you want some test profiles to browse, you can optionally run:

```bash
cd backend
npm run seed-profiles
```

This creates 5 sample users with profiles:
- sarah.johnson@mail.mcgill.ca
- mike.chen@mail.mcgill.ca
- alex.taylor@mail.mcgill.ca
- emma.wilson@mail.mcgill.ca
- david.lee@mail.mcgill.ca

All use password: `password123`

**For real usage:** Just sign up with different McGill emails and complete the onboarding form - those profiles will appear in the discover feed!

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Test the Flow

1. Go to `http://localhost:3000`
2. Sign up with a new McGill email OR log in with one of the seeded accounts
3. Navigate to the Discover page
4. You should see profile cards you can browse through
5. Click the ♥ button to like or ✕ to pass

## Next Steps (Not Yet Implemented)

### Like Functionality
Currently, clicking Like/Pass just moves to the next profile. To fully implement:

1. Create `POST /api/likes` endpoint in backend
2. Add `createLike()` function to frontend API
3. Call `createLike()` in the `handleLike()` function
4. Check for matches and show match notification

### Match Detection
When a like is created, check if it creates a mutual match:

```sql
SELECT * FROM likes 
WHERE from_user_id = $targetUserId 
  AND to_user_id = $currentUserId
```

If found, create a match record.

### Profile Photos
Currently using placeholder icons. To add real photos:

1. Implement file upload endpoint
2. Store photos in cloud storage (AWS S3, Cloudinary, etc.)
3. Update profile photos array with URLs
4. Display in profile cards

### Preferences Filtering
Currently showing all profiles. To filter by preferences:

1. Add WHERE clauses for age, gender, distance
2. Implement location-based filtering
3. Add preference settings in profile page

## File Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── helpers.ts          # JWT & password utilities
│   │   └── middleware.ts       # NEW: Auth middleware
│   ├── db/
│   │   ├── schema.sql          # UPDATED: Added profiles, likes, matches, blocks
│   │   └── seed-profiles.ts    # NEW: Sample data script
│   └── index.ts                # UPDATED: Added /api/discover endpoint

frontend/
├── src/
│   ├── app/
│   │   └── discover/
│   │       └── page.tsx        # UPDATED: Full profile browsing UI
│   └── lib/
│       └── api.ts              # UPDATED: Added getDiscoverFeed()
```

## API Contract

### GET /api/discover

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of profiles to return (default: 10)

**Response 200:**
```json
{
  "profiles": [
    {
      "userId": "uuid",
      "displayName": "Sarah",
      "bio": "Arts student who loves coffee...",
      "photos": [],
      "faculty": "Arts",
      "year": 2026,
      "pronouns": "she/her",
      "gender": "female",
      "intent": "dating",
      "preferences": {
        "ageMin": 18,
        "ageMax": 30,
        "genderPreference": [],
        "maxDistance": null
      }
    }
  ],
  "hasMore": true
}
```

**Error 401:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

## Troubleshooting

### "No profiles available"
- Make sure you ran the seed script
- Check that you're logged in as a different user than the profiles
- Verify the database has profiles: `SELECT * FROM profiles;`

### "Authentication failed"
- Check that the JWT token is being sent in the Authorization header
- Verify the token hasn't expired (7 day expiry)
- Try logging out and back in to get a fresh token

### Backend errors
- Check backend console for SQL errors
- Verify database connection in `backend/src/db/index.ts`
- Make sure all migrations ran successfully

## Summary

The discover page is now fully connected to the database! Users can:
- ✅ Browse profiles of other McGill students
- ✅ See profile information (name, bio, faculty, etc.)
- ✅ Navigate through profiles with Like/Pass buttons
- ✅ See profile counter and empty states

The foundation is complete for adding like/match functionality, which would be the next logical step.
