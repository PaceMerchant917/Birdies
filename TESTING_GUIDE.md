# Profile Page Testing Guide

## Prerequisites
- Backend running on `http://localhost:3001` ✅
- Frontend running on `http://localhost:3000` ✅
- PostgreSQL database running
- Valid McGill email for signup/login

## Test Scenarios

### Test 1: First-Time Profile Creation
**Steps:**
1. Create a new account or login
2. Navigate to Profile page (bottom nav → Profile icon)
3. Page should show:
   - Empty form fields
   - Default letter avatar
   - Email as fallback name

**Expected Result:** No errors, empty form ready for editing

---

### Test 2: Add Photos
**Steps:**
1. Click "Add Photo" in the photos grid
2. Select 1-3 image files (JPG, PNG, etc.)
3. Wait for compression (should be instant)
4. Observe:
   - Photo previews appear in grid
   - First photo gets "Main" badge
   - Photo counter updates
   - Save bar appears at bottom

**Expected Result:** 
- Photos compressed and displayed
- First photo shows as avatar in preview section
- Save bar visible with "Save Changes" and "Discard" buttons

---

### Test 3: Fill Profile Information
**Steps:**
1. Enter display name: "Test User"
2. Enter bio: "This is my test bio"
3. Select faculty: "Engineering"
4. Select year: "U2"
5. Select pronouns: "they/them"

**Expected Result:**
- Character counters update live
- All fields accept input
- Save bar remains visible

---

### Test 4: Set Preferences
**Steps:**
1. Select intent: "Dating / Relationship"
2. Set age range: 20 to 25
3. Check gender preferences: "Women" and "Non-binary"
4. Set max distance: 50 km

**Expected Result:** All preferences saved in state

---

### Test 5: Save Profile
**Steps:**
1. Click "Save Changes"
2. Wait for API call

**Expected Result:**
- Green success banner appears: "Profile saved successfully!"
- Save bar disappears
- Success message disappears after 3 seconds
- No errors in console

---

### Test 6: Hard Refresh Test (Persistence)
**Steps:**
1. After saving (Test 5), hard refresh the page (Cmd+R or Ctrl+R)
2. Wait for page to load

**Expected Result:**
- All saved data reappears:
  - Photos displayed
  - Display name as heading
  - First photo as avatar
  - All form fields populated
  - No save bar (not dirty)

---

### Test 7: Logout/Login Test (Real Persistence)
**Steps:**
1. Go to Settings → Logout
2. Login again with same credentials
3. Navigate to Profile page

**Expected Result:**
- All profile data still present
- Photos still displayed
- Everything persisted in database

---

### Test 8: Discard Changes
**Steps:**
1. Edit display name to something else
2. Save bar appears
3. Click "Discard"

**Expected Result:**
- Display name reverts to saved value
- Save bar disappears
- All changes discarded

---

### Test 9: Validation Tests
**Steps:**
1. Clear display name field
2. Click "Save Changes"

**Expected Result:** Error banner: "Please enter your display name"

**Steps:**
1. Set ageMin to 30
2. Set ageMax to 20
3. Click "Save Changes"

**Expected Result:** Error banner: "Minimum age cannot be greater than maximum age"

---

### Test 10: Photo Management
**Steps:**
1. Add 5 photos
2. Click × button on 3rd photo to remove it
3. Add 2 more photos (should reach limit of 6)
4. Try to add 7th photo

**Expected Result:**
- Photo 3 removed successfully
- Can add up to 6 total
- Alert shown: "You can upload maximum 6 photos"

---

### Test 11: Edit Existing Profile
**Steps:**
1. With saved profile, change bio
2. Remove one photo
3. Change faculty
4. Click "Save Changes"

**Expected Result:**
- All changes saved
- Refresh shows updated data
- No issues with partial updates

---

### Test 12: Mobile Responsiveness
**Steps:**
1. Resize browser to mobile size (375px width)
2. Scroll through entire page

**Expected Result:**
- All sections visible and usable
- Photo grid shows 3 columns
- Save bar doesn't overlap bottom nav
- Text readable, buttons tappable

---

## Known Issues (by design)

1. **EMFILE Warnings**: Watchpack file watcher warnings in terminal are normal on macOS
2. **Base64 Size**: Large images may take a moment to compress
3. **No Photo Reordering**: First uploaded photo is always main

---

## Error Scenarios to Test

### Network Error
- Stop backend server
- Try to save profile
- **Expected:** Error banner with network error message

### Invalid Token
- Manually delete `auth_token` from localStorage
- Refresh page
- **Expected:** Redirected to login page

### Empty Response
- Profile loads but backend returns null
- **Expected:** Form initializes with empty defaults

---

## Success Criteria

✅ All tests pass without errors
✅ Data persists across refresh
✅ Data persists across logout/login
✅ Photos compress and display correctly
✅ Validation works as expected
✅ UI is responsive and polished
✅ No console errors or warnings (except EMFILE)

---

## Quick Smoke Test (2 minutes)

1. Login
2. Go to Profile
3. Add 1 photo
4. Fill display name and bio
5. Save
6. Refresh page
7. Verify data is still there

**If this passes, core functionality is working!** ✨

---

## Browser Testing

Recommended browsers:
- ✅ Chrome/Edge (primary)
- ✅ Firefox
- ✅ Safari (Mac)

Image compression uses Canvas API, supported by all modern browsers.

---

## Database Verification (Optional)

Connect to PostgreSQL and check:

```sql
-- View all profiles
SELECT * FROM profiles;

-- Check specific user's profile
SELECT 
  display_name, 
  LENGTH(photos[1]) as first_photo_size,
  array_length(photos, 1) as photo_count,
  faculty,
  year
FROM profiles 
WHERE user_id = 'YOUR_USER_ID';
```

---

## Troubleshooting

### Photos not appearing after refresh
- Check backend logs for SQL errors
- Verify photos array is TEXT[] in PostgreSQL
- Check browser console for JSON parsing errors

### Save fails silently
- Open browser DevTools → Network tab
- Look for failed PATCH /api/me/profile request
- Check backend logs for error details

### UI looks broken
- Hard refresh to clear cache (Cmd+Shift+R)
- Check if globals.css changes were loaded
- Verify no CSS conflicts in browser inspector

---

## Performance Notes

**Image Compression:**
- 1 photo: < 100ms
- 6 photos: < 500ms
- Happens client-side before upload

**API Calls:**
- GET /api/me: ~50-100ms
- PATCH /api/me/profile: ~100-200ms

Both fast enough for great UX! 🚀
