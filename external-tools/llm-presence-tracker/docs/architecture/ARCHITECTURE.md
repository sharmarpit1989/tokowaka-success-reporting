# Architecture & Code Reuse

This document explains how the LLM Presence Tracker reuses functionality from the parent Tokowaka utilities project.

## Reused Components

### 1. Core Utilities (`../utils/utils.js`)

**Functions Used:**
- `stripTagsToText(htmlContent)` - HTML to clean text conversion
- `extractWordCount(htmlContent)` - Word counting
- `tokenize(text, mode)` - Text tokenization
- `hashDJB2(str)` - Content hashing
- `pct(number)` - Percentage formatting
- `setCheerio(cheerio)` - Cheerio initialization

**Why Reused:**
These are battle-tested utilities already used across the project. No need to rewrite text processing logic.

### 2. Browser Automation Pattern (`../main.js`)

**Pattern Reused:**
```javascript
// From parent main.js
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch({
  headless: true,
  executablePath: getChromeExecutablePath()
});
```

**Our Implementation:**
```javascript
// In llm-presence-tracker/main.js
// Same pattern, adapted for LLM analysis
const browser = await puppeteer.launch({
  headless: true,
  executablePath: getChromeExecutablePath()
});
```

**Why Reused:**
- Consistent Chrome detection across OS platforms
- Proven concurrency control pattern
- Error handling approach

### 3. Azure OpenAI Integration Pattern (`../main.js`)

**Pattern Reused:**
```javascript
// From parent: compareTextWithLLM()
const response = await fetch(
  `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_COMPLETION_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_OPENAI_KEY
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3
    })
  }
);
```

**Our Implementation:**
```javascript
// In llm-presence-tracker/main.js
// Same pattern, different prompt
async function getAIInsights(url, llmPresenceData, textContent) {
  // ... prompt construction
  const response = await fetch(/* same pattern */);
}
```

**Why Reused:**
- Consistent Azure OpenAI configuration
- Same API version and deployment
- Proven error handling

### 4. CSV Processing Pattern (`../main.js`)

**Pattern Reused:**
```javascript
// From parent: processSingleCsvMode()
const content = await fs.readFile(csvPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim());
const hasHeader = lines[0].toLowerCase().includes('url');
// ... preserve original columns
```

**Our Implementation:**
```javascript
// In llm-presence-tracker/main.js
// Same pattern for CSV reading and column preservation
const content = await fs.readFile(csvPath, 'utf8');
const columnNames = headerRow ? headerRow.split(',').map(c => c.trim()) : ['URL'];
// ... generate CSV with original + new columns
```

**Why Reused:**
- Maintains original CSV column order
- Handles CSV with/without headers
- Proven CSV escaping logic

### 5. Logger Pattern (`../main.js`)

**Pattern Reused:**
```javascript
const logger = {
  info: (message) => console.log(`${new Date().toISOString()} - INFO - ${message}`),
  error: (message) => console.error(`${new Date().toISOString()} - ERROR - ${message}`),
  warning: (message) => console.warn(`${new Date().toISOString()} - WARNING - ${message}`)
};
```

**Why Reused:**
- Consistent logging format across project
- Timestamp precision
- Log level distinction

## New Components (Not Reused)

### 1. Analyzer Modules (`analyzers/`)

These are **new and specific** to LLM presence tracking:

- `freshness-analyzer.js` - Content recency analysis
- `answerability-analyzer.js` - Question-answer detection
- `query-alignment-analyzer.js` - Search query matching
- `snippet-optimizer.js` - Snippet quality analysis
- `index.js` - Orchestration

**Why New:**
These implement novel analysis algorithms not present in parent project.

### 2. Scoring System

**New weighted scoring:**
```javascript
const weights = {
  freshness: 0.20,
  answerability: 0.25,
  queryAlignment: 0.15,
  snippetQuality: 0.15,
  authority: 0.15,
  structure: 0.10
};
```

**Why New:**
This is domain-specific to LLM discoverability, not general-purpose analysis.

### 3. Recommendation Engine

**New pattern:**
```javascript
function generateFreshnessRecommendations(metrics) {
  const recommendations = [];
  if (!metrics.hasCurrentYear) {
    recommendations.push('Add current year mentions...');
  }
  return recommendations;
}
```

**Why New:**
Actionable recommendations specific to LLM optimization.

## Dependency Management

### Shared Dependencies (from parent)

All dependencies are inherited from parent `package.json`:
- `puppeteer` - Browser automation
- `cheerio` - HTML parsing
- `fs-extra` - File system utilities

### No Separate Installation

```bash
# Users only need to run once in parent directory
cd ..
npm install

# Then can use llm-presence-tracker immediately
cd llm-presence-tracker
node main.js
```

## File Structure

```
tokowaka-utilities/
├── utils/
│   └── utils.js                    # ✅ REUSED - Core utilities
├── main.js                         # ✅ REUSED - Patterns only
├── package.json                    # ✅ REUSED - Dependencies
└── llm-presence-tracker/           # ⭐ NEW MODULE
    ├── main.js                     # New - Orchestration
    ├── analyzers/                  # New - Analysis logic
    │   ├── freshness-analyzer.js
    │   ├── answerability-analyzer.js
    │   ├── query-alignment-analyzer.js
    │   ├── snippet-optimizer.js
    │   └── index.js
    ├── README.md                   # New - Documentation
    ├── QUICKSTART.md               # New - Tutorial
    ├── package.json                # New - Metadata only
    └── sample-urls.csv             # New - Example data
```

## Benefits of This Architecture

### 1. Code Reuse
- **~500 lines** of utility code reused
- **Zero duplication** of text processing logic
- **Consistent** behavior across tools

### 2. Maintainability
- Bug fixes in `utils/utils.js` benefit all tools
- Updates to Azure OpenAI pattern propagate naturally
- Single source of truth for core functionality

### 3. Developer Experience
- Familiar patterns for anyone who knows parent project
- Single `npm install` for all utilities
- Easy to extend with new analyzers

### 4. Modularity
- Analyzers are independent and testable
- Can be used standalone or combined
- Easy to add new analysis dimensions

## Extending the Tool

### Adding a New Analyzer

1. Create new file in `analyzers/`:

```javascript
// analyzers/my-new-analyzer.js
function analyzeMyMetric($, text) {
  // Your analysis logic
  return {
    score: 0.85,
    // ... other metrics
  };
}

module.exports = { analyzeMyMetric };
```

2. Import in `analyzers/index.js`:

```javascript
const { analyzeMyMetric } = require('./my-new-analyzer.js');

function analyzeLLMPresence($, htmlContent, textContent, title) {
  // ... existing analyzers
  const myMetric = analyzeMyMetric($, textContent);
  
  return {
    // ... existing metrics
    myMetric
  };
}
```

3. Update scoring weights in `analyzers/index.js`

4. Add columns to CSV generation in `main.js`

### Using Analyzer Standalone

Each analyzer can be used independently:

```javascript
const cheerio = require('cheerio');
const { analyzeFreshness } = require('./analyzers/freshness-analyzer.js');

const html = '<html>...</html>';
const $ = cheerio.load(html);
const text = $('body').text();

const freshnessAnalysis = analyzeFreshness($, text);
console.log(freshnessAnalysis.score);
```

## Performance Considerations

### Reused Optimizations

From parent project:
- **Concurrency control** (5 parallel requests)
- **Page reuse** (close pages after analysis)
- **Efficient tokenization** (from utils)

### New Optimizations

- **Batch processing** of URLs
- **Streaming CSV output** (for large datasets)
- **Cached scoring calculations**

## Future Enhancements

### Could Be Added from Parent

- Progress tracking (from `multi-csv-processor.js`)
- Multiple CSV file support (from `MultiCsvHandler`)
- Resume capability (from progress tracking)

### New Features to Build

- Historical trend tracking
- Competitive benchmarking
- A/B testing support
- API endpoint for real-time analysis

## Summary

This tool demonstrates **effective code reuse** while maintaining **clear separation of concerns**:

- ✅ Reuses proven utilities (text processing, browser automation)
- ✅ Implements domain-specific logic (LLM analysis)
- ✅ Maintains consistency with parent project patterns
- ✅ Enables independent evolution

The architecture balances **DRY principles** with **modularity**, making it easy to maintain and extend.

