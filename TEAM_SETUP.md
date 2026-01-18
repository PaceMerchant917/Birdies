# Team Setup Guide - Shared Supabase Database

## 🎯 Goal
All developers use **ONE shared Supabase database** (not 4 individual local ones).

## 📋 For Team Lead (You - Run This ONCE)

### 1. Verify Supabase Setup
- ✅ You already have a Supabase project at: `db.gfzfycutodzwpdncobry.supabase.co`
- ✅ Database schema is ready (`npm run migrate` was run)

### 2. Share Credentials Securely
**DO NOT commit the actual `.env` file to GitHub!** Instead, share credentials through:

**Option A: Team Communication (Recommended)**
- Share via Slack/Discord/Teams (private DM or private channel)
- Or use a password manager (1Password, LastPass, etc.)

**Option B: Environment Variables Document**
Create a shared document (Google Docs, Notion) with:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:Sarnia#1260#@db.gfzfycutodzwpdncobry.supabase.co:5432/postgres

# JWT Secret (same for all team members in dev)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Port (optional, defaults to 3001)
API_PORT=3001
```

### 3. What to Push to GitHub
✅ **DO push:**
- `.env.example` (with placeholders, no real passwords)
- All code files
- `README.md`, `SETUP_INSTRUCTIONS.md`, `TEAM_SETUP.md`
- `.gitignore` (already configured correctly)

❌ **DO NOT push:**
- `.env` (already in `.gitignore`)
- `.env.bak`, `.env.old-backup` (remove these before pushing)
- Any file with real passwords or secrets

---

## 👥 For Other Developers (After Pulling from GitHub)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd Birdies
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 3: Configure Backend Environment
```bash
# Create your local .env file
cd backend
cp .env.example .env
```

Now **edit `backend/.env`** with the credentials your team lead shared with you:

```env
# Use the EXACT DATABASE_URL provided by your team lead
DATABASE_URL=postgresql://postgres:Sarnia#1260#@db.gfzfycutodzwpdncobry.supabase.co:5432/postgres

# Use the EXACT JWT_SECRET provided by your team lead
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Port (optional)
API_PORT=3001
```

### Step 4: Configure Frontend Environment (Optional)
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
```

### Step 5: Start Development
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Step 6: Verify Connection
- Backend should show: `✅ Connected to PostgreSQL database (DATABASE_URL)`
- Open http://localhost:3000
- Sign up with a McGill email
- Complete onboarding
- Check the discover page - you should see profiles from the **shared database**!

---

## ⚠️ Important Rules

### Database Migrations
- **DO NOT run `npm run migrate` unless coordinating with the team**
- The schema is already set up in the shared database
- Only run migrations when adding NEW tables/columns (coordinate first!)

### Environment Files
- **NEVER commit `.env` files** (already in `.gitignore`)
- Each developer creates their own local `.env` from `.env.example`
- All developers use the **same DATABASE_URL** (shared Supabase)

### Data Isolation
- You're all sharing ONE database
- When testing, be aware others can see your test data
- Use clear naming for test accounts (e.g., `test-yourname@mail.mcgill.ca`)

---

## 🧪 Testing with Shared Database

### Creating Test Profiles
Each developer can:
1. Sign up with their own test accounts
2. Complete onboarding with different test data
3. Everyone will see each other's profiles in discover page

### Seeding Sample Data (Optional)
If the team wants sample profiles:
```bash
cd backend
npm run seed-profiles  # Creates 5 test accounts
```

**Only one person needs to run this once**, not every developer.

---

## 🐛 Troubleshooting

### "Database connection error"
- Verify your `DATABASE_URL` in `backend/.env` matches what team lead shared
- Check for typos (especially special characters in password)
- Make sure you're connected to the internet

### "Table doesn't exist"
- The team lead needs to run `npm run migrate` once
- Or migrations weren't completed successfully

### "Can't see other profiles"
- You're connected to the right database (check backend logs)
- Other team members need to sign up and complete onboarding
- Try running `npm run seed-profiles` to add test data

### "Port already in use"
- Backend default is 3001, frontend is 3000
- Change `API_PORT` in your `.env` if needed
- Make sure no other instances are running

---

## 🔄 Workflow for Schema Changes

When you need to modify database structure:

1. **Discuss with team** - coordinate timing
2. **Update `backend/src/db/schema.sql`**
3. **Test locally first** (optional: use a separate Supabase project)
4. **Coordinate migration** - one person runs `npm run migrate`
5. **Push schema changes to GitHub**
6. **Notify team** to pull latest changes

---

## ✅ Verification Checklist

After setup, you should see:

- ✅ Backend logs: `✅ Connected to PostgreSQL database (DATABASE_URL)`
- ✅ No SSL errors (SSL is auto-enabled for Supabase)
- ✅ Can sign up and login
- ✅ Can complete onboarding
- ✅ Can see profiles in discover page
- ✅ Profiles persist across server restarts (stored in Supabase)

---

## 🔒 Security Notes

- **Supabase credentials are sensitive** - share securely, not in public channels
- `.env` files are git-ignored - never commit them
- For production, use different credentials than development
- Each team member should use the same DATABASE_URL (shared dev database)
- Change `JWT_SECRET` when deploying to production

---

## 📞 Questions?

- Can't connect? Check your `DATABASE_URL` format and password
- Database issues? Contact the team lead
- Setup problems? See `SETUP_INSTRUCTIONS.md`
- API questions? See `docs/CONTRACTS.md`
