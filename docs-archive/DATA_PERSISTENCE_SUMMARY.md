# Data Persistence Summary

## Overview
This document explains how data is persisted across the AI Visibility Dashboard and when data is regenerated.

---

## ✅ **Data That PERSISTS Automatically**

### 1. **Content Analysis ("Analyze this URL")**
- **Location:** AI Visibility Analysis page
- **Saved to:** `data/results/{analysisJobId}.json`
- **Behavior:** 
  - ✅ Analyzed URL data persists forever
  - ✅ Scores, metrics, and prompts are saved
  - ✅ Loads instantly on page refresh
- **Regenerate:** Click "Analyze this URL" button again to re-analyze

### 2. **AI Insights/Recommendations (per URL)**
- **Location:** AI Visibility Analysis page (inside each URL row)
- **Saved to:** Same file as content analysis, merged into existing data
- **Behavior:**
  - ✅ AI-generated recommendations persist
  - ✅ Only regenerates if you click "Generate AI Insights Now" again
  - ✅ Shows timestamp of when insights were generated
- **Regenerate:** Click "Generate AI Insights Now" button with regenerate option

### 3. **Content Opportunities & Thematic Analysis** ⭐ NEW!
- **Location:** Trends & Insights page
- **Saved to:** `data/results/{projectId}-opportunities.json`
- **Behavior:**
  - ✅ **NOW PERSISTS!** (Previously regenerated every time)
  - ✅ Thematic analysis, prompt patterns, and AI recommendations are saved
  - ✅ Loads from cache instantly on subsequent visits
  - ✅ Shows "⚡ Cached" badge when loading from saved data
  - ✅ Shows generation timestamp
- **Regenerate:** Click "Regenerate" button in the header

### 4. **Citation Data (Brand Presence)**
- **Location:** AI Visibility Analysis page
- **Saved to:** `data/results/{citationJobId}-citations.json`
- **Behavior:**
  - ✅ Citation rates, platforms, and prompt data persist
  - ✅ Automatically loads in Citation Performance dashboard
  - ✅ Data survives server restarts
- **Regenerate:** Upload new Brand Presence files

### 5. **Project Metadata**
- **Location:** Projects page
- **Saved to:** `data/results/unified-{projectId}.json`
- **Behavior:**
  - ✅ Project settings, URLs, domain info persist
  - ✅ References to analysis and citation jobs
  - ✅ Project status and timestamps
- **Regenerate:** Create new project or update existing

---

## 🔄 **When Data Auto-Regenerates**

### Scenarios that trigger regeneration:

1. **New Brand Presence Upload**
   - Content Opportunities cache is invalidated
   - Thematic analysis will regenerate on next visit (or you can keep cached version)

2. **New Content Analysis**
   - Individual URL analysis jobs create new data
   - Dashboard cache refreshes to show new scores

3. **Explicit Regeneration Requested**
   - User clicks "Regenerate" button
   - User clicks "Generate AI Insights Now" with regenerate flag
   - User re-analyzes a URL

---

## 💾 **Data Storage Locations**

All data is stored in: `data/results/` directory

```
data/results/
├── unified-{projectId}.json          # Project metadata
├── {citationJobId}-citations.json    # Citation/Brand Presence data
├── {analysisJobId}.json               # Content analysis results
└── {projectId}-opportunities.json    # Content Opportunities (NEW!)
```

---

## 📊 **Cache Strategy**

### Short-term cache (in-memory):
- **Purpose:** Improve API response times
- **Duration:** While server is running
- **Cleared on:** Server restart, manual invalidation

### Long-term persistence (disk):
- **Purpose:** Survive server restarts, avoid re-running expensive operations
- **Duration:** Forever (until explicitly deleted or regenerated)
- **Location:** `data/results/` files

---

## 🎯 **User Experience Benefits**

### Before (What you reported):
❌ Content Opportunities regenerated every time (30-60 seconds wait)
❌ Lost data after browser refresh
❌ Expensive AI calls repeated unnecessarily

### After (Current implementation):
✅ Content Opportunities load instantly from cache (<1 second)
✅ Data persists across browser sessions and server restarts
✅ Manual "Regenerate" button when you want fresh data
✅ Clear visual indicators (badges, timestamps) showing data status

---

## 🔧 **Best Practices**

### When to Regenerate:

1. **Upload new Brand Presence data** → Regenerate Content Opportunities
2. **Analyze more URLs** → Regenerate AI Recommendations for validation
3. **Significant time has passed** → Regenerate to get fresh insights
4. **Data looks outdated** → Check timestamp, regenerate if needed

### When NOT to Regenerate:

1. **Just browsing/reviewing** → Use cached data
2. **No new data uploaded** → Cached data is still accurate
3. **Data is recent (< 1 day)** → Likely no need to regenerate

---

## 🚀 **Future Enhancements**

Potential improvements (not yet implemented):

- [ ] Auto-regenerate if data is >7 days old
- [ ] Show diff between cached and fresh data
- [ ] Batch regenerate all stale data with one click
- [ ] Export/import analysis results
- [ ] Version history for recommendations

---

## 📝 **Technical Notes**

### File Sizes (approximate):
- Content Analysis: 50-500 KB per URL
- Citation Data: 100-2000 KB depending on weeks/platforms
- Content Opportunities: 50-200 KB
- Project Metadata: 2-10 KB

### Performance:
- **Cached load:** <1 second
- **Fresh generation:** 15-60 seconds (depending on data size)
- **AI calls:** ~5-10 seconds per recommendation set

### Safety:
- All data is validated before saving
- Corrupted files are handled gracefully
- Failed saves don't break the app (data still returns to user)

---

**Last Updated:** December 2024
**Version:** 1.0

