# Fix: Support Multiple Content Analysis Job IDs

## Problem

When users analyze URLs individually (one at a time), each URL gets its own job ID. The project stores these as `contentAnalysisJobIds` (plural array). However, `unifiedAnalyzer.js` was only checking for `contentAnalysisJobId` (singular), causing it to miss individually analyzed URLs.

**Symptoms:**
- Trends & Insights shows "Validated (1 pages)" even after analyzing multiple URLs
- Only the first analyzed URL is counted
- Recommendations don't include all analyzed URLs

## Root Cause

In `unifiedAnalyzer.js`:
```javascript
// OLD CODE (buggy):
if (project.contentAnalysisJobId) {
  const analysisPath = path.join(RESULTS_DIR, `${project.contentAnalysisJobId}.json`);
  contentAnalysis = await fs.readJson(analysisPath);
}
```

This only loaded ONE job file, even if multiple URLs were analyzed individually.

## Solution

Updated `unifiedAnalyzer.js` to:
1. Check for BOTH `contentAnalysisJobIds` (array) AND `contentAnalysisJobId` (single)
2. Load ALL job files and merge their results
3. Cache each job file separately for performance
4. Support invalidating multiple job caches

### Changes Made

#### 1. `backend/services/unifiedAnalyzer.js`

**Load Multiple Job Files:**
```javascript
// Support both old single job ID and new multiple job IDs
const jobIdsToSearch = project.contentAnalysisJobIds || 
                       (project.contentAnalysisJobId ? [project.contentAnalysisJobId] : []);

// Load and merge results from all jobs
const allResults = [];
for (const jobId of jobIdsToSearch) {
  const jobAnalysis = await loadJobAnalysis(jobId);
  if (jobAnalysis && jobAnalysis.results) {
    allResults.push(...jobAnalysis.results);
  }
}

contentAnalysis = {
  results: allResults,
  jobIds: jobIdsToSearch,
  merged: true
};
```

**Invalidate Multiple Caches:**
```javascript
function invalidateCaches(projectId, contentAnalysisJobId) {
  // Support both single job ID and array of job IDs
  const jobIds = Array.isArray(contentAnalysisJobId) 
    ? contentAnalysisJobId 
    : (contentAnalysisJobId ? [contentAnalysisJobId] : []);
  
  jobIds.forEach(jobId => {
    if (contentAnalysisCache.has(jobId)) {
      contentAnalysisCache.delete(jobId);
    }
  });
}
```

#### 2. `backend/services/insightsGenerator.js`

**Pass All Job IDs for Cache Invalidation:**
```javascript
// Pass all job IDs when invalidating caches
const jobIdsToInvalidate = project.contentAnalysisJobIds || 
                          (project.contentAnalysisJobId ? [project.contentAnalysisJobId] : []);
invalidateCaches(projectId, jobIdsToInvalidate);
```

## Testing

### Before Fix:
```
Project has:
- contentAnalysisJobIds: ["job-1", "job-2", "job-3"]

Unified Analyzer loads:
- Only checks contentAnalysisJobId (undefined)
- Loads 0 results

Trends & Insights shows:
- Validated (0 pages) ❌
```

### After Fix:
```
Project has:
- contentAnalysisJobIds: ["job-1", "job-2", "job-3"]

Unified Analyzer loads:
- Checks contentAnalysisJobIds array
- Loads job-1.json, job-2.json, job-3.json
- Merges all results

Trends & Insights shows:
- Validated (3 pages) ✅
```

## Impact

### User Experience:
- ✅ All individually analyzed URLs now count in validation
- ✅ Recommendations consider ALL analyzed pages
- ✅ Accurate URL analysis counts in Trends & Insights
- ✅ Target URLs include all low-performing analyzed pages

### Performance:
- ✅ Each job file is cached independently
- ✅ Subsequent loads use cache (no disk reads)
- ✅ Cache invalidation works for all job IDs

### Backward Compatibility:
- ✅ Still supports old projects with single `contentAnalysisJobId`
- ✅ Works with bulk analysis (single job) AND individual analysis (multiple jobs)
- ✅ No migration needed for existing projects

## Files Modified

- `backend/services/unifiedAnalyzer.js` - Load multiple job files
- `backend/services/insightsGenerator.js` - Invalidate multiple caches

## Deployment

No restart required - **nodemon** will auto-reload the changes.

After deployment:
1. Navigate to Trends & Insights
2. Click "Regenerate" button
3. Should now show correct count: "Validated (X pages)" where X = number of analyzed URLs

## Related Issues

This fix also resolves:
- Recommendations not using all analyzed URL data
- Content structure validation only checking 1 page
- LLM metric aggregation missing URLs

