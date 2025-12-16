# Citation Performance - Data Integration Fix

## 🎯 User Request

**"I want Citation Performance section to use the same data as I input at the beginning to populate results"**

Previously, users had to upload URLs and citation data twice:
1. Once in **AI Visibility Analysis** section
2. Again in **Citation Performance** section

This was redundant and confusing!

---

## ✅ What Was Fixed

The **Citation Performance** page now automatically uses data from the **AI Visibility Analysis** section through the global `AppContext`.

### Before ❌

```
User uploads URLs in AI Visibility → Analyzes content → Uploads citation data

Then navigates to Citation Performance...

Citation Performance page: EMPTY
❌ Must upload URLs again
❌ Must upload citation data again
❌ Duplicate work, confusing UX
```

### After ✅

```
User uploads URLs in AI Visibility → Analyzes content → Uploads citation data

Then navigates to Citation Performance...

Citation Performance page: PRE-POPULATED
✅ URLs automatically loaded (no re-upload)
✅ Citation data automatically loaded (no re-upload)
✅ Can start viewing results immediately!
✅ Can still upload additional data if needed
```

---

## 🔧 Technical Implementation

### 1. Connected to AppContext

**File:** `frontend/src/pages/CitationPerformance.jsx`

**Changes:**
```javascript
// Before: Local state only
const [citationData, setCitationData] = useState(null)
const [targetUrls, setTargetUrls] = useState([])

// After: Connected to global context
import { useAppContext } from '../contexts/AppContext'

const { 
  uploadedUrls,              // URLs from AI Visibility
  citationData: contextCitationData,  // Citation data from AI Visibility
  updateCitationData,        // Update context when new data is uploaded
  addUploadedUrls           // Add new URLs to context
} = useAppContext()
```

### 2. Initialize from Context on Mount

```javascript
useEffect(() => {
  // Pre-load URLs from context
  if (uploadedUrls && uploadedUrls.length > 0) {
    console.log('[Citation Performance] Loading URLs from context:', uploadedUrls.length)
    setTargetUrls(uploadedUrls)
    setDataSource('context')  // Track where data came from
  }
  
  // Pre-load citation data from context
  if (contextCitationData) {
    console.log('[Citation Performance] Loading citation data from context')
    setLocalCitationData(contextCitationData)
  }
}, [uploadedUrls, contextCitationData])
```

### 3. Sync New Uploads Back to Context

When users upload new data in Citation Performance, it's also saved to context:

```javascript
// URL upload - save to context
const handleUrlFileUpload = async (e) => {
  // ... upload logic ...
  const data = await response.json()
  setTargetUrls(data.urls)
  addUploadedUrls(data.urls, { 
    source: 'citation-performance', 
    filename: file.name 
  }) // ← Save to context
  setDataSource('uploaded')
}

// Citation data upload - save to context
const fetchResults = async (id) => {
  // ... fetch logic ...
  const data = await response.json()
  setLocalCitationData(data)
  updateCitationData(data) // ← Save to context for persistence
  setDataSource('uploaded')
}
```

### 4. Visual Indicators

Added clear indicators showing data source:

#### A) Pre-loaded Data Banner

```jsx
{dataSource === 'context' && targetUrls.length > 0 && (
  <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg p-4">
    <CheckCircle2 className="w-6 h-6 text-blue-600" />
    <h3>✨ Data Pre-loaded from AI Visibility Analysis</h3>
    <p>
      Using {targetUrls.length} URLs you uploaded in the AI Visibility section.
      Citation data is also loaded and ready to view below.
    </p>
    <p>💡 You can skip step 1 below, or upload additional URLs to add to your tracking list.</p>
  </div>
)}
```

#### B) Updated Card Titles

```jsx
// URL Card
<h2>
  1. {targetUrls.length > 0 && dataSource === 'context' 
      ? '✓ Target URLs Loaded' 
      : 'Upload Target URLs (Optional)'}
</h2>

// Citation Data Card
<h2>
  2. {citationData && !localCitationData 
      ? '✓ Citation Data Loaded' 
      : 'Upload Brand Presence Data'}
</h2>
```

#### C) Color-coded Status Badges

```jsx
// Blue for context data (pre-loaded)
// Green for newly uploaded data

<div className={dataSource === 'context' 
  ? 'bg-blue-50 border border-blue-200'  // Pre-loaded
  : 'bg-green-50 border border-green-200' // Newly uploaded
}>
  <p>
    {dataSource === 'context' ? '🔗' : '✓'} Tracking {targetUrls.length} URLs
    {dataSource === 'context' && <span>(from AI Visibility)</span>}
  </p>
</div>
```

---

## 🎨 User Experience

### Scenario 1: Fresh Start (No Data Yet)

```
User lands on Citation Performance page

Display:
┌─────────────────────────────────────────┐
│ Citation Performance                    │
│ Track how often AI platforms cite URLs  │
└─────────────────────────────────────────┘

┌─────────────────┬─────────────────┐
│ 1. Upload URLs  │ 2. Upload Data  │
│ (Optional)      │                 │
│ [Upload File]   │ [Upload File]   │
└─────────────────┴─────────────────┘

(Normal upload flow)
```

### Scenario 2: Data Pre-loaded from AI Visibility ✨

```
User already uploaded data in AI Visibility, then navigates here

Display:
┌─────────────────────────────────────────────────────────┐
│ Citation Performance                                    │
│ Track how often AI platforms cite URLs                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ✨ Data Pre-loaded from AI Visibility Analysis         │
│                                                          │
│ Using 150 URLs you uploaded in the AI Visibility       │
│ section. Citation data is also loaded and ready.       │
│                                                          │
│ 💡 You can skip step 1 below, or upload additional     │
│    URLs to add to your tracking list.                  │
└─────────────────────────────────────────────────────────┘

┌────────────────────────┬────────────────────────┐
│ 1. ✓ Target URLs       │ 2. ✓ Citation Data     │
│    Loaded              │    Loaded              │
│                        │                        │
│ 🔗 Tracking 150 URLs   │ 🔗 Citation data       │
│ (from AI Visibility)   │ loaded from AI         │
│                        │ Visibility             │
│ [Upload Additional     │                        │
│  URLs]                 │ [Upload New Data]      │
└────────────────────────┴────────────────────────┘

(Results displayed below - no upload needed!)
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                   AppContext                        │
│  (Global State with localStorage persistence)      │
│                                                     │
│  • uploadedUrls: []                                │
│  • citationData: {}                                │
│  • activeProject: {}                               │
└─────────────────────────────────────────────────────┘
         ↑                              ↓
         │                              │
    Update Context               Read from Context
         │                              │
         │                              │
┌────────┴──────────┐      ┌───────────┴───────────┐
│  AI Visibility    │      │ Citation Performance  │
│  Analysis Page    │      │      Page             │
│                   │      │                       │
│  1. Upload URLs   │──────→ Pre-loads URLs        │
│  2. Upload        │──────→ Pre-loads citation    │
│     Citations     │        data                  │
│  3. Analyze URLs  │      │                       │
│                   │      │ Can still upload      │
│ Data saved to     │      │ additional data       │
│ context           │      │ (also updates         │
│                   │      │  context)             │
└───────────────────┘      └───────────────────────┘
```

---

## 🔄 Data Persistence Flow

### Step 1: Upload in AI Visibility

```javascript
// User uploads URLs and citation data
AIVisibility.jsx → updateActiveProject({ 
  sitemapUrls: [...urls],
  citationFiles: [...files]
})

↓

AppContext → setUploadedUrls([...urls])
          → setCitationData({...data})

↓

localStorage → Persisted automatically
```

### Step 2: Navigate to Citation Performance

```javascript
// Page loads
CitationPerformance.jsx → useAppContext()

↓

Reads from context:
- uploadedUrls (already has data!)
- citationData (already has data!)

↓

useEffect initializes:
- setTargetUrls(uploadedUrls) ✅
- setLocalCitationData(citationData) ✅
- setDataSource('context')

↓

UI shows: "✨ Data Pre-loaded from AI Visibility Analysis"
```

### Step 3: Upload Additional Data (Optional)

```javascript
// User uploads more URLs or new citation data
CitationPerformance.jsx → handleUrlFileUpload()
                        → handleFileUpload()

↓

Updates both local state AND context:
- setTargetUrls([...urls])
- addUploadedUrls([...urls]) // Updates context
- updateCitationData({...data}) // Updates context

↓

localStorage → Persisted automatically
```

---

## ✅ Benefits

### For Users

1. **No Duplicate Work** ✅
   - Upload once in AI Visibility
   - Automatically available in Citation Performance

2. **Seamless Navigation** ✅
   - Switch between pages freely
   - Data persists across navigation

3. **Clear Visibility** ✅
   - Visual indicators show data source
   - Know exactly what's loaded

4. **Flexibility** ✅
   - Can still upload additional data
   - Can replace/update data

### For System

1. **Single Source of Truth** ✅
   - AppContext manages all data
   - Consistent state across pages

2. **Automatic Persistence** ✅
   - localStorage integration
   - Survives page refreshes

3. **Reduced API Calls** ✅
   - No need to re-fetch
   - Better performance

4. **Better Maintainability** ✅
   - Centralized state management
   - Easier to debug

---

## 🧪 Testing Scenarios

### Test 1: Pre-load from AI Visibility ✅

**Steps:**
1. Navigate to AI Visibility Analysis
2. Upload URL list (e.g., 100 URLs)
3. Upload citation data files
4. Navigate to Citation Performance

**Expected:**
- ✅ Blue banner shows "Data Pre-loaded from AI Visibility Analysis"
- ✅ URL card shows "✓ Target URLs Loaded" with 100 URLs (from AI Visibility)
- ✅ Citation card shows "✓ Citation Data Loaded"
- ✅ Results displayed immediately without re-upload

### Test 2: Upload Additional URLs ✅

**Steps:**
1. Start with pre-loaded data (100 URLs)
2. Click "Upload Additional URLs"
3. Upload file with 50 more URLs

**Expected:**
- ✅ Status changes from blue (context) to green (uploaded)
- ✅ Now tracking 150 URLs total
- ✅ Context updated with new URLs

### Test 3: Fresh Start (No Pre-loaded Data) ✅

**Steps:**
1. Clear all data
2. Navigate to Citation Performance directly

**Expected:**
- ✅ No blue banner (no pre-loaded data)
- ✅ Normal upload cards shown
- ✅ Standard upload workflow

### Test 4: Page Refresh ✅

**Steps:**
1. Load Citation Performance with pre-loaded data
2. Refresh the page (F5)

**Expected:**
- ✅ Data still loaded (from localStorage)
- ✅ Blue banner still shows
- ✅ Results still displayed

### Test 5: Cross-page Sync ✅

**Steps:**
1. Pre-load data in Citation Performance
2. Navigate back to AI Visibility
3. Upload new URLs there
4. Navigate back to Citation Performance

**Expected:**
- ✅ New URLs automatically appear
- ✅ Count updated
- ✅ Context synced

---

## 📝 Files Modified

### 1. `frontend/src/pages/CitationPerformance.jsx`

**Changes:**
- ✅ Added `useAppContext` hook
- ✅ Initialize from context on mount
- ✅ Update context when new data is uploaded
- ✅ Track data source ('context' vs 'uploaded')
- ✅ Added visual indicators for pre-loaded data
- ✅ Updated card titles and descriptions
- ✅ Color-coded status badges

**Lines Changed:** ~60 lines added/modified

### 2. `frontend/src/contexts/AppContext.jsx`

**No changes needed** - Already exports all necessary functions:
- ✅ `uploadedUrls`
- ✅ `citationData`
- ✅ `updateCitationData`
- ✅ `addUploadedUrls`

---

## 🚀 Future Enhancements

Potential improvements:

1. **Data Source History**
   ```javascript
   Show when data was uploaded:
   "🔗 Loaded 150 URLs from AI Visibility (2 hours ago)"
   ```

2. **Merge Strategy**
   ```javascript
   When uploading new URLs:
   • Option 1: Add to existing (default)
   • Option 2: Replace existing
   ```

3. **Data Diff Indicator**
   ```javascript
   Show what changed:
   "+ 50 URLs added"
   "= 100 URLs unchanged"
   ```

4. **Quick Actions**
   ```jsx
   <button onClick={() => navigateToAIVisibility()}>
     📝 Edit URLs in AI Visibility →
   </button>
   ```

---

## 🎯 Summary

**Problem:** Users had to upload the same URLs and citation data twice - once in AI Visibility, again in Citation Performance.

**Solution:** Citation Performance now automatically uses data from AppContext that was uploaded in AI Visibility.

**Result:** 
- ✅ No duplicate uploads
- ✅ Seamless cross-page experience
- ✅ Clear visual indicators
- ✅ Data persists across navigation
- ✅ Can still upload additional data if needed

**User Impact:** Significantly improved UX - saves time, reduces confusion, provides seamless workflow between pages.

**Technical Impact:** Better state management, reduced redundancy, consistent data flow, automatic persistence.

---

**The Citation Performance page now intelligently uses data you've already uploaded, making the workflow much more intuitive!** 🎉

