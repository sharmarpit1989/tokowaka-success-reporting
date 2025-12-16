# Debug Citation Upload Issue 🔍

## Current Status

✅ **Backend is running** on port 3000 (confirmed)
✅ **Multer fix applied** (`.fields()` instead of `.array()`)
✅ **Frontend error handling improved**
❌ **Getting "Failed to fetch" error** in browser

---

## 🔍 To Debug - Please Check These 3 Things:

### 1️⃣ **Check Backend Terminal Window**

The `START_DASHBOARD.bat` script opened a window titled **"AI Dashboard - Backend Server"**.

**Look for:**
- ❌ Any red error messages when you try to upload
- ⚠️ Any multer errors
- ✅ Any successful log messages

**Example of what to look for:**
```
[Unified API] Uploading 2 brand presence files for project abc123
```

**OR any errors like:**
```
MulterError: Unexpected field
Error: ...
```

---

### 2️⃣ **Check Browser Console (F12)**

1. Open **DevTools** (Press `F12`)
2. Go to **Console** tab
3. Try uploading again
4. Look for messages starting with `[Citation Upload]`

**You should see:**
```
[Citation Upload] Uploading 2 files to project abc123
[Citation Upload] Response status: 200 OK
[Citation Upload] Success: {...}
```

**OR if error:**
```
[Citation Upload] Response status: 500 Internal Server Error
[Citation Upload] Error response: { error: "..." }
```

---

### 3️⃣ **Check Network Tab in DevTools**

1. Open **DevTools** (Press `F12`)
2. Go to **Network** tab
3. Try uploading again
4. Look for the request to `upload-citations`
5. Click on it

**Check:**
- **Status Code:** Should be 200, or might be 400/500 with error details
- **Response:** Should show the backend response
- **Request Headers:** Should show `Content-Type: multipart/form-data`

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch" with no backend error

**Cause:** Request not reaching backend (proxy issue or frontend sending to wrong URL)

**Solution:**
1. Verify frontend is running on `http://localhost:5173`
2. Verify backend is running on `http://localhost:3000`
3. Check `frontend/vite.config.js` proxy settings

---

### Issue: "MulterError: Unexpected field" still appearing

**Cause:** Backend not restarted with new code

**Solution:**
1. Press `Ctrl+C` in backend terminal window
2. Run `npm run dev` again
3. Wait for "Browser pool initialized" message

---

### Issue: "No files uploaded"

**Cause:** Files not being sent properly

**Solution:** Check browser console - should show files being appended to FormData

---

## 📝 What to Share

**Please share:**

1. **Backend terminal output** (when you try to upload)
2. **Browser console output** (the `[Citation Upload]` messages)
3. **Network tab details** (status code, response)

This will help me pinpoint the exact issue! 🎯

