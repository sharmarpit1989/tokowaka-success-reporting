# Tokowaka Brand Presence Reporting Automation

## 📋 Table of Contents
- [Overview](#overview)
- [Quick Start - TW Report Automation Steps](#quick-start---tw-report-automation-steps)
- [Quick Reference Card](#quick-reference-card)
- [What This Tool Does](#what-this-tool-does)
- [How It Works](#how-it-works)
- [Understanding Console Output](#understanding-console-output)
- [Detailed Documentation](#detailed-documentation)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Overview

This automation toolkit measures how frequently AI platforms (ChatGPT, Copilot, Gemini, Perplexity, etc.) cite your brand's URLs when responding to user prompts. It processes weekly snapshots of AI responses and calculates detailed citation metrics to provide critical visibility into your AI-driven brand presence.

**Key Benefits:**
- 📊 Track citation rates across multiple AI platforms
- 📈 Monitor brand presence trends over time
- 🎯 Identify which URLs are most frequently cited
- 🔍 Discover "untracked" pages from your domain being cited
- ⚡ Automated workflow - minimal manual intervention required

---

## Quick Start - TW Report Automation Steps

### 🚀 Complete Workflow in 3 Simple Steps

This section provides the streamlined process for generating Tokowaka (TW) brand presence reports. Follow these steps to go from raw data to actionable insights in minutes.

### Step 1: Download Brand Presence Data

**Where to get the data:**
- Navigate to the Brand Presence shared folder: `https://adobe.sharepoint.com/:f:/r/sites/HelixProjects/Shared%20Documents/sites/elmo-ui-data?csf=1&web=1&e=t2IPtB`
- Download ALL Excel files for the time period you want to analyze (typically weekly snapshots)

**Where to put the data:**
```
📁 brand-presence-data/
   └── 📁 [create-a-subfolder-with-descriptive-name]/
       ├── brandpresence-chatgpt-w44-2025.xlsx
       ├── brandpresence-copilot-w44-2025.xlsx
       ├── brandpresence-gemini-w44-2025.xlsx
       ├── brandpresence-perplexity-w44-2025.xlsx
       └── ... (all other files for your time period)
```

**📌 Pro Tip:** Name your subfolder descriptively to easily identify the analysis period later (e.g., `lovesac-nov-2024`, `w44-w48-2025`, `Q4-campaign`)

### Step 2: Prepare Your URL List

**What URLs to include:**
These are the specific URLs you want to track for citations. Typically, these are:
- ✅ Pages identified with **content gain > 2X** before going LIVE with Tokowaka
- ✅ Key product pages, landing pages, or high-value content
- ✅ URLs specifically optimized for AI visibility

**How to prepare the file:**
1. Create a CSV or Excel file with a column named `url`, `urls`, `link`, or `links`
2. List one URL per row
3. Save the file in the `Input Excels/` folder

**Example file structure:**
```csv
urls
https://www.lovesac.com/sactionals
https://www.lovesac.com/sacs
https://www.lovesac.com/about-us
```

**📌 Why these URLs?** The tool will specifically track citation rates for these URLs and compare them against other pages from your domain that AI platforms might be citing. This helps you understand:
- How often your priority pages are being cited
- What other pages from your domain are getting AI attention
- Whether your optimization efforts are paying off

### Step 3: Run the Analysis

**How to run:**
1. Open a command prompt or terminal in the project folder
2. Run the script:
   ```bash
   python combine_brandpresence_data.py
   ```

3. **Follow the interactive prompts:**
   - **Select folder:** Choose the subfolder from `brand-presence-data/` you created in Step 1
   - **Select input file:** Choose the CSV/Excel file you created in Step 2

4. **Wait for completion:** The script will:
   - Process all Excel files in the selected folder
   - Combine data across weeks and platforms
   - Add citation tracking flags
   - Remove duplicate entries
   - Automatically calculate citation rates
   - Generate comprehensive reports

**✅ DONE!**

### 📊 What You Get

After running the script, check the `Output/[domain-name]/` folder for two Excel files:

**File 1: `brandpresence-full-combined-[folder]_[timestamp].xlsx`**
- **Sheet 1: combined_data** - All AI responses enriched with citation flags
  - `selected_url_cited?` - Is your tracked URL cited? (Y/N)
  - `any_url_from_domain` - Is ANY URL from your domain cited? (Y/N)
  - `any_url_from_domain_excluding_specified_URLs` - Are OTHER domain URLs cited? (Y/N)
- **Sheet 2: target_urls** - List of URLs you're tracking

**File 2: `citation_rates_by_url-[folder]_[timestamp].xlsx`**
- **Sheet 1: Owned Citations Summary** - High-level metrics by week/platform
  - Total prompt executions
  - Selected URL citation counts
  - Other domain URL citation counts
  - Unique prompts with any domain citation
- **Sheet 2: By Week-URL-Platform** - Detailed breakdown per URL
  - Citation rates for each specific URL
  - Weekly trends across platforms

### 🎯 Understanding Your Results

**Key Metrics to Watch:**

1. **Selected URL Citation Rate** - What % of AI responses cite your priority URLs?
   - Higher is better - means AI platforms are recommending your optimized pages

2. **Unique Prompts with Owned Citations** - How many unique questions triggered citations?
   - Shows breadth of topics where your brand appears

3. **Other Domain URLs** - What other pages are being cited?
   - Identifies unoptimized pages getting AI attention
   - Opportunities for further optimization

**Example Interpretation:**
```
Week 44 | ChatGPT | lovesac.com/sactionals
- Total Prompts: 100
- Times Cited: 15
- Citation Rate: 15%
```
This means: When 100 prompts were executed on ChatGPT in Week 44, your Sactionals page was cited in 15 of those responses.

### 💡 Best Practices

**For Accurate Analysis:**
- ✅ Include all Excel files for the time period in the same folder
- ✅ Use consistent URL formats in your input file (with or without trailing slashes)
- ✅ Download fresh data weekly to track trends
- ✅ Keep descriptive folder names for easy identification

**For Better Insights:**
- 📊 Compare citation rates week-over-week to measure improvement
- 🔄 Track the same URLs consistently across time periods
- 🎯 Focus on pages with content gain >2X for priority tracking
- 📈 Look for patterns: which platforms cite you most? which URLs perform best?

---

## Quick Reference Card

**For experienced users who need a quick reminder:**

```bash
# 1. Prepare your environment
📁 brand-presence-data/[your-folder-name]/     ← Place Excel files here
📁 Input Excels/[your-urls-file.csv]           ← Place URL list here

# 2. Run the script
python combine_brandpresence_data.py

# 3. Select options when prompted
→ Choose folder number
→ Choose input file number
→ Wait for automatic processing

# 4. Check results
📁 Output/[domain-name]/
   ├── brandpresence-full-combined-[...].xlsx  ← Combined data with citations
   └── citation_rates_by_url-[...].xlsx        ← Citation rates analysis
```

**Required File Formats:**
- Brand presence: `brandpresence-{platform}-w{week}-{year}.xlsx` with columns: `Prompt`, `Answer`, `Sources`
- URL list: CSV/Excel with column named `url`, `urls`, `link`, or `links`

**Platform Names:** `chatgpt`, `copilot`, `gemini`, `perplexity`, `ai-mode`, `google-ai-overviews`, `all`

---

## What This Tool Does

The toolkit consists of two integrated Python scripts that work together automatically:

### 1. `combine_brandpresence_data.py` (Main Script)
**Purpose:** Combines and enriches raw brand presence data

**Key Functions:**
- ✅ Combines data from multiple weeks and platforms into a single dataset
- ✅ Identifies which URLs from your domain are cited in AI responses
- ✅ Adds three-tier citation tracking columns
- ✅ Removes duplicate prompt-answer combinations
- ✅ Standardizes date formats
- ✅ Outputs consolidated Excel file with enriched data
- ✅ **Automatically triggers citation rate calculation**

### 2. `calculate_citation_rates.py` (Auto-runs)
**Purpose:** Calculates detailed citation rates and metrics

**Key Functions:**
- ✅ Calculates citation rates for each URL by week and platform
- ✅ Identifies unique prompts that cited your domain
- ✅ Aggregates overall domain citation metrics
- ✅ Creates summary views and detailed breakdowns
- ✅ Generates analysis-ready Excel reports

---

## How It Works

### Understanding the Three-Tier Citation Tracking

The tool adds three powerful columns to help you understand citation patterns:

#### 1. `selected_url_cited?` (Y/N)
**What it tracks:** URLs from your curated list (Input Excels file)
- **'Y'** = One of your specified URLs is cited in the AI response
- **'N'** = None of your specified URLs are cited

**Use case:** Track performance of your priority pages

#### 2. `any_url_from_domain` (Y/N)
**What it tracks:** ANY URL from your domain
- **'Y'** = At least one URL from your domain is cited (includes specified + other URLs)
- **'N'** = No URLs from your domain are cited

**Use case:** Measure overall brand presence across AI platforms

#### 3. `any_url_from_domain_excluding_specified_URLs` (Y/N)
**What it tracks:** URLs from your domain that are NOT in your curated list
- **'Y'** = Other pages from your domain are being cited
- **'N'** = No other pages are cited (only specified URLs or none at all)

**Use case:** Discover untracked pages getting AI attention - optimization opportunities!

### URL Matching Logic

The tool uses **exact path matching** for precise citation tracking:

**Matching Rules:**
- ✅ Domain must match exactly (case-insensitive)
- ✅ Path must match exactly (case-insensitive)
- ✅ Ignores URL fragments (`#section`)
- ✅ Ignores query parameters (`?param=value`)
- ✅ Ignores trailing slashes
- ✅ Handles www/non-www variations automatically

**Examples:**

```
Target URL: https://www.adobe.com/products/photoshop

✓ MATCHES:
  https://www.adobe.com/products/photoshop
  https://www.adobe.com/products/photoshop/
  https://www.adobe.com/products/photoshop?source=google
  https://www.adobe.com/products/photoshop#features

✗ DOES NOT MATCH:
  https://www.adobe.com/products              (different path)
  https://www.adobe.com/products/photoshop/pricing  (longer path)
  https://adobe.com/products/photoshop        (different domain - www missing)
```

### Data Cleansing

The tool automatically performs several data quality checks:

1. **Date Standardization:** Converts all execution dates to YYYY-MM-DD format
2. **Duplicate Removal:** Removes rows where same Prompt + Answer appear multiple times (within same week/platform)
3. **Platform Normalization:** Standardizes platform names (e.g., 'all' → 'ChatGPT-Paid')
4. **Column Validation:** Checks for required columns and provides helpful error messages

---

## Understanding Console Output

When you run the tool, you'll see detailed progress information. Here's what to expect:

### Phase 1: Folder Selection
```
================================================================================
SELECT FOLDER TO ANALYZE
================================================================================

Found 3 folder(s) in 'brand-presence-data':

  1. lovesac-nov-2024 (28 Excel files)
  2. w44-w48-2025 (42 Excel files)
  3. Q4-campaign (35 Excel files)

================================================================================
Enter the number of the folder to analyze (or 'q' to quit): 
```

### Phase 2: Input File Selection
```
================================================================================
SELECT INPUT FILE
================================================================================

Found 5 file(s) in 'Input Excels' folder:

  1. urls-acom.csv
  2. urls-bacom.csv
  3. urls-lovesac.csv
  4. urls-lovesac-byAgentic.csv
  5. urls-blog-acom.csv

================================================================================
Enter the number of the file to use (1-5, or 'q' to quit): 
```

### Phase 3: Processing Files
```
Processing files:
--------------------------------------------------------------------------------
✓ brandpresence-chatgpt-w44-2025.xlsx
    Week: w44, Platform: chatgpt, Rows: 2847
    Selected URL Citations: 234, Any Domain URLs: 456, Other Domain URLs: 222

✓ brandpresence-copilot-w44-2025.xlsx
    Week: w44, Platform: copilot, Rows: 2547
    Selected URL Citations: 189, Any Domain URLs: 398, Other Domain URLs: 209
...
```

### Phase 4: Summary & Breakdown
```
================================================================================
BREAKDOWN BY WEEK AND PLATFORM
================================================================================
Week Platform  Selected_URL_Citations  Any_Domain_URLs  Other_Domain_URLs  Total_prompt_executions  Selected_URL_Rate_%  Any_Domain_Rate_%  Other_Domain_Rate_%
w44  chatgpt                      234              456                222                     2847                 8.22              16.02                 7.80
w44  copilot                      189              398                209                     2547                 7.42              15.63                 8.21
w44  gemini                       156              334                178                     2234                 6.98              14.95                 7.97
...
```

**💡 Understanding the Breakdown Table:**
- **Selected_URL_Citations:** How many times your tracked URLs were cited
- **Any_Domain_URLs:** Total citations including all domain URLs (tracked + untracked)
- **Other_Domain_URLs:** Citations of domain URLs NOT in your tracking list
- **Total_prompt_executions:** Total number of prompts run for that week/platform
- **Rate columns:** Percentage calculations for quick performance assessment

### Phase 5: Completion
```
================================================================================
✓ Data saved to: Output/lovesac.com/brandpresence-full-combined-lovesac-nov-2024_20241204_143022.xlsx
================================================================================

================================================================================
RUNNING CITATION RATE CALCULATION
================================================================================

[Citation calculation output...]

================================================================================
✓ Citation rate calculation completed successfully!
================================================================================
```

---

## Detailed Documentation

### Input Data Requirements

#### Folder Structure
```
📁 Project Root/
│
├── 📁 brand-presence-data/
│   ├── 📁 campaign-1/
│   │   ├── brandpresence-chatgpt-w44-2025.xlsx
│   │   ├── brandpresence-copilot-w44-2025.xlsx
│   │   └── ...
│   └── 📁 campaign-2/
│       └── ...
│
├── 📁 Input Excels/
│   ├── urls-lovesac.csv
│   ├── urls-campaign2.xlsx
│   └── ...
│
├── 📁 Output/
│   └── (Generated automatically with domain subfolders)
│
├── combine_brandpresence_data.py
└── calculate_citation_rates.py
```

#### Excel File Structure (Brand Presence Data)

**Required Columns:**
- `Prompt` - The question/prompt sent to the AI
- `Answer` - The AI's response
- `Sources` - Semicolon-separated list of URLs cited (e.g., `url1; url2; url3`)

**Optional Columns:**
- `Execution Date` - When the prompt was executed
- Any other columns (will be preserved in output)

#### Filename Convention

Brand presence files should follow this pattern:
```
brandpresence-{platform}-w{week}-{year}.xlsx
```

**Examples:**
- `brandpresence-chatgpt-w44-2025.xlsx`
- `brandpresence-copilot-w45-2025.xlsx`
- `brandpresence-gemini-w46-2025.xlsx`
- `brandpresence-perplexity-w47-2025.xlsx`

**Supported Platform Names:**
- `chatgpt`, `copilot`, `gemini`, `perplexity`
- `ai-mode`, `google-ai-overviews`
- `all` (automatically converted to `ChatGPT-Paid`)

### Output Files Explained

#### Output Folder Structure

The tool creates domain-specific subfolders with timestamped files:

```
📁 Output/
  └── 📁 lovesac.com/
      ├── brandpresence-full-combined-w44-w48_20241204_143022.xlsx
      └── citation_rates_by_url-w44-w48_20241204_143022.xlsx
```

**Why timestamps?** Allows you to keep historical analyses and compare results over time.

#### File 1: Combined Data File

**Filename:** `brandpresence-full-combined-{folder}_{timestamp}.xlsx`

**Sheet 1: combined_data**

Original columns from brand presence files PLUS:
- `week` - Extracted from filename (e.g., `w44`)
- `platform` - Extracted from filename (e.g., `chatgpt`)
- `selected_url_cited?` - Y/N for specified URL citations
- `any_url_from_domain` - Y/N for any domain URL citations
- `any_url_from_domain_excluding_specified_URLs` - Y/N for other domain URLs

**Sheet 2: target_urls**

Simple list of URLs being tracked (from your Input Excels file).

#### File 2: Citation Rates File

**Filename:** `citation_rates_by_url-{folder}_{timestamp}.xlsx`

**Sheet 1: Owned Citations Summary**

Aggregated metrics by Week × Platform:

| Column | Description |
|--------|-------------|
| Week | Week number (e.g., w44) |
| Platform | Platform name (e.g., chatgpt) |
| Total_prompt_executions | Total prompt rows for this week/platform |
| Selected_URL_Citations | Rows where specified URLs are cited |
| any_url_from_domain_excluding_specified_URLs_Citations | Rows where other domain URLs are cited |
| Unique_Prompts_with_Owned_Citations | Count of unique prompts (not rows) with any domain URL cited |

**Sheet 2: By Week-URL-Platform**

Detailed breakdown by Week × Platform × URL:

| Column | Description |
|--------|-------------|
| Week | Week number |
| Platform | Platform name |
| URL | Specific URL being tracked |
| Rows_with_Selected_URL_Cited | Number of rows where this URL is cited |
| selected_URL_Citation_Rate | Citation rate as decimal (e.g., 0.15 = 15%) |

### Key Concepts

#### Rows vs. Unique Prompts

**Important distinction:**

- **Rows / Prompt Executions:** Each row represents one execution. The same prompt text can appear multiple times if executed on different dates.
  
- **Unique Prompts:** Counts distinct prompt text, regardless of execution frequency.

**Example:**
```
Dataset has 3 rows:
1. Prompt: "What is Photoshop?" (executed Monday)
2. Prompt: "What is Photoshop?" (executed Tuesday)
3. Prompt: "How to edit photos?" (executed Monday)

Total rows: 3
Unique prompts: 2
```

Most metrics count **rows**, but `Unique_Prompts_with_Owned_Citations` counts **unique prompts** to avoid inflating numbers from repeated executions.

#### Citation Column Relationships

These columns have a hierarchical relationship:

```
any_url_from_domain = 'Y'
  ↓
  Includes ALL domain URLs cited
  |
  ├── selected_url_cited? = 'Y'
  |   └── URLs from your Input Excels file
  |
  └── any_url_from_domain_excluding_specified_URLs = 'Y'
      └── Other domain URLs NOT in your file
```

**Why they don't sum up:**

A single AI response can cite BOTH selected URLs AND other domain URLs simultaneously.

**Example:**
```
AI Response Sources: 
  https://lovesac.com/sactionals; https://lovesac.com/blog/article

If your Input Excels file only tracks: https://lovesac.com/sactionals

Then for this response:
  • selected_url_cited? = Y (sactionals is tracked)
  • any_url_from_domain_excluding_specified_URLs = Y (blog URL is not tracked)
  • any_url_from_domain = Y (includes both)

This is ONE unique prompt, not two!
```

### Advanced Usage

#### Analyzing Multiple Time Periods

Create separate folders for different analyses:

```
📁 brand-presence-data/
  ├── 📁 Q1-2025/
  ├── 📁 Q2-2025/
  ├── 📁 Q3-2025/
  └── 📁 campaign-specific/
```

Run the script for each folder independently to generate separate reports.

#### Using Different URL Lists

Maintain multiple URL files for different analysis purposes:

```
📁 Input Excels/
  ├── urls-product-pages.csv
  ├── urls-blog-articles.csv
  ├── urls-documentation.csv
  └── urls-campaign-specific.xlsx
```

Select the appropriate file when running the script to focus your analysis.

#### Comparing Platform Performance

Use the "By Week-URL-Platform" sheet to:
1. Identify which platforms cite you most frequently
2. Compare citation rates across platforms for the same URL
3. Spot platform-specific trends or anomalies

#### Trend Analysis

Keep historical output files to:
1. Track citation rate improvements over time
2. Measure impact of optimization efforts
3. Identify seasonal patterns or trends
4. Compare pre/post Tokowaka implementation performance

**Example Trend Analysis Workflow:**
```
📊 Month-over-Month Comparison:

1. November Analysis:
   📁 brand-presence-data/nov-2024/ → Output/domain/citation_rates_[...].xlsx

2. December Analysis:  
   📁 brand-presence-data/dec-2024/ → Output/domain/citation_rates_[...].xlsx

3. Compare:
   - Open both citation rate files
   - Look at "Owned Citations Summary" sheet
   - Track Selected_URL_Citation changes by platform
   - Identify which URLs improved/declined
```

#### Manual Citation Rate Calculation

If you need to re-run citation rates without re-processing raw data:

```bash
# Method 1: Auto-detect latest file
python calculate_citation_rates.py

# Method 2: Specify exact file
python calculate_citation_rates.py "Output/lovesac.com/brandpresence-full-combined-[...].xlsx" "folder-name"

# Method 3: Specify all parameters (advanced)
python calculate_citation_rates.py "[input-file]" "[folder-name]" "[output-folder]" "[timestamp]"
```

**When to use this:**
- Re-calculate with different time groupings
- Export citation rates to a different folder
- Troubleshoot calculation issues without re-processing raw data

---

## FAQ

### General Questions

**Q: How long does the analysis take?**  
A: Depends on data size:
- Small datasets (< 10k rows): Under 30 seconds
- Medium datasets (10k-50k rows): 1-3 minutes  
- Large datasets (50k-100k+ rows): 3-5+ minutes

**Q: Can I stop the script midway?**  
A: Yes! Press `Ctrl+C` to cancel. No files will be created if you cancel before completion.

**Q: Can I process the same data multiple times?**  
A: Yes! Timestamps prevent overwriting previous analyses. Great for comparing different URL lists.

**Q: Do I need to clean the Excel files before processing?**  
A: No! The script handles:
- Date format standardization
- Duplicate removal
- Platform name normalization
- Missing data handling

---

### URL and Citation Questions

**Q: Why don't my citation rates sum up to 100%?**  
A: Citation columns measure different things:
- One prompt can cite multiple URLs
- Rates are independent: a single response can have both selected URLs AND other domain URLs
- Each metric serves a different analysis purpose

**Q: What if my URLs have different formats (www vs non-www)?**  
A: The tool automatically handles this! Both formats are normalized and matched correctly.

**Q: Can I use partial URLs or wildcards?**  
A: No. The tool uses exact path matching. `/products/photoshop` won't match `/products/photoshop/pricing`.

**Q: What if AI platforms cite URLs with query parameters?**  
A: Query parameters and URL fragments are ignored during matching, so `domain.com/page?param=value` matches `domain.com/page`.

---

### Data and Output Questions

**Q: What happens if I have duplicate prompts across different dates?**  
A: The script:
- Removes duplicates within same week/platform
- Keeps prompts across different weeks
- Preserves the `Execution Date` so you can see daily snapshots

**Q: Can I manually run just the citation rate calculation?**  
A: Yes! If you need to reprocess:
```bash
# Auto-detect latest combined file:
python calculate_citation_rates.py

# Or specify a file:
python calculate_citation_rates.py "Output/domain/brandpresence-full-combined-[...].xlsx" "folder-name"
```

**Q: Where does the tool store output files?**  
A: In `Output/[domain-name]/` subdirectories with timestamps. Example:
```
Output/
  └── lovesac.com/
      ├── brandpresence-full-combined-lovesac-nov-2024_20241204_143022.xlsx
      └── citation_rates_by_url-lovesac-nov-2024_20241204_143022.xlsx
```

**Q: Can I compare results across different time periods?**  
A: Yes! Keep different folders in `brand-presence-data/` and process separately. Timestamps preserve historical data.

---

### Troubleshooting During Run

**Q: Script shows "Skipping file: Could not extract week"**  
A: Filename must contain `w` followed by week number (e.g., `w44`, `w48`). Rename files to match pattern.

**Q: Getting "No URLs found" even though Sources column has data?**  
A: Check:
1. Domain spelling matches between your URL file and actual sources
2. URLs in your file have correct format (https://...)
3. Sources column has URLs (not just text)

**Q: The breakdown table shows 0% citation rates everywhere**  
A: This means:
- No URLs from your file matched the sources
- Check exact URL paths in both your file and Sources column
- Domain variations (www vs non-www) should be handled automatically

**Q: "Memory Error" when processing large files**  
A: Try:
- Process smaller time periods (split into monthly folders)
- Close other applications to free RAM
- Process weeks individually instead of all together

---

### Advanced Usage Questions

**Q: Can I track multiple domains at once?**  
A: Not in one run. Process each domain separately with its own URL file.

**Q: How do I identify which "other" URLs are being cited?**  
A: Open the combined data file, filter where `any_url_from_domain_excluding_specified_URLs = 'Y'`, then examine the `Sources` column.

**Q: Can I export results to other formats (CSV, PDF)?**  
A: The tool creates Excel files. You can open them and save as CSV, or use Excel to create PDF reports.

**Q: How do I track citation trends month-over-month?**  
A: 
1. Keep monthly folders in `brand-presence-data/`
2. Process each month separately
3. Use consistent URL list across months
4. Compare the citation rate files side-by-side in Excel

---

## Troubleshooting

### Common Issues and Solutions

#### ❌ "No folders found in 'brand-presence-data'"

**Cause:** The `brand-presence-data/` folder doesn't exist or is empty.

**Solution:**
1. Create the `brand-presence-data/` folder in your project root
2. Create a subfolder inside it (e.g., `w44-w48`)
3. Place your Excel files in the subfolder

---

#### ❌ "No files found in 'Input Excels' folder"

**Cause:** The `Input Excels/` folder is empty or doesn't exist.

**Solution:**
1. Create the `Input Excels/` folder in your project root
2. Add a CSV or Excel file with your URLs
3. Ensure the file has a column named `url`, `urls`, `link`, or `links`

---

#### ❌ "Could not extract week" warning

**Cause:** Filename doesn't follow the expected pattern.

**Solution:**
- Rename files to include `w{number}` format (e.g., `brandpresence-chatgpt-w44-2025.xlsx`)
- Files without proper week format will be skipped

---

#### ❌ "Could not find URL column"

**Cause:** Your Input Excel file doesn't have a recognized URL column name.

**Solution:**
- Rename your column to one of: `url`, `urls`, `link`, or `links` (case-insensitive)

---

#### ❌ "'Sources' column not found" warning

**Cause:** One or more Excel files don't have a Sources column.

**Solution:**
- Check that brand presence files have a column named `Sources` with semicolon-separated URLs
- Files without Sources column will have all citations marked as 'N'

---

#### ❌ Duplicate removal removes too much data

**Cause:** Many rows have identical Prompt + Answer combinations.

**Solution:**
- This is normal if you have daily snapshots with the same prompts
- Review console output to see how many duplicates were found
- Duplicates are only removed within the same week/platform combination
- Check `Execution Date` column to understand the snapshot frequency

---

#### ❌ Citation rates seem low

**Possible reasons:**
1. **URL format mismatch** - Ensure URLs in your file match the format in Sources (with/without www)
2. **Path mismatch** - The tool uses exact path matching. `/products/photoshop` ≠ `/products`
3. **Different domain variation** - Check if sources use www. vs non-www
4. **Limited data** - Some weeks/platforms may have fewer prompt executions

**Debug steps:**
1. Open the combined data file and look at the `Sources` column
2. Compare actual source URLs with your tracked URLs
3. Check if `any_url_from_domain` shows 'Y' when `selected_url_cited?` shows 'N'
   - This means other pages from your domain are being cited

---

### Performance Notes

- **Processing time:** Depends on number of files and rows
  - Small datasets (< 10k rows): < 30 seconds
  - Medium datasets (10k-50k rows): 1-3 minutes
  - Large datasets (50k-100k+ rows): 3-5+ minutes

- **Memory usage:** Large datasets may require significant RAM
  - Consider processing smaller time periods if you encounter memory issues

---

#### 💡 Pro Tips for Large Datasets

1. **Process by week instead of quarter:** Smaller batches are faster and use less memory
2. **Close other applications:** Free up RAM for data processing
3. **Use an SSD:** Faster disk access significantly improves performance
4. **Monitor console output:** The progress messages help you estimate completion time

---

## Dependencies

### Required Python Packages

```bash
pip install pandas openpyxl numpy
```

**Package purposes:**
- `pandas` - Data manipulation and analysis
- `openpyxl` - Excel file reading/writing
- `numpy` - Numerical operations

### Python Version

- **Recommended:** Python 3.8 or higher
- **Minimum:** Python 3.6

---

## Support and Feedback

### Getting Help

1. Check this README first
2. Review the console output - it provides detailed progress and error messages
3. Look at the Troubleshooting section above
4. Check the generated Excel files for unexpected patterns

### Reporting Issues

When reporting issues, please include:
- Error message (full text from console)
- Sample filename that's causing issues
- Number of files being processed
- Python version (`python --version`)
- Number of rows in your dataset (shown during processing)
- Sample URLs from your input file (first 2-3 URLs)

---

## Changelog

### Current Version Features

**Core Functionality:**
- ✅ Three-tier citation tracking (Selected / Any / Other)
- ✅ Multi-file processing with folder selection
- ✅ Flexible input file support (CSV or Excel)
- ✅ Automatic citation rate calculation
- ✅ Domain-based output organization
- ✅ Timestamped output files
- ✅ Exact path matching with URL normalization
- ✅ Duplicate detection and removal
- ✅ Date standardization
- ✅ Interactive console interface
- ✅ Automatic www/non-www domain handling

**Recent Improvements:**
- 🆕 Domain-specific subfolders in Output directory
- 🆕 Timestamp-based file naming for historical tracking
- 🆕 Support for multiple input file formats
- 🆕 Enhanced URL matching logic
- 🆕 Improved error handling and user feedback

---

## License

This tool is for internal use within Adobe Customer Engineering team.

---

**Last Updated:** December 2025  
**Maintained by:** Customer Engineering - Automations Team
