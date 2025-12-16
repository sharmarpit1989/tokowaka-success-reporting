# Trends & Insights Dashboard - Enhanced with URL Analysis

## 🎉 What's New

The Trends & Insights dashboard now uses **URL-level analysis data** from your AI Visibility Dashboard to provide **smarter, more actionable content recommendations**.

## Key Improvements

### 1. **Target Specific Pages** 🎯
Instead of generic advice, recommendations now tell you **exactly which pages need improvement**:

```
Before: "Add FAQ section to your website"
After: "Improve answerability on these 3 pages:
       - example.com/product-guide (LLM score: 45%)
       - example.com/pricing (LLM score: 52%)
       - example.com/features (LLM score: 48%)"
```

### 2. **Metric-Focused Actions** 📊
Each recommendation targets the **weakest LLM visibility metric**:
- **Freshness**: Update dates, current information
- **Answerability**: Add FAQ sections, direct answers
- **Authority**: Add credentials, citations, expert content
- **Structure**: Add tables, lists, better formatting

### 3. **Data-Driven Prioritization** 📈
Recommendations are based on **actual page performance**:
- Pages with LLM scores < 40%: High priority
- Pages with LLM scores 40-60%: Medium priority
- Pages with LLM scores > 60%: Optimization only

### 4. **Smart Content Strategy** 💡
The system now:
- ✅ Prioritizes **fixing existing low-performing pages** over creating new ones
- ✅ Shows **current vs. target LLM visibility scores**
- ✅ Validates recommendations against **actual website structure**
- ✅ Provides **before/after impact estimates**

## How to Use

### Step 1: Analyze URLs (AI Visibility Dashboard)
1. Go to **AI Visibility Analysis**
2. Create a project and upload URLs
3. Run content analysis on your URLs
4. Wait for analysis to complete

### Step 2: Upload Citation Data
1. Upload brand presence (citation) data
2. System processes prompts and citation rates

### Step 3: Get Smart Recommendations (Trends & Insights)
1. Navigate to **Trends & Insights**
2. Click "Load Opportunities" or wait for auto-load
3. Review recommendations with:
   - 🎯 **Metric Focus badges** (which LLM metric to improve)
   - 🔧 **Target URLs** (specific pages needing work)
   - ✅/⚠️/❌ **Validation status** (exists, partial, or missing)
   - 📊 **Current LLM scores** (how pages perform now)

### Step 4: Take Action
For each recommendation:
1. Check the **Target URLs** section
2. Review the **Action Items**
3. Implement changes on the specified pages
4. Re-run AI Visibility analysis to measure improvement

## Example Recommendations

### Example 1: Fix Existing Page
```
Title: Update Product Comparison Page with Current Data
Theme: Product Comparisons
Priority: HIGH
Metric Focus: Freshness

Target Pages:
- example.com/product-comparison (Current score: 42%)

Description:
This page receives 89 prompts but has a low citation rate (18%) due to 
outdated content. Freshness score is only 28%, limiting LLM citations.

Actions:
1. Update all product prices to 2025 rates
2. Add "Last Updated: December 2025" at the top
3. Replace discontinued products with current models
4. Add release date information for each product

Potential Impact: Improve LLM visibility from 42% to 65-70%
```

### Example 2: Create New Content
```
Title: Create Comprehensive Pricing FAQ Page
Theme: Pricing Questions
Priority: HIGH
Metric Focus: Answerability

Target Pages: (None - new content needed)

Description:
Your site receives 127 prompts about pricing but only gets cited 12% of the 
time. Analysis of 45 pages shows no dedicated pricing FAQ exists.

Recommended Structure:
- 10 FAQs
- 2 comparison tables
- 3 structured lists

Actions:
1. Create new page: /pricing-faq
2. Add 10 FAQs covering common pricing questions from prompts
3. Include pricing tier comparison table
4. Add "Best for" recommendations for each plan

Potential Impact: +32 citations/week
```

## Understanding Validation Status

### ✅ Exists (Green)
- **Meaning**: Content exists and has good structure
- **LLM Score**: Usually 70%+
- **Action**: Minor optimizations to improve citation rate
- **Example**: "You have comparison tables but they're not being cited effectively"

### ⚠️ Partial (Yellow)
- **Meaning**: Content exists but needs improvement
- **LLM Score**: Usually 40-70%
- **Action**: Expand or enhance existing pages
- **Example**: "You have partial content on 3 pages. Missing: FAQ section with 8 questions"

### ❌ Missing (Red)
- **Meaning**: Content gap detected
- **LLM Score**: N/A or < 40%
- **Action**: Create new comprehensive content
- **Example**: "Content gap detected. Create new content: comparison tables, FAQ section"

## Benefits

### For Content Teams
- 📝 Clear action items with specific URLs to update
- 🎯 Prioritized by potential impact
- 📊 Measurable goals (target LLM scores)

### For SEO Teams
- 🔍 Understand which pages need SEO improvements
- 📈 Track LLM visibility improvements over time
- 🎓 Learn what content structures work best

### For Product/Marketing Teams
- 💡 Discover content gaps in customer journey
- 🛣️ Funnel-aware recommendations (awareness, consideration, conversion)
- 📊 Data-driven content strategy

## Technical Details

### Data Flow
1. **AI Visibility Dashboard** → Analyzes URLs, calculates LLM presence scores
2. **Unified Analyzer** → Combines citation data + URL analysis
3. **Content Opportunities** → Generates smart recommendations
4. **Validation** → Checks against actual website structure
5. **Frontend** → Displays actionable insights

### Recommendation Fields

Each recommendation includes:
- `title`: Actionable recommendation title
- `theme`: Which prompt theme it addresses
- `description`: Why this matters (with data)
- `metricFocus`: Which LLM metric to improve (freshness, answerability, etc.)
- `targetUrls`: Specific pages to improve (empty = create new)
- `contentStructure`: What to add (tables, lists, FAQs, etc.)
- `actions`: Step-by-step implementation guide
- `funnelInsight`: User intent at this funnel stage
- `potentialImpact`: Expected improvement or citation gain
- `priority`: high, medium, low
- `validation`: Status, existing URLs, LLM scores

## Best Practices

### 1. **Fix Before Creating**
- Always check validation status
- If content "exists but partial", improve it before creating new pages
- Low-scoring existing pages are easier wins than new content

### 2. **Focus on Weakest Metrics**
- Check the "Metric Focus" badge
- Prioritize recommendations targeting your weakest areas
- High-priority recommendations usually target scores < 50%

### 3. **Track Improvements**
- Note current LLM scores before making changes
- Re-run AI Visibility analysis after updates
- Compare before/after scores to measure success

### 4. **Batch Similar Work**
- Group recommendations by metric focus
- Update all "freshness" issues together
- Add all FAQ sections in one content sprint

## Troubleshooting

### "No analyzed URLs available for validation"
- **Cause**: URL analysis hasn't been run yet
- **Fix**: Go to AI Visibility Dashboard → Run content analysis

### Recommendations seem generic
- **Cause**: URL analysis data not loaded
- **Fix**: Ensure AI Visibility analysis completed successfully
- **Check**: Dashboard should show LLM presence scores

### Validation always shows "Missing"
- **Cause**: LLM scores are very low (< 40%)
- **Action**: This is correct! Focus on improving those pages first

## Future Roadmap

Coming soon:
- 📊 **Trend tracking**: See how recommendations improve scores over time
- 🔄 **Before/after comparison**: Visual score improvements
- 📋 **Bulk export**: Export recommendations to CSV/PDF
- 🤖 **Auto-prioritization**: AI sorts by (impact × ease)
- 🎯 **Goal setting**: Set target LLM scores for pages

## Questions?

The integration is **automatic** - if you have both URL analysis and citation data, recommendations will be enhanced. No configuration needed!

---

**Summary**: Trends & Insights now provides **specific, measurable, actionable** recommendations by combining citation patterns with URL-level LLM visibility analysis. Fix the right pages, at the right time, with data-driven confidence. 🚀

