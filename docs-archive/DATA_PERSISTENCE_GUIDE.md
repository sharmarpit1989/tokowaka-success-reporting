# Data Persistence Guide

## Overview

The AI Visibility Dashboard now includes **automatic session persistence**. Your uploaded data, analysis results, and project information are automatically saved and restored when you navigate between pages.

## What Gets Persisted

### ✅ Automatically Saved Data

1. **Uploaded URLs**
   - All URLs you upload via CSV/Excel
   - Metadata about each upload (timestamp, filename)
   - Accessible from any page

2. **Analysis Results**
   - Content analysis results
   - LLM presence scores
   - AI-generated recommendations
   - Job status and progress

3. **Citation Data**
   - Brand presence upload data
   - Citation rates by platform
   - Citation trends over time

4. **Active Project**
   - Current project information
   - Project configuration
   - Associated URLs

5. **Filters**
   - Domain filters
   - Platform filters
   - Date range selections
   - Traffic range filters

6. **Recent Jobs**
   - Last 10 analysis jobs
   - Job status and timestamps

## How It Works

### Technical Implementation

```
User Action → React Context → localStorage
                    ↓
         Available Across All Pages
```

**Storage Mechanism:**
- **Primary:** React Context (in-memory, fast)
- **Backup:** localStorage (persistent across sessions)
- **Automatic:** Data syncs automatically on every change

### Storage Locations

```javascript
// Data is stored in localStorage with these keys:
app_uploaded_urls       // Uploaded URL lists
app_analysis_results    // Analysis job results
app_citation_data       // Citation tracking data
app_active_project      // Current active project
app_filters            // User filter preferences
app_recent_jobs        // Recent job history
```

## Using Persisted Data

### In Your Components

```javascript
import { useAppContext } from '@/contexts/AppContext';

function MyComponent() {
  const {
    // State
    uploadedUrls,      // All uploaded URLs
    analysisResults,   // Analysis results by jobId
    citationData,      // Citation tracking data
    activeProject,     // Active project info
    filters,           // Current filters
    
    // Actions
    addUploadedUrls,   // Add new URLs
    addAnalysisResult, // Store analysis results
    updateFilters,     // Update filter state
    clearAllData       // Clear everything
  } = useAppContext();

  // Use the data...
}
```

### Example: Persisting Uploaded URLs

```javascript
import { useAppContext } from '@/contexts/AppContext';
import { uploadUrlFile } from '@/services';

function ContentAnalysis() {
  const { addUploadedUrls, uploadedUrls } = useAppContext();

  const handleFileUpload = async (file) => {
    const result = await uploadUrlFile(file);
    
    // This data will persist across navigation!
    addUploadedUrls(result.urls, { 
      filename: file.name,
      source: 'file_upload'
    });
  };

  // Display previously uploaded URLs
  return (
    <div>
      {uploadedUrls.map(upload => (
        <div key={upload.id}>
          <p>{upload.urls.length} URLs from {upload.metadata.filename}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example: Checking for Persisted Data

```javascript
function Home() {
  const { 
    hasUploadedData, 
    hasAnalysisResults, 
    hasCitationData 
  } = useAppContext();

  return (
    <div>
      {hasUploadedData && (
        <div className="alert alert-info">
          You have uploaded URLs. Continue your analysis!
        </div>
      )}
    </div>
  );
}
```

## Data Lifecycle

### When Data is Saved
- ✅ **Immediately** on upload
- ✅ **Automatically** on state change
- ✅ **Synchronously** to localStorage
- ✅ **Persists** across page refreshes

### When Data is Loaded
- ✅ On app initialization
- ✅ On page navigation
- ✅ After browser refresh
- ✅ On new browser tab

### When Data is Cleared
- ❌ When user clicks "Clear All Data"
- ❌ When user clears browser data
- ❌ When localStorage is full (rare)
- ❌ When `clearAllData()` is called programmatically

## Visual Indicators

### Data Persistence Indicator

A green badge appears at the top of the page showing:
- 📊 **URLs** - Uploaded URL lists
- 📈 **Analysis** - Analysis results available
- 📋 **Citations** - Citation data uploaded
- 📁 **Project** - Active project set

### Sidebar Stats

Quick stats in the sidebar show:
- Active project count
- Total URLs loaded
- Analysis results status

## User Actions

### Clear All Data

Users can clear all session data via:

1. **Sidebar Button:**
   - Click "Clear All Data" in sidebar
   - Confirms before clearing

2. **Programmatically:**
   ```javascript
   const { clearAllData } = useAppContext();
   clearAllData();
   ```

3. **Browser Settings:**
   - Clear localStorage
   - Clear site data

## Best Practices

### For Developers

1. **Always use context for shared data:**
   ```javascript
   // Good ✅
   const { addUploadedUrls } = useAppContext();
   addUploadedUrls(urls);
   
   // Bad ❌
   localStorage.setItem('urls', JSON.stringify(urls));
   ```

2. **Check for existing data before upload:**
   ```javascript
   const { uploadedUrls } = useAppContext();
   if (uploadedUrls.length > 0) {
     // Offer to append or replace
   }
   ```

3. **Provide clear feedback:**
   ```javascript
   // Show data persistence indicator
   <DataPersistenceIndicator />
   ```

4. **Handle edge cases:**
   ```javascript
   try {
     addUploadedUrls(urls);
   } catch (error) {
     // localStorage might be full
     showError('Storage full. Please clear old data.');
   }
   ```

### For Users

1. **Data persists automatically** - No save button needed
2. **Navigate freely** - Your data follows you
3. **Check the indicator** - See what's stored
4. **Clear when done** - Free up space
5. **Refresh safely** - Data survives refresh

## Storage Limits

### localStorage Limits

- **Max size:** ~5-10MB per domain
- **Varies by browser:** Chrome, Firefox, Safari differ
- **Per origin:** Shared across all pages on domain

### Handling Full Storage

```javascript
// Automatic handling built-in
try {
  saveToStorage(key, data);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // Offer to clear old data
    console.error('Storage full!');
  }
}
```

## Troubleshooting

### Data Not Persisting

**Symptoms:** Data disappears on navigation

**Solutions:**
1. Check browser localStorage is enabled
2. Check for console errors
3. Verify AppProvider wraps your app
4. Check localStorage size limits

```javascript
// Check if localStorage works
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage works');
} catch (e) {
  console.log('❌ localStorage blocked');
}
```

### Data Not Loading

**Symptoms:** Uploaded data doesn't appear

**Solutions:**
1. Check AppProvider is in App.jsx
2. Verify useAppContext() hook usage
3. Check console for errors
4. Clear and re-upload

### Storage Full

**Symptoms:** "QuotaExceededError"

**Solutions:**
1. Click "Clear All Data" in sidebar
2. Clear old analysis results
3. Remove unused uploads
4. Clear browser cache

## API Reference

### Context State

```javascript
{
  uploadedUrls: Array<{
    id: number,
    urls: string[],
    uploadedAt: string,
    metadata: object
  }>,
  
  analysisResults: {
    [jobId]: {
      status: string,
      results: any[],
      timestamp: string
    }
  },
  
  citationData: {
    uploadedAt: string,
    data: any
  } | null,
  
  activeProject: object | null,
  
  filters: {
    domain: string,
    platform: string,
    dateRange: object | null,
    trafficRange: object | null
  },
  
  recentJobs: Array<{
    id: string,
    type: string,
    status: string,
    timestamp: string
  }>
}
```

### Context Actions

```javascript
// Upload management
addUploadedUrls(urls: string[], metadata?: object): number
clearUploadedUrls(): void
removeUpload(uploadId: number): void

// Analysis management
addAnalysisResult(jobId: string, results: object): void
updateAnalysisResult(jobId: string, updates: object): void

// Citation management
updateCitationData(data: object): void
clearCitationData(): void

// Project management
updateActiveProject(project: object): void
clearActiveProject(): void

// Filter management
updateFilters(filters: object): void
resetFilters(): void

// Job tracking
addRecentJob(job: object): void
updateRecentJob(jobId: string, updates: object): void

// Clear everything
clearAllData(): void
```

### Computed Values

```javascript
{
  allUrls: string[],           // All URLs from all uploads
  hasUploadedData: boolean,    // Any URLs uploaded
  hasAnalysisResults: boolean, // Any analysis results
  hasCitationData: boolean,    // Citation data available
  hasActiveProject: boolean    // Active project set
}
```

## Migration Guide

### Before (No Persistence)

```javascript
function ContentAnalysis() {
  const [urls, setUrls] = useState([]);
  
  const handleUpload = (newUrls) => {
    setUrls(newUrls); // Lost on navigation!
  };
}
```

### After (With Persistence)

```javascript
import { useAppContext } from '@/contexts/AppContext';

function ContentAnalysis() {
  const { uploadedUrls, addUploadedUrls } = useAppContext();
  
  const handleUpload = (newUrls) => {
    addUploadedUrls(newUrls); // Persists everywhere!
  };
}
```

## Performance Considerations

### Optimizations Built-In

1. **Minimal re-renders:** Context split by concern
2. **Efficient storage:** JSON serialization
3. **Debounced writes:** Automatic batching
4. **Selective updates:** Only changed data syncs

### Best Practices

1. **Don't store large files:** Use URLs instead
2. **Limit array sizes:** Keep last N items only
3. **Clean old data:** Provide clear buttons
4. **Monitor size:** Check localStorage usage

## Security Considerations

### Data Security

- ✅ **Local only:** Never sent to server automatically
- ✅ **Same origin:** Only accessible by your domain
- ✅ **User controlled:** User can clear anytime
- ⚠️ **Not encrypted:** Don't store sensitive data
- ⚠️ **Shared device:** Clear on shared computers

### Recommendations

1. **Don't store:** Passwords, tokens, API keys
2. **Do store:** URLs, preferences, non-sensitive data
3. **Clear after:** Sensitive analysis on shared devices
4. **Educate users:** About data persistence

---

**Your data is now safe across navigation! 🎉**

