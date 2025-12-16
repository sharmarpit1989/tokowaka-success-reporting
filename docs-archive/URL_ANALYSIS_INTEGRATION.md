# URL Analysis Integration - Trends & Insights Dashboard

## Overview

The Trends & Insights dashboard now integrates URL-level analysis data from the AI Visibility dashboard to provide more targeted and actionable content recommendations. This creates a seamless connection between LLM presence scores, citation data, and content optimization strategies.

## What Changed

### 1. **Enhanced Content Recommendation AI** (`backend/services/contentOpportunityAI.js`)

**New Capabilities:**
- Accepts URL analysis data with LLM presence metrics
- Analyzes aggregate LLM visibility scores across your website
- Identifies specific weak areas (freshness, answerability, authority, structure)
- Generates recommendations targeting specific URLs that need improvement
- Provides metric-focused recommendations based on actual page performance

**Key Features:**
- **URL-Specific Recommendations**: AI now recommends improving EXISTING low-performing pages before suggesting new content creation
- **Metric Awareness**: Recommendations target the weakest LLM visibility metrics (e.g., freshness < 60%, answerability < 60%)
- **Page Type Context**: Understands different page types (product, blog, documentation) and their typical performance
- **Concrete Action Items**: References specific URLs and their scores in recommendations

### 2. **Smarter Validation** (`backend/services/websiteStructureValidator.js`)

**Enhanced Structure Detection:**
- Uses actual LLM presence metrics instead of guessing
- Reads structure details from AI Visibility analysis (table count, list count, FAQ count)
- Detects what's missing based on metric scores
- Provides LLM visibility scores in validation messages

**New Validation Logic:**
- For recommendations targeting specific URLs:
  - Shows current LLM visibility score
  - Identifies which metrics need improvement
  - Suggests optimization vs. creation based on existing content
- For general recommendations:
  - Shows average LLM scores for existing pages with similar content
  - Better differentiates between "exists but poorly optimized" vs. "truly missing"

### 3. **Backend Route Integration** (`backend/routes/unified.js`)

**Workflow Update:**
```
OLD FLOW:
1. Load citation data
2. Analyze prompts
3. Generate AI recommendations
4. Validate against website structure

NEW FLOW:
1. Load citation data
2. Load dashboard with URL analysis ← NEW
3. Extract analyzed URLs with LLM metrics ← NEW
4. Analyze prompts
5. Generate AI recommendations WITH URL insights ← ENHANCED
6. Validate against website structure with metrics ← ENHANCED
```

**Data Flow:**
- Dashboard data is loaded earlier in the process
- URL analysis data is passed to AI recommendation generator
- Validation uses the same data for consistency

### 4. **Frontend Display** (`frontend/src/components/ContentOpportunities.jsx`)

**New UI Elements:**
- **Metric Focus Badge**: Shows which LLM metric the recommendation targets (e.g., "Focus: Freshness")
- **Target Pages Section**: Displays specific URLs that need improvement with direct links
- **LLM Score Display**: Shows current LLM visibility scores in validation messages

## How It Works

### Example Scenario 1: Low Freshness Pages

**Input Data:**
- URL: `example.com/product-guide`
- LLM Score: 45%
- Freshness Score: 25% ⚠️
- Structure Score: 75% ✅

**AI Recommendation Generated:**
```json
{
  "title": "Update Product Guide with Current Information",
  "theme": "Product Information",
  "description": "This page has low LLM visibility (45%) primarily due to outdated content (freshness: 25%). Users searching for current product information are not finding this page.",
  "metricFocus": "freshness",
  "targetUrls": ["example.com/product-guide"],
  "actions": [
    "Add publication date and 'Last Updated: [Current Date]' to the top",
    "Update all statistics and examples to 2025",
    "Add a 'Recent Updates' section showing changes in the last 6 months"
  ],
  "priority": "high",
  "potentialImpact": "Improve LLM visibility from 45% to 65-70%"
}
```

**Validation Result:**
```
⚠️ Target pages exist but have low LLM visibility (45%). Missing: updated dates and current information.
Found on: example.com/product-guide
```

### Example Scenario 2: Content Gap with Context

**Input Data:**
- Theme: "Pricing Comparisons"
- Citation Rate: 15% (low)
- Analyzed Pages: 45 URLs analyzed, none have comparison tables
- Average Structure Score: 55%

**AI Recommendation Generated:**
```json
{
  "title": "Create Comprehensive Pricing Comparison Page",
  "theme": "Pricing Comparisons",
  "description": "Your site receives 127 prompts about pricing comparisons but only gets cited 15% of the time. Analysis of 45 pages shows no comparison tables exist, limiting LLM citation potential.",
  "metricFocus": "structure",
  "targetUrls": [],
  "contentStructure": {
    "tables": 2,
    "lists": 3,
    "faqs": 8
  },
  "actions": [
    "Create a dedicated pricing comparison page with 2 detailed tables",
    "Add feature-by-feature comparison with checkmarks",
    "Include FAQ section addressing 'Which plan is best for...' questions"
  ],
  "priority": "high",
  "potentialImpact": "+32 citations/week"
}
```

**Validation Result:**
```
❌ Content gap detected. Not found on any of your 45 analyzed pages. Create new content: 2 comparison tables, 3 structured lists, FAQ section with 8 questions.
```

## Benefits

### 1. **Data-Driven Recommendations**
- No more generic "add FAQ section" advice
- Recommendations based on actual page performance metrics
- Prioritizes pages with lowest LLM visibility scores

### 2. **Actionable Insights**
- Tells you WHICH pages to fix, not just WHAT to add
- Provides current scores and target improvements
- Links directly to pages that need work

### 3. **Efficient Content Strategy**
- Fix existing underperforming pages before creating new ones
- Focus on weakest metrics first (biggest impact)
- Understand which page types perform best on your site

### 4. **Transparent Validation**
- Shows LLM scores in validation messages
- Explains why content "exists but needs optimization"
- Provides clear action types: optimize, expand, or create

## API Response Structure

### Enhanced Recommendation Object
```json
{
  "title": "Improve Answerability on Product FAQs",
  "theme": "Product Questions",
  "description": "...",
  "contentStructure": {
    "faqs": 10,
    "examples": 3
  },
  "actions": ["...", "..."],
  "funnelInsight": "...",
  "potentialImpact": "...",
  "priority": "high",
  
  // ✨ NEW FIELDS
  "targetUrls": ["url1", "url2"], // Specific pages to improve (empty = create new)
  "metricFocus": "answerability",  // Which LLM metric this targets
  
  // Validation adds:
  "validation": {
    "status": "partial",
    "existingUrls": ["url1", "url2"],
    "message": "⚠️ Target pages exist but have low LLM visibility (52%)...",
    "actionType": "expand",
    "llmScore": 0.52  // ✨ NEW: Average LLM score
  }
}
```

## Configuration

No additional configuration required! The integration automatically works when:

1. ✅ AI Visibility analysis has been run on URLs
2. ✅ Brand presence (citation) data has been uploaded
3. ✅ Trends & Insights is accessed with an active project

The system gracefully falls back to standard recommendations if URL analysis data is not available.

## Testing Checklist

- [x] ContentOpportunityAI accepts URL analysis data
- [x] buildPrompt includes LLM metrics and scores
- [x] Backend route passes dashboard data to AI generator
- [x] Validation uses detailed URL metrics
- [x] Frontend displays target URLs and metric focus
- [x] No linter errors in modified files
- [ ] End-to-end test with real project data

## Future Enhancements

1. **Trend Analysis**: Track how LLM scores change after implementing recommendations
2. **Before/After Comparison**: Show score improvements after content updates
3. **Auto-Prioritization**: Automatically sort recommendations by potential impact × effort
4. **Metric Drill-Down**: Click on a metric focus to see detailed breakdown
5. **Bulk Actions**: Select multiple recommendations and export to task list

## Files Modified

### Backend
- `backend/services/contentOpportunityAI.js` - Enhanced AI prompt with URL analysis
- `backend/services/websiteStructureValidator.js` - Improved structure detection with metrics
- `backend/routes/unified.js` - Pass URL analysis to recommendation generator

### Frontend
- `frontend/src/components/ContentOpportunities.jsx` - Display target URLs and metric focus

### Documentation
- `docs-archive/URL_ANALYSIS_INTEGRATION.md` - This file

## Summary

The Trends & Insights dashboard is now **significantly more powerful** by leveraging URL analysis data from the AI Visibility dashboard. Instead of generic recommendations, it provides **specific, data-driven actions** targeting **actual underperforming pages** with **measurable improvement goals**.

This creates a unified workflow:
1. **AI Visibility Dashboard**: Analyze URLs, get LLM presence scores
2. **Trends & Insights Dashboard**: Get recommendations targeting lowest-scoring pages
3. **Implementation**: Fix identified issues on specific URLs
4. **Re-analyze**: Measure improvement in LLM visibility scores

The integration ensures recommendations are always relevant to your actual website content and performance, maximizing the impact of content optimization efforts.

