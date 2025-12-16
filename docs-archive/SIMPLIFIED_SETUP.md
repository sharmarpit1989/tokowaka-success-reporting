# AI Visibility Dashboard - Simplified Setup ✅

All unnecessary `.bat` files have been removed. Here's how to use the dashboard:

---

## 🚀 **2 Simple Commands**

### **1️⃣ First Time Setup** (Run Once)

Open PowerShell or Command Prompt in the project folder and run:

```bash
# Copy environment template
copy backend\config\env.example.txt backend\.env

# Edit backend\.env with your Azure OpenAI credentials
# (Open in Notepad and add your API keys)

# Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

### **2️⃣ Start Dashboard** (Every Time)

Just double-click:

```
start.bat
```

**OR** run from terminal:

```bash
start.bat
```

This will:
- ✅ Kill old processes
- ✅ Start backend (port 3000)
- ✅ Start frontend (port 5173)

**Wait 10 seconds**, then open: **http://localhost:5173**

---

## 🔧 **Manual Start** (Alternative)

If you prefer manual control, open **2 separate terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ❌ **To Stop**

- Close the terminal windows, OR
- Press `Ctrl+C` in each terminal

---

## 🐛 **Troubleshooting**

### "Port 3000 already in use"

Kill Node processes:
```bash
taskkill /F /IM node.exe
```

Then run `start.bat` again.

---

### "Module not found" errors

Re-install dependencies:
```bash
cd backend && npm install && cd ../frontend && npm install
```

---

### Backend not loading new code

Completely restart:
1. Close all terminal windows
2. Run `taskkill /F /IM node.exe`
3. Run `start.bat` again

---

## 📖 **What Was Removed**

Deleted 11 unnecessary `.bat` files:
- ❌ START_DASHBOARD.bat
- ❌ CLEANUP_SYSTEM.bat
- ❌ RESTART_SERVERS.bat
- ❌ KILL_PORT_3000.bat
- ❌ FORCE_RESTART_BACKEND.bat
- ❌ RESTART_BACKEND.bat
- ❌ TEST_UPLOAD_ENDPOINT.bat
- ❌ CHECK_SYSTEM_RESOURCES.bat
- ❌ INSTALL_OPTIMIZATIONS.bat
- ❌ INSTALL.bat
- ❌ START.bat (old version)

Replaced with:
- ✅ **start.bat** (simple, clean, does everything)

---

## ✅ **Summary**

**Setup once:**
```bash
copy backend\config\env.example.txt backend\.env
# Edit backend\.env with your API keys
cd backend && npm install && cd ../frontend && npm install && cd ..
```

**Run every time:**
```bash
start.bat
```

**That's it!** 🎉

