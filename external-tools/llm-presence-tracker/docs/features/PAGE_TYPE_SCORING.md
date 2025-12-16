# Page Type-Specific Scoring

## Overview

The LLM Presence Tracker now uses **intelligent, page-type-specific scoring weights** instead of one-size-fits-all scoring. Different types of pages are optimized for different purposes, so the scoring system adapts accordingly.

## The Problem We're Solving

**Before:** All pages scored the same way
- Blog post with old date → Low freshness score → Lower overall score ❌
- Online tool with no date → Low freshness score → Lower overall score ❌
- Both penalized equally, even though tools don't need freshness!

**After:** Scoring adapts to page type
- Blog post with old date → Freshness critical (35% weight) → Properly penalized ✅
- Online tool with no date → Freshness less important (10% weight) → Not penalized ✅
- Each page type scored according to its purpose!

## Scoring Weights by Page Type

### 📊 Weight Comparison Table

| Page Type | Fresh | Answer | Query | Snippet | Auth | Struct | Priority |
|-----------|-------|--------|-------|---------|------|--------|----------|
| **Default** | 20% | 25% | 15% | 15% | 15% | 10% | Balanced |
| **Online Tool** | 10%↓ | 30%↑ | 20%↑ | 20%↑ | 10%↓ | 10% | Instructions |
| **Blog Post** | 35%↑↑ | 20% | 20%↑ | 15% | 5%↓ | 5%↓ | Freshness |
| **Tutorial/Guide** | 15%↓ | 35%↑↑ | 20%↑ | 10% | 10%↓ | 10% | Steps |
| **Documentation** | 10%↓ | 30%↑ | 15% | 15% | 15% | 15%↑ | Structure |
| **FAQ Page** | 10%↓ | 40%↑↑ | 25%↑↑ | 15% | 5%↓ | 5%↓ | Q&A |
| **Product Page** | 20% | 20% | 15% | 25%↑ | 15% | 5%↓ | Snippet |
| **Pricing Page** | 30%↑ | 20% | 15% | 20%↑ | 10% | 5%↓ | Current $$ |
| **Homepage** | 15% | 20% | 15% | 25%↑ | 20%↑ | 5%↓ | Authority |
| **Event/Webinar** | 40%↑↑ | 20% | 15% | 15% | 5%↓ | 5%↓ | Dates |

Legend:
- ↑↑ = Much higher weight (critical)
- ↑ = Higher weight (important)
- = Standard weight
- ↓ = Lower weight (less important)

### Detailed Breakdown

#### 🛠️ Online Tool (e.g., Adobe PDF to Word)

```javascript
weights: {
  freshness: 10%,        // ↓ Tools are evergreen
  answerability: 30%,    // ↑ Step-by-step critical
  queryAlignment: 20%,   // ↑ "how to convert" queries
  snippetQuality: 20%,   // ↑ Good first paragraph crucial
  authority: 10%,        // ↓ Less important for free tools
  structure: 10%         // = Standard
}
```

**Why:** Tools like "PDF to Word converter" don't need recent dates. What matters is:
1. Clear instructions (answerability)
2. Matching "how to" queries (query alignment)
3. Good first paragraph explaining the tool (snippet quality)

**Adobe Example:** Your 9 PDF/image conversion tools will score **higher** because:
- They have step-by-step instructions ✅
- They match "how to convert..." queries ✅
- First paragraph explains the tool clearly ✅
- Dates don't matter for converters ✅

#### 📝 Blog Post

```javascript
weights: {
  freshness: 35%,        // ↑↑ Recency critical
  answerability: 20%,    // = Answer questions
  queryAlignment: 20%,   // ↑ Natural language
  snippetQuality: 15%,   // ↑ Featured snippets
  authority: 5%,         // ↓ Content > author
  structure: 5%          // ↓ Flexible format
}
```

**Why:** Blog posts live or die by freshness. A 2023 blog post about "AI trends" is less valuable than a 2025 post.

#### 📖 Tutorial/Guide

```javascript
weights: {
  freshness: 15%,        // ↓ Evergreen tutorials okay
  answerability: 35%,    // ↑↑ Step-by-step essential
  queryAlignment: 20%,   // ↑ "how to" queries
  snippetQuality: 10%,   // = Standard
  authority: 10%,        // ↓ Instructions > credentials
  structure: 10%         // = Clear organization
}
```

**Why:** A good tutorial from 2023 is still valuable if the process hasn't changed. Clear steps matter most.

#### 📚 Documentation

```javascript
weights: {
  freshness: 10%,        // ↓ Stable API docs okay
  answerability: 30%,    // ↑ Technical answers
  queryAlignment: 15%,   // = Technical queries
  snippetQuality: 15%,   // = Clear definitions
  authority: 15%,        // ↑ Official docs matter
  structure: 15%         // ↑ Organization critical
}
```

**Why:** Documentation needs clear structure and authoritative answers. Date matters less than organization.

#### ❓ FAQ Page

```javascript
weights: {
  freshness: 10%,        // ↓ FAQs are stable
  answerability: 40%,    // ↑↑ Q&A format essential
  queryAlignment: 25%,   // ↑↑ Natural questions
  snippetQuality: 15%,   // ↑ Each Q&A is snippet
  authority: 5%,         // ↓ Less critical
  structure: 5%          // ↓ Simple format
}
```

**Why:** FAQ pages are **all about** answering questions in natural language. Perfect for LLM extraction!

#### 🎯 Product Page

```javascript
weights: {
  freshness: 20%,        // ↑ Feature updates
  answerability: 20%,    // = "what is" questions
  queryAlignment: 15%,   // = Product queries
  snippetQuality: 25%,   // ↑ First impression
  authority: 15%,        // ↑ Brand trust
  structure: 5%          // ↓ Content > structure
}
```

**Why:** Product pages need strong snippets for brand queries and authority for trust.

#### 💰 Pricing Page

```javascript
weights: {
  freshness: 30%,        // ↑↑ Prices change
  answerability: 20%,    // ↑ "how much" questions
  queryAlignment: 15%,   // = "pricing" queries
  snippetQuality: 20%,   // ↑ Clear pricing in snippet
  authority: 10%,        // = Trust in pricing
  structure: 5%          // ↓ Simple table
}
```

**Why:** Pricing must be current! Old prices are worse than no prices.

#### 📅 Event/Webinar Page

```javascript
weights: {
  freshness: 40%,        // ↑↑ Event dates critical
  answerability: 20%,    // = What/when/where
  queryAlignment: 15%,   // = Event queries
  snippetQuality: 15%,   // = Event details
  authority: 5%,         // ↓ Less critical
  structure: 5%          // ↓ Less critical
}
```

**Why:** Past events are useless! Freshness is **everything** for event pages.

## Real-World Impact

### Example 1: Adobe PDF to Word (Online Tool)

**Scores:**
- Freshness: 45/100 (no recent date)
- Answerability: 85/100 (great steps)
- Query Alignment: 90/100 (matches "how to")
- Snippet Quality: 88/100 (clear intro)
- Authority: 90/100 (adobe.com)
- Structure: 75/100 (good org)

**With Default Weights (20/25/15/15/15/10):**
```
Score = (45×0.20) + (85×0.25) + (90×0.15) + (88×0.15) + (90×0.15) + (75×0.10)
      = 9.0 + 21.25 + 13.5 + 13.2 + 13.5 + 7.5
      = 77.95 = 78%
```

**With Online Tool Weights (10/30/20/20/10/10):**
```
Score = (45×0.10) + (85×0.30) + (90×0.20) + (88×0.20) + (90×0.10) + (75×0.10)
      = 4.5 + 25.5 + 18.0 + 17.6 + 9.0 + 7.5
      = 82.1 = 82%
```

**Improvement: +4% (78% → 82%)** ✅

**Why:** Freshness matters less for tools. Strong answerability and query alignment rewarded more!

### Example 2: Adobe Blog Post (Blog Post)

**Scores:**
- Freshness: 95/100 (published 2025)
- Answerability: 70/100 (some answers)
- Query Alignment: 80/100 (good queries)
- Snippet Quality: 75/100 (decent intro)
- Authority: 80/100 (adobe.com)
- Structure: 60/100 (blog format)

**With Default Weights:**
```
Score = (95×0.20) + (70×0.25) + (80×0.15) + (75×0.15) + (80×0.15) + (60×0.10)
      = 19.0 + 17.5 + 12.0 + 11.25 + 12.0 + 6.0
      = 77.75 = 78%
```

**With Blog Post Weights (35/20/20/15/5/5):**
```
Score = (95×0.35) + (70×0.20) + (80×0.20) + (75×0.15) + (80×0.05) + (60×0.05)
      = 33.25 + 14.0 + 16.0 + 11.25 + 4.0 + 3.0
      = 81.5 = 82%
```

**Improvement: +4% (78% → 82%)** ✅

**Why:** Fresh content rewarded heavily for blogs!

### Example 3: Old Tutorial (Tutorial/Guide)

**Scores:**
- Freshness: 35/100 (2022 tutorial)
- Answerability: 95/100 (excellent steps)
- Query Alignment: 90/100 (matches queries)
- Snippet Quality: 70/100 (okay intro)
- Authority: 85/100 (adobe.com)
- Structure: 80/100 (well organized)

**With Default Weights:**
```
Score = (35×0.20) + (95×0.25) + (90×0.15) + (70×0.15) + (85×0.15) + (80×0.10)
      = 7.0 + 23.75 + 13.5 + 10.5 + 12.75 + 8.0
      = 75.5 = 76%
```

**With Tutorial Weights (15/35/20/10/10/10):**
```
Score = (35×0.15) + (95×0.35) + (90×0.20) + (70×0.10) + (85×0.10) + (80×0.10)
      = 5.25 + 33.25 + 18.0 + 7.0 + 8.5 + 8.0
      = 80.0 = 80%
```

**Improvement: +4% (76% → 80%)** ✅

**Why:** Evergreen tutorials don't need freshness. Excellent instructions rewarded!

## CSV Output

Your CSV now includes the delta vs default scoring:

```csv
URL,Page_Type,LLM_Presence_Score,Score_vs_Default,Score_Rating
adobe.com/acrobat/online/pdf-to-word,Online Tool,82.1,+4.1%,Excellent
adobe.com/blog/2025-trends,Blog Post,81.5,+3.8%,Excellent
adobe.com/tutorials/photoshop-basics,Tutorial/Guide,80.0,+4.5%,Excellent
```

## JSON Output

Detailed scoring breakdown in JSON:

```json
{
  "url": "https://adobe.com/acrobat/online/pdf-to-word",
  "pageType": {
    "primary": "Online Tool"
  },
  "llm_presence_score": 0.821,
  "scoring": {
    "weights": {
      "freshness": 0.10,
      "answerability": 0.30,
      "queryAlignment": 0.20,
      "snippetQuality": 0.20,
      "authority": 0.10,
      "structure": 0.10
    },
    "breakdown": {
      "freshness": 4.5,
      "answerability": 25.5,
      "queryAlignment": 18.0,
      "snippetQuality": 17.6,
      "authority": 9.0,
      "structure": 7.5
    },
    "reasoning": "Tools need clear instructions and good snippets for 'how to' queries",
    "comparison": {
      "defaultScore": 0.7795,
      "specificScore": 0.821,
      "delta": 0.0415,
      "deltaPercent": "+4.1%",
      "improvement": "Better with specific weights"
    }
  }
}
```

## Console Output

```bash
2025-11-25T21:30:05.000Z - INFO - Page type: Online Tool (high confidence)
2025-11-25T21:30:10.000Z - INFO - Score: 82.1% (+4.1% vs default scoring)
2025-11-25T21:30:10.000Z - INFO - ✅ https://adobe.com/acrobat/online/pdf-to-word - Score: 82% (Excellent)
```

## Benefits for Your Adobe URLs

### Your 9 Online Tool URLs

**Before (default scoring):** Penalized for lack of dates
**After (tool-specific):** Rewarded for clear instructions ✅

**Expected improvement:** +3-5% on average

### Strategy Implications

1. **Tools don't need dates** - Focus on step-by-step clarity
2. **Blog posts need freshness** - Keep them updated or they drop
3. **Tutorials are evergreen** - Great content from 2022 is still valuable
4. **Pricing needs currency** - Update prices regularly

## Disabling Page-Type-Specific Scoring

If you want to use default scoring for all pages:

```javascript
// In analyzers/scoring-weights.js
// Comment out the PAGE_TYPE_WEIGHTS object
// All pages will use DEFAULT_WEIGHTS
```

## Adding Custom Weights

To customize weights for specific page types:

```javascript
// In analyzers/scoring-weights.js

CUSTOM_PAGE_TYPE: {
  freshness: 0.25,
  answerability: 0.30,
  queryAlignment: 0.15,
  snippetQuality: 0.15,
  authority: 0.10,
  structure: 0.05,
  reasoning: "Your reasoning here"
}
```

**Requirements:**
- All weights must sum to 1.0
- Each weight between 0.0 and 1.0
- Include reasoning string

## Validation

The system validates weights automatically:

```javascript
if (sum !== 1.0) {
  console.warn(`Warning: Weights sum to ${sum}, not 1.0`);
}
```

## Future Enhancements

Planned improvements:

- [ ] User-customizable weights via config file
- [ ] A/B testing different weight configurations
- [ ] Machine learning to optimize weights based on actual LLM citations
- [ ] Seasonal adjustments (e.g., event pages in December)

---

**Last Updated:** November 2025  
**Version:** 1.3.0 (added page-type-specific scoring)

