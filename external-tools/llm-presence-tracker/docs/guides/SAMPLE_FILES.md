# Sample CSV Files

This folder contains sample input CSV files to help you get started.

## 📁 Available Sample Files

### 1. `sample-urls-minimal.csv` ⭐ Start Here

**Use this if:** You just want to test the tool quickly

```csv
URL,Traffic
https://example.com/page1,100000
https://example.com/page2,50000
```

**Columns:**
- `URL` (required) - The webpage to analyze
- `Traffic` (optional) - Monthly traffic or visits

**Run:**
```bash
node main.js --csv sample-urls-minimal.csv --aikey YOUR_KEY
```

---

### 2. `sample-urls-with-search-data.csv` 🎯 Recommended

**Use this if:** You want data-driven recommendations based on real search queries

```csv
URL,Traffic,Category,Top_Search_Queries,User_Intent
https://example.com/tool,100K,,"keyword1; keyword2; keyword3",transactional
```

**Additional Columns:**
- `Top_Search_Queries` - Semicolon-separated search queries that drive traffic to this URL
  - **Source:** Manually exported from Google Search Console, SEMrush, or Ahrefs
  - **Format:** `"query 1; query 2; query 3"`
  - **Purpose:** AI recommendations will align with these actual search queries
  - **📊 How to get this data:** See [GSC_AHREFS_INTEGRATION_GUIDE.md](GSC_AHREFS_INTEGRATION_GUIDE.md)

- `User_Intent` - The primary intent behind user searches
  - **Values:** `informational`, `transactional`, `navigational`, `commercial`
  - **Purpose:** AI adapts recommendations to match user goals
  - **📊 How to classify:** See [GSC_AHREFS_INTEGRATION_GUIDE.md](GSC_AHREFS_INTEGRATION_GUIDE.md)

**Run:**
```bash
node main.js --csv sample-urls-with-search-data.csv --aikey YOUR_KEY
```

---

### 3. `sample-urls.csv` (Full Example)

**Use this if:** You want to see a complete real-world example with actual Adobe URLs

This file contains 9 real Adobe URLs with:
- Actual traffic numbers
- Real search queries from Google Search Console
- Correct user intent classification

**Purpose:** Reference example showing how to format your own data

---

## 🔍 Where These Columns Come From

### ⚠️ Important: Manual Data Entry Required

The tool **does NOT automatically fetch** `Top_Search_Queries` or `User_Intent`. You must:

1. **Export from Google Search Console:**
   - Go to Performance → Filter by page URL
   - Export top 10-20 queries to CSV
   - Copy queries to your input CSV (semicolon-separated)

2. **Or use SEMrush/Ahrefs:**
   - Enter URL in keyword research tool
   - Export "Organic Keywords" report
   - Copy top keywords to your CSV

3. **Or analyze internal data:**
   - Site search logs
   - Customer support questions
   - Sales team feedback

---

## 📊 What Gets Added to Output

Regardless of which input file you use, the output CSV will include:

**Original Columns** (preserved from your input)
- URL
- Traffic
- Category (if provided)
- Top_Search_Queries (if provided)
- User_Intent (if provided)

**+22 New Analysis Columns:**
- Page_Type (automatically detected by tool)
- Page_Type_Confidence
- Classification_Method
- LLM_Presence_Score
- Score_Rating
- Freshness_Score
- Answerability_Score
- Query_Alignment_Score
- Snippet_Quality_Score
- Authority_Score
- Structure_Score
- Has_Current_Year
- Has_Pricing
- Has_Questions
- Has_Definitions
- Has_Steps
- Has_Comparisons
- H1_Count
- H2_Count
- List_Count
- Top_Phrases (automatically extracted)
- AI_Summary (if --aikey provided)

---

## 🚀 Quick Start Guide

### First Time? Use Minimal

```bash
# 1. Edit sample-urls-minimal.csv with your URLs
# 2. Run analysis
node main.js --csv sample-urls-minimal.csv --aikey YOUR_AZURE_KEY

# 3. Check output folder for results
```

### Want Better Recommendations? Add Search Data

```bash
# 1. Export search queries from Google Search Console
# 2. Add to sample-urls-with-search-data.csv format
# 3. Run analysis
node main.js --csv sample-urls-with-search-data.csv --aikey YOUR_KEY

# 4. Get recommendations aligned with actual user searches!
```

---

## ❓ FAQ

### Q: Which file should I use?
**A:** Start with `sample-urls-minimal.csv` for testing. Once comfortable, upgrade to `sample-urls-with-search-data.csv` format for production use.

### Q: Do I need all the columns?
**A:** Only `URL` is required. All other columns are optional but enhance the analysis and recommendations.

### Q: Can I add my own columns?
**A:** Yes! The tool preserves all original columns in the output. You can add your own metadata columns (e.g., `Author`, `Department`, `Priority`) and they'll appear in the output CSV.

### Q: How many URLs can I analyze at once?
**A:** The tool processes 5 URLs in parallel. You can analyze hundreds or thousands of URLs in a single batch, though it will take proportionally longer.

### Q: What if I don't have Traffic data?
**A:** Traffic is optional. You can use just URL. However, traffic helps prioritize which pages to optimize first when reviewing results.

---

## 📖 Learn More

- [README.md](README.md) - Complete documentation
- [DATA_DRIVEN_RECOMMENDATIONS.md](DATA_DRIVEN_RECOMMENDATIONS.md) - How to use search query data
- [QUICKSTART.md](QUICKSTART.md) - Step-by-step tutorial

---

**Last Updated:** November 2025

