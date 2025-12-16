# Google Search Console & Ahrefs Integration Guide

## 📍 Where the Data Goes

**Answer:** In your **INPUT CSV file**, in these specific columns:

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
                     ↑                    ↑
                     │                    │
              GSC/Ahrefs data      Your classification
```

---

## 📊 Step-by-Step: Google Search Console

### Step 1: Export Search Queries from GSC

1. **Go to Google Search Console**
   - https://search.google.com/search-console

2. **Navigate to Performance Report**
   - Click "Performance" in left sidebar

3. **Filter by Specific Page**
   - Click "+ NEW" button
   - Select "Page"
   - Enter your exact URL (e.g., `https://example.com/tool`)
   - Click "Apply"

4. **View Queries**
   - Click "QUERIES" tab at top
   - You'll see all search queries that drove traffic to this page

5. **Export Data**
   - Click "Export" button (top right)
   - Choose "Download CSV" or "Google Sheets"
   - Save the file

6. **Select Top Queries**
   - Open the exported file
   - Sort by "Clicks" (descending)
   - Copy the top 5-10 queries

### Step 2: Add to Your CSV

**Format for CSV:**
```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool,100000,,"query1; query2; query3; query4; query5",transactional
```

**Important:**
- Separate queries with **semicolon + space** (`;`)
- Put the entire list in quotes if it contains commas
- Order by traffic/clicks (highest first)

**Example from GSC Export:**

GSC shows:
```
Query                                    Clicks
pdf to word converter free               15,234
convert pdf to word online               8,521
pdf to docx converter                    5,432
how to convert pdf to word               3,210
free pdf converter                       2,109
```

Your CSV becomes:
```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/pdf-to-word,100000,,"pdf to word converter free; convert pdf to word online; pdf to docx converter; how to convert pdf to word; free pdf converter",transactional
```

---

## 📊 Step-by-Step: Ahrefs

### Step 1: Export Organic Keywords from Ahrefs

1. **Go to Ahrefs Site Explorer**
   - https://ahrefs.com/site-explorer

2. **Enter Your Page URL**
   - Paste the specific page URL (not domain)
   - Click search

3. **Navigate to Organic Keywords**
   - Click "Organic keywords" in left sidebar
   - You'll see all keywords this page ranks for

4. **Filter & Sort**
   - Sort by "Traffic" or "Volume" (descending)
   - Optionally filter by:
     - Position (1-10 for top rankings)
     - Volume (>100 searches/month)
     - KD (Keyword Difficulty)

5. **Export**
   - Click "Export" button
   - Choose CSV format
   - Save the file

6. **Select Top Keywords**
   - Open exported CSV
   - Copy top 5-10 keywords by traffic/volume

### Step 2: Add to Your CSV

**Format (same as GSC):**
```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool,50000,,"keyword1; keyword2; keyword3",transactional
```

**Example from Ahrefs Export:**

Ahrefs shows:
```
Keyword                          Volume    Traffic
qr code generator free           22,100    8,500
create qr code online            14,800    5,200
how to make qr code              9,900     3,100
qr code maker                    8,100     2,400
free qr code generator           5,400     1,800
```

Your CSV becomes:
```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/qr-generator,50000,,"qr code generator free; create qr code online; how to make qr code; qr code maker; free qr code generator",transactional
```

---

## 🎯 User Intent Classification

For the `User_Intent` column, classify based on the queries:

### Transactional
**Keywords:** free, download, buy, tool, converter, generator, online, create
**Example:** "pdf converter free", "download tool", "create qr code"
**Value:** `transactional`

### Informational
**Keywords:** what is, how does, why, learn, guide, tutorial
**Example:** "what is a qr code", "how does pdf work"
**Value:** `informational`

### Navigational
**Keywords:** brand name, login, sign in, official
**Example:** "adobe acrobat", "gmail login"
**Value:** `navigational`

### Commercial
**Keywords:** best, top, review, compare, vs, alternative
**Example:** "best pdf converter", "adobe vs canva"
**Value:** `commercial`

---

## 📋 Complete Example CSV

### Multiple URLs with GSC/Ahrefs Data

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/pdf-to-word,1306841,,"pdf to word converter free; convert pdf to word online; pdf to docx converter; how to convert pdf to word",transactional
https://example.com/qr-generator,978480,,"qr code generator free; create qr code online; how to make qr code; qr code maker",transactional
https://example.com/blog/ai-trends,25000,,"ai trends 2025; artificial intelligence future; latest ai developments",informational
https://example.com/pricing,15000,,"adobe pricing; acrobat cost; creative cloud price",commercial
https://example.com/,1584229,,"adobe; adobe creative cloud; adobe acrobat; adobe sign",navigational
```

---

## 🔄 Workflow Integration

### Current Workflow (Manual)

```
┌──────────────────────────────────────────────────────────┐
│ STEP 1: Export from GSC/Ahrefs                          │
│ ─────────────────────────────────────────────────────   │
│ For each URL:                                            │
│   1. Go to GSC Performance (or Ahrefs Organic Keywords) │
│   2. Filter by URL                                       │
│   3. Export top queries                                  │
│   4. Copy to spreadsheet                                 │
│                                                          │
│ Time: ~3-5 min per URL                                   │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 2: Format CSV                                       │
│ ─────────────────────────────────────────────────────   │
│ Create input CSV with columns:                           │
│   - URL                                                  │
│   - Traffic                                              │
│   - Category (optional)                                  │
│   - Top_Search_Queries (semicolon-separated)            │
│   - User_Intent (classify based on queries)             │
│                                                          │
│ Time: ~2-3 min per URL                                   │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 3: Run Analysis                                     │
│ ─────────────────────────────────────────────────────   │
│ node main.js --csv your-data.csv --aikey YOUR_KEY       │
│                                                          │
│ Time: ~8-12 sec per URL                                  │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│ STEP 4: Review Results                                   │
│ ─────────────────────────────────────────────────────   │
│ Open output CSV:                                         │
│   - Original columns preserved (including queries)       │
│   - 22 new analysis columns added                        │
│   - AI_Summary uses your GSC/Ahrefs queries!            │
│                                                          │
│ AI recommendations now aligned with actual search data!  │
└──────────────────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

### 1. Batch Processing

**Create a master spreadsheet:**

| URL | GSC Queries | Ahrefs Keywords | Combined Top 5 | Intent |
|-----|-------------|-----------------|----------------|--------|
| url1 | ... | ... | query1; query2; ... | transactional |
| url2 | ... | ... | query1; query2; ... | informational |

Then export as CSV with proper format.

### 2. Combine GSC + Ahrefs

**Best approach:**
- GSC = What drives YOUR traffic
- Ahrefs = What you COULD rank for

**Strategy:**
1. Take top 3 from GSC (actual traffic)
2. Take top 2 from Ahrefs (ranking opportunity)
3. Combine into Top_Search_Queries

**Example:**
```
GSC Top 3:     "pdf converter free" (5K clicks)
               "convert pdf online" (3K clicks)
               "pdf to word" (2K clicks)

Ahrefs Top 2:  "free pdf converter online" (10K volume, position 15)
               "best pdf converter" (8K volume, position 12)

Combined:      "pdf converter free; convert pdf online; pdf to word; free pdf converter online; best pdf converter"
```

### 3. Use Excel Formulas

**If you have many URLs:**

```excel
=CONCATENATE(A2, "; ", B2, "; ", C2, "; ", D2, "; ", E2)
```

Where A2-E2 contain individual queries.

### 4. Quality Over Quantity

**Don't add too many queries:**
- ✅ 5-10 queries per URL (ideal)
- ⚠️ 10-15 queries (acceptable)
- ❌ 20+ queries (too noisy)

Focus on highest traffic/volume.

---

## 🚫 Common Mistakes to Avoid

### ❌ Wrong Format
```csv
Top_Search_Queries
query1, query2, query3  ← Wrong: uses commas
query1 query2 query3    ← Wrong: no separator
```

### ✅ Correct Format
```csv
Top_Search_Queries
"query1; query2; query3"  ← Correct: semicolon + quotes
```

### ❌ Including Brand Queries Only
```csv
Top_Search_Queries
"adobe; adobe acrobat; adobe pdf"  ← Not useful for optimization
```

### ✅ Include Problem-Solving Queries
```csv
Top_Search_Queries
"pdf converter free; how to convert pdf; pdf to word online"  ← Useful!
```

### ❌ Queries Not Related to Page
```csv
URL: https://example.com/pdf-converter
Top_Search_Queries: "word to pdf; excel to pdf; ppt to pdf"  ← Wrong tool!
```

### ✅ Queries Match Page Purpose
```csv
URL: https://example.com/pdf-to-word
Top_Search_Queries: "pdf to word; convert pdf to word; pdf to docx"  ← Correct!
```

---

## 🎓 Template for You

### Blank Template CSV

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://,,,""",
https://,,,""",
https://,,,""",
https://,,,""",
https://,,,""",
```

### Filled Example CSV

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool1,100000,,"query1; query2; query3",transactional
https://example.com/tool2,50000,,"query1; query2; query3",transactional
https://example.com/blog/post1,25000,,"query1; query2; query3",informational
https://example.com/comparison,15000,,"query1; query2; query3",commercial
https://example.com/,200000,,"brand; brand product; brand login",navigational
```

---

## 📊 How the Tool Uses This Data

### In the AI Prompt

When you provide `Top_Search_Queries`, the tool adds this to the AI prompt:

```
REAL USER SEARCH QUERIES (use these to guide recommendations):
Target Audience Searches For:
  - "pdf to word converter free"
  - "convert pdf to word online"
  - "pdf to docx converter"

User Intent: transactional

IMPORTANT: Your recommendations MUST align with these actual search queries.
Don't suggest content about topics users aren't searching for.
```

### Result: Data-Driven Recommendations

**Without GSC/Ahrefs data:**
```
❌ "Add more content about PDF file formats"
❌ "Include history of document conversion"
```

**With GSC/Ahrefs data:**
```
✅ "Add H2: 'Free PDF to Word Converter' - matches top query (15K searches)"
✅ "Add FAQ: 'How to convert PDF to Word online?' - addresses 2nd query"
✅ "Emphasize 'free' in first 50 characters - appears in 60% of queries"
```

---

## 🔮 Future: API Integration (Planned)

**What we're building:**

```javascript
// Future feature (not yet implemented)
node main.js --csv urls.csv --aikey KEY --gsc-auto

// Would automatically:
// 1. Connect to Google Search Console API
// 2. Fetch top queries for each URL
// 3. Populate CSV automatically
// 4. Run analysis
```

**Until then:** Manual export is required (but only takes 5-10 minutes for 10-20 URLs).

---

## 📋 Quick Checklist

Before running analysis:

- [ ] Exported queries from GSC or Ahrefs
- [ ] Formatted as semicolon-separated list
- [ ] Added quotes if queries contain commas
- [ ] Classified user intent for each URL
- [ ] Saved as CSV file
- [ ] Verified format matches template
- [ ] Ready to run: `node main.js --csv file.csv --aikey KEY`

---

## 💬 Need Help?

**Can't access GSC/Ahrefs?**
→ Use `auto-populate-queries.js` to generate queries automatically

**Not sure about user intent?**
→ Use `transactional` as default for tools/converters

**Have many URLs?**
→ Start with top 10-20 highest traffic pages

**Want to verify format?**
→ Compare with `sample-urls-with-search-data.csv`

---

**Created:** November 2025  
**Status:** Current manual process (API integration planned)  
**Related:** [DATA_DRIVEN_RECOMMENDATIONS.md](DATA_DRIVEN_RECOMMENDATIONS.md), [SAMPLE_FILES.md](SAMPLE_FILES.md)

