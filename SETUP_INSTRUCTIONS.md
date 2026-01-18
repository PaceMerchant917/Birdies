# Quick Setup Instructions

## ✅ What You Need to Do

### 1. Configure Supabase Database (ONE TIME SETUP)

The app uses a centralized Supabase Postgres database shared by all developers.

#### Get your Supabase connection string:

1. Go to your [Supabase project dashboard](https://app.supabase.com)
2. Navigate to **Project Settings** > **Database**
3. Find the **Connection string** section and select **URI** mode
4. Copy the connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password

#### Configure your environment:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-secret-key-here
```

**Note:** SSL is automatically enabled for Supabase connections.

### 2. Run Database Migration (ONCE PER DATABASE)

**Important:** Only ONE person needs to run this initially, or when schema changes are made.

```bash
cd backend
npm run migrate
```

This creates all the necessary tables (users, profiles, likes, matches, blocks) in the Supabase database.

### 3. Start Using the App!

That's it! Now you can:

1. **Sign up** with a McGill email (@mail.mcgill.ca)
2. **Complete onboarding** - fill out your profile (name, bio, faculty, etc.)
3. **Browse discover page** - see other users who have signed up!

## 🎯 How It Works Now

### Real Profile Flow (No More Placeholder Data!)

```
User Signs Up
    ↓
Gets Redirected to Onboarding
    ↓
Fills Out Profile Form
    ↓
Profile Saved to Supabase Database
    ↓
Redirected to Discover Page
    ↓
Sees Other Real Users!
```

### What Happens When You Sign Up

1. **Signup** - Creates user account in Supabase database
2. **Login** - Authenticates and gets JWT token
3. **Auto-redirect to Onboarding** - If you don't have a profile yet
4. **Create Profile** - Fill out the onboarding form
5. **Profile Saved** - Stored in `profiles` table in Supabase
6. **Discover** - Your profile now appears to others, and you can see theirs!

## 🧪 Testing with Multiple Users

To test the discover feature, you need multiple profiles:

### Option 1: Create Real Accounts (Recommended)
1. Sign up with different McGill emails
2. Complete onboarding for each
3. Log in as one user and browse others in discover

### Option 2: Use Sample Data (Quick Testing)
```bash
cd backend
npm run seed-profiles
```

This creates 5 test accounts you can log into or browse.

## 📋 Current Features

✅ **Working:**
- User signup & email verification
- JWT authentication
- Profile creation via onboarding
- Profiles stored in database
- Discover page shows real profiles from database
- Auto-redirect to onboarding if no profile
- Like/Pass UI (backend integration coming soon)

🚧 **Not Yet Implemented:**
- Photo uploads (profiles work without photos for now)
- Like/match functionality (UI ready, backend pending)
- Preference-based filtering
- Real-time chat

## 🐛 Troubleshooting

### "Error fetching discovery feed"
- Make sure your `DATABASE_URL` is correctly set in `backend/.env`
- Verify you ran `npm run migrate` (should be done once)
- Check that backend is running on http://localhost:3001
- Check backend terminal for database connection errors

### "Database connection error"
- Verify your Supabase `DATABASE_URL` is correct in `backend/.env`
- Check your database password in the connection string
- Ensure SSL is enabled (automatic for Supabase)
- Confirm your Supabase project is active

### "No profiles available"
- You need at least 2 users with profiles
- Sign up with another account and complete onboarding
- Or run `npm run seed-profiles` for test data

### "Redirects to onboarding every time"
- This means you haven't completed your profile yet
- Fill out the onboarding form completely
- Make sure display name and bio are filled in

## 📁 Key Files Changed

### Backend
- `src/index.ts` - Added `/api/me` and `/api/me/profile` endpoints
- `src/db/schema.sql` - Has all tables (profiles, likes, matches, blocks)

### Frontend
- `src/lib/api.ts` - Added `getMe()` and `updateProfile()` functions
- `src/app/onboarding/page.tsx` - Now saves to database
- `src/app/home/page.tsx` - Auto-redirects to onboarding if no profile
- `src/app/discover/page.tsx` - Shows real profiles from database

## 🎉 Summary

**You're all set!** Connect to Supabase, run the migration once (only one person needs to do this), then sign up and create profiles. The discover page will show real users from the shared Supabase database!

```bash
# One-time setup:
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run migrate  # Only one person runs this initially

# Then just use the app normally:
# 1. Sign up
# 2. Complete onboarding
# 3. Browse discover page!
```

## 🔄 Migration to Supabase - Team Onboarding

### For New Developers Joining the Project:

1. **Get Supabase credentials** from your team lead
2. **Copy environment template:**
   ```bash
   cd backend
   cp .env.example .env
   ```
3. **Set DATABASE_URL** in `backend/.env` with the shared Supabase connection string
4. **Set JWT_SECRET** (get from team or generate new one for local dev)
5. **DO NOT run migrations** - the database schema already exists
6. **Start developing:**
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

### For the Team Lead/First Setup:

1. Create a Supabase project at https://app.supabase.com
2. Get the connection string from Project Settings > Database
3. Share the `DATABASE_URL` with the team (securely)
4. Run migrations once to create the schema:
   ```bash
   cd backend
   npm run migrate
   ```
5. Share the `DATABASE_URL` and `JWT_SECRET` with team members

### Migrating Existing Local Data (Optional):

If you have local data you want to preserve:
1. Export from local: `pg_dump -h localhost -p 5433 -U mcgill mcgill_dating > backup.sql`
2. Clean up Supabase-incompatible commands if needed
3. Import to Supabase: Use Supabase SQL Editor or `psql` with your DATABASE_URL
