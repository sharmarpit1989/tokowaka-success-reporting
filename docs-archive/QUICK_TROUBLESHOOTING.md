# Quick Troubleshooting Guide

## ✅ White Screen Issue - FIXED (Again!)

### The Problem
Missing imports in `AIVisibility.jsx` caused the page to crash:
```javascript
// These were used but not imported:
<LLMScoreTooltip ... />
<OverallLLMScoreTooltip ... />
```

### The Fix
```javascript
import LLMScoreTooltip, { OverallLLMScoreTooltip } from '../components/LLMScoreTooltip'
```

**Status:** ✅ Fixed - The page should work now!

---

## 💻 Terminal Commands Guide

### The `cd` Command Confusion

**What's happening:**
The `cd` command doesn't produce any output when it succeeds - this is **NORMAL**!

**Example:**
```powershell
PS C:\AIVisibilityDashboard> cd backend
PS C:\AIVisibilityDashboard\backend> 
# ↑ See? No output, but the prompt changed to show you're in "backend"
```

### How to Check If It Worked

After running `cd`, check your prompt:
```powershell
# Before cd:
PS C:\AIVisibilityDashboard> 

# After cd backend:
PS C:\AIVisibilityDashboard\backend>
#                            ^^^^^^^ You're now here!
```

### Useful Commands

**1. Check Current Directory**
```powershell
pwd
# Output: C:\AIVisibilityDashboard\backend
```

**2. List Files**
```powershell
dir
# Shows all files in current directory
```

**3. Go Back One Level**
```powershell
cd ..
# Goes from backend to AIVisibilityDashboard
```

**4. Go to Specific Path**
```powershell
cd C:\AIVisibilityDashboard\backend
# Absolute path - works from anywhere
```

---

## 🚀 Starting the Application

### Method 1: Using Batch Files (Easiest)

**From project root:**
```powershell
.\START.bat
```

This opens two separate PowerShell windows:
- One for backend (port 3000)
- One for frontend (port 5173)

### Method 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend  
npm run dev
```

### Method 3: Install First (If dependencies missing)

**If you get errors about missing packages:**
```powershell
# Run this first
.\INSTALL_OPTIMIZATIONS.bat

# Then start
.\START.bat
```

---

## 🔍 How to Check If Servers Are Running

### Check Backend (Port 3000)

**Option 1: Browser**
- Open: http://localhost:3000/api/health
- Should see JSON response with status "ok"

**Option 2: PowerShell**
```powershell
curl http://localhost:3000/api/health
```

**Option 3: Check Terminal**
Look for this in backend terminal:
```
✅ Browser pooling (2 instances)
✅ Response caching
✅ Compression enabled
Server running on: http://localhost:3000
```

### Check Frontend (Port 5173)

**Option 1: Browser**
- Open: http://localhost:5173
- Should see the dashboard UI

**Option 2: Check Terminal**
Look for this in frontend terminal:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or just restart your computer
```

### Issue 2: "Module not found"

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solution:**
```powershell
# Reinstall dependencies
cd backend
npm install

cd ..\frontend
npm install
```

### Issue 3: White Screen in Browser

**Symptoms:**
- Browser shows blank white page
- Console shows errors

**Solutions:**

**A. Missing Imports (Most Common)**
- Check browser console (F12)
- Look for "X is not defined" errors
- We just fixed this!

**B. Frontend Not Running**
- Make sure frontend server is running on port 5173
- Check terminal for errors

**C. Build Issues**
```powershell
cd frontend
npm run build
npm run dev
```

### Issue 4: Backend API Errors

**Symptoms:**
- 404 errors
- 500 errors  
- "Failed to fetch"

**Solutions:**

**A. Check Backend Logs**
Look in backend terminal for red error messages

**B. Check Environment Variables**
```powershell
cd backend
type .env
# Should show your configuration
```

**C. Restart Backend**
```powershell
# In backend terminal, press Ctrl+C
# Then:
npm run dev
```

### Issue 5: Analyze URL Gets Stuck

**Symptoms:**
- Spinner shows forever
- No results appear

**Solutions:**

**A. Check Browser Console (F12)**
Look for these logs:
```
[Analyze URL] Starting analysis for: https://...
[Analyze URL] Polling attempt 1/30
```

**B. Check Backend Logs**
Look for:
```
[Unified API] Starting content analysis...
[Hybrid Analyzer] Starting job...
```

**C. Check Browser Pool**
Visit: http://localhost:3000/api/health
```json
{
  "browserPool": {
    "available": 2,
    "inUse": 0
  }
}
```

If `available: 0`, restart backend.

**D. Wait Longer**
Analysis takes 30-60 seconds. Be patient!

**E. Check Network Tab**
- Open DevTools (F12)
- Go to Network tab
- See if API calls are failing (red)

---

## 🎯 Quick Command Reference

### Navigation
```powershell
cd backend          # Go to backend folder
cd frontend         # Go to frontend folder  
cd ..              # Go up one level
cd \               # Go to drive root
pwd                # Show current directory
```

### File Operations
```powershell
dir                # List files
dir /s             # List files recursively
type filename.txt  # Show file contents
mkdir foldername   # Create directory
```

### Development
```powershell
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm test           # Run tests
```

### Process Management
```powershell
Ctrl+C             # Stop current process
tasklist           # Show running processes
netstat -ano       # Show ports in use
```

---

## 📋 Startup Checklist

When starting fresh:

- [ ] Open PowerShell in `C:\AIVisibilityDashboard`
- [ ] Run `.\INSTALL_OPTIMIZATIONS.bat` (first time only)
- [ ] Run `.\START.bat`
- [ ] Wait for both servers to start (10-20 seconds)
- [ ] Open browser to http://localhost:5173
- [ ] Check backend health: http://localhost:3000/api/health
- [ ] Upload URLs and start analyzing!

---

## 🔧 Development Workflow

### Making Changes

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Save (Ctrl+S)
3. Browser auto-refreshes (hot reload)
4. See changes immediately!

**Backend Changes:**
1. Edit files in `backend/`
2. Save (Ctrl+S)
3. Server auto-restarts (nodemon)
4. Wait ~2 seconds
5. Changes active!

### Viewing Logs

**Frontend (Browser Console):**
- Press F12
- Go to Console tab
- See React errors, API calls, etc.

**Backend (Terminal):**
- Look at the backend PowerShell window
- Scroll up to see history
- Copy logs with right-click

**Log Files:**
- Location: `logs/` folder
- `combined.log` - Everything
- `error.log` - Errors only

---

## 🆘 When Nothing Works

### Nuclear Option: Full Reset

```powershell
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Delete node_modules
cd backend
rmdir /s /q node_modules
cd ..\frontend
rmdir /s /q node_modules

# 3. Delete package locks (optional)
cd ..
del backend\package-lock.json
del frontend\package-lock.json

# 4. Reinstall everything
.\INSTALL_OPTIMIZATIONS.bat

# 5. Start fresh
.\START.bat
```

### Ask for Help

When reporting issues, include:

1. **Error message** (exact text)
2. **Browser console logs** (F12 → Console)
3. **Backend terminal output** (last 20 lines)
4. **What you were doing** (steps to reproduce)
5. **Screenshot** (if visual issue)

---

## 📞 Quick Diagnostics

**Run this to check everything:**

```powershell
# Check Node version
node --version
# Should be v18.0.0 or higher

# Check if servers are running
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Check backend health
curl http://localhost:3000/api/health

# Check frontend
curl http://localhost:5173
```

---

## ✅ Everything Working Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] http://localhost:3000/api/health returns OK
- [ ] http://localhost:5173 shows dashboard
- [ ] No errors in browser console (F12)
- [ ] No errors in backend terminal
- [ ] Can upload URLs
- [ ] Can upload brand presence files
- [ ] Can click "Analyze This URL"
- [ ] Results appear after 30-60 seconds

If all checked ✅ - You're good to go! 🎉

---

**Remember:** The `cd` command is silent when it works - that's normal! Use `pwd` or check your prompt to confirm you changed directories.

