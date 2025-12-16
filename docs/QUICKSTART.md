# Quick Start Guide

Get up and running with AI Visibility Dashboard in 10 minutes!

## Installation (5 minutes)

### 1. Open Terminal/Command Prompt

Navigate to the project folder:

```bash
cd "c:\Users\arsharma\OneDrive - Adobe\#Official\Customer Engineering\Automations\Garage Week Project"
```

### 2. Install Backend

```bash
cd backend
npm install
```

### 3. Install Frontend

```bash
cd ..\frontend
npm install
```

### 4. Configure API Key

```bash
cd ..\backend
copy config\env.example.txt .env
notepad .env
```

Add your Spacecat API key:
```env
SPACECAT_API_KEY=your-actual-api-key-here
```

Save and close.

## Running (2 minutes)

### Open TWO Terminal Windows

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Wait for: `Server running on: http://localhost:3000` ✅

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/` ✅

### Open Browser

Go to: **http://localhost:5173**

You should see the AI Visibility Dashboard! 🎉

## First Use (3 minutes)

### Test Content Analysis

1. Click **Content Analysis** in sidebar
2. Create a test CSV file:
   ```csv
   url
   https://www.adobe.com
   https://www.adobe.com/products/photoshop
   https://www.adobe.com/about-adobe
   ```
3. Save as `test-urls.csv`
4. Click **Upload CSV/Excel** and select the file
5. Click **Start Analysis**
6. Wait ~30 seconds for results

### Test with Your Data

**For Content Analysis:**
1. Prepare a CSV/Excel with your URLs
2. Upload and run analysis
3. See which pages have high content gain

**For Citation Tracking:**
1. Get brand presence Excel files from SharePoint
2. Go to **Citation Performance** page
3. Upload the Excel files
4. View citation rates and trends

## Common Commands

### Start Everything
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

### Stop Everything
Press `Ctrl+C` in both terminals

### Restart
1. Stop both terminals (`Ctrl+C`)
2. Run start commands again

## What to Do Next

✅ **Read Full Documentation:**
- [SETUP.md](./SETUP.md) - Detailed installation guide
- [USAGE.md](./USAGE.md) - How to use all features
- [README.md](../README.md) - Feature overview

✅ **Try These Features:**
- Upload your URL list
- Fetch top pages from Spacecat
- Run content analysis
- Upload brand presence data
- Create a project to save your work

✅ **Explore the Dashboard:**
- **Dashboard**: Overview and quick stats
- **Content Analysis**: Measure JavaScript impact
- **Citation Performance**: Track AI platform citations
- **Opportunities**: Find optimization wins
- **Projects**: Organize your work

## Troubleshooting Quick Fixes

### Port Already in Use
```bash
# Change port in backend/.env
PORT=3001
```

### Can't Find Module
```bash
cd backend
npm install

cd ../frontend
npm install
```

### API Errors
Check `.env` file has correct `SPACECAT_API_KEY`

### Frontend Won't Load
1. Check backend is running (Terminal 1)
2. Check no errors in Terminal 2
3. Try different browser
4. Clear browser cache

## Getting Help

**Installation Issues:** See [SETUP.md](./SETUP.md)

**Usage Questions:** See [USAGE.md](./USAGE.md)

**Technical Details:** See [API.md](./API.md)

**Still Stuck:** Contact the development team

---

## Pro Tips

💡 **Save Time**: Create projects to save your URL lists and settings

💡 **Batch Processing**: Analyze 100-200 URLs at a time for best performance

💡 **Weekly Updates**: Upload brand presence data every week to track trends

💡 **Export Often**: Download results as Excel for sharing with team

---

**Ready to optimize for AI? Let's go! 🚀**

