# Content Opportunities - Quick Start Guide

## 🚀 How to Use This Feature

### Prerequisites
1. ✅ You've uploaded target URLs (CSV/Excel with your website URLs)
2. ✅ You've uploaded brand presence data (Excel files from AI platforms)
3. ✅ You're on the **AI Visibility Analysis** page (Step 3: Dashboard)

### Step-by-Step Usage

#### 1. **Locate the Feature**
- Navigate to: **AI Visibility Analysis** page
- You'll see a new **"Content Opportunities"** card below "Trends & Insights"
- It has a green border and a lightbulb icon 💡

#### 2. **Expand and Analyze**
```
Click on the "Content Opportunities" card
↓
System analyzes your brand presence data (15-30 seconds)
↓
Results appear with 4 sections
```

#### 3. **Review Summary Stats**
You'll see 4 key metrics at the top:
- **Unique Prompts** - How many different prompts were tested
- **Themes Identified** - How many topic groups were found
- **Opportunities** - How many content gaps exist
- **Recommendations** - How many AI suggestions generated

#### 4. **Explore Thematic Analysis**
Each theme card shows:
- **Theme name** (e.g., "Pricing & Plans", "Getting Started")
- **Citation rate** - How often your URLs get cited for this theme
- **Color coding:**
  - 🔴 Red (0-30%): High opportunity
  - 🟡 Yellow (30-60%): Medium opportunity
  - 🟢 Green (60%+): Performing well
- **Funnel stage** - Awareness, Consideration, or Conversion

**Click on a theme to expand and see:**
- Sample prompts from that theme
- Your top-performing URLs for that theme
- Citation statistics

#### 5. **Read AI Recommendations**
Each recommendation includes:

**Priority Badge:**
- 🔴 High Priority - Address first
- 🟡 Medium Priority - Important but not urgent
- 🟢 Low Priority - Nice to have

**Content Structure:**
- Visual icons showing recommended elements:
  - 📊 Comparison tables (how many)
  - 📝 Structured lists (how many)
  - ⚡ Step-by-step guides (how many steps)
  - ❓ FAQs (how many questions)
  - 📈 Examples (how many)

**Action Items:**
- Click "Action Items (X)" to expand
- See specific, step-by-step actions to take

**Funnel Insight:**
- Explains what users expect at this stage
- Helps you understand user intent

**Potential Impact:**
- Estimated citation gain (e.g., "+18 citations/week")

#### 6. **Take Action**
Based on recommendations:
1. **Prioritize** - Start with high-priority recommendations
2. **Create content** - Follow the specific structure suggestions
3. **Implement** - Add tables, lists, FAQs as recommended
4. **Upload new data** - After a few weeks, upload fresh brand presence data
5. **Re-analyze** - See if your citation rates improved

---

## 📊 Example Walkthrough

### Scenario: You see this recommendation

> **🔴 High Priority: Create Comprehensive Comparison Content for "Video Editing Tutorials"**
> 
> **Theme:** Getting Started & Tutorials  
> **Current Citation Rate:** 35%  
> **Potential Gain:** +18 citations/week  
> 
> **Content Structure:**
> - 📊 3 comparison tables
> - 📝 2 structured lists
> - 📈 6 examples
> 
> **Actions:**
> - Create: `/resources/video-editing-workflow-guide`
> - Add comparison table: Software features (Premiere vs Final Cut vs DaVinci)
> - Add numbered list: "10-Step Professional Workflow"
> - Include FAQ: "Which software is right for me?"
> 
> **Funnel Insight:** Users at consideration stage need structured comparisons to evaluate options.

### What to Do:

1. **Create the page:** `/resources/video-editing-workflow-guide`

2. **Add 3 comparison tables:**
   - Table 1: Software features comparison
   - Table 2: Pricing tiers comparison
   - Table 3: System requirements comparison

3. **Add 2 numbered lists:**
   - "10-Step Professional Video Editing Workflow"
   - "5 Common Mistakes to Avoid"

4. **Add 6 examples:**
   - Example workflow for different use cases
   - Before/after examples

5. **Add FAQ section:**
   - "Which software is right for beginners?"
   - "How much RAM do I need?"
   - "What's the best workflow for 4K?"
   - etc.

6. **Wait 1-2 weeks**, upload fresh brand presence data, and check if your citation rate improved!

---

## 🎯 Understanding the Data

### Citation Rates Explained

**Per-Theme Citation Rate:**
- Percentage of prompts in that theme where YOUR URLs got cited
- Example: "Pricing & Plans" = 78% means your URLs were cited in 78% of pricing-related prompts

**What's Good?**
- **70%+** = Excellent! You're dominating this theme
- **50-70%** = Good, but room to improve
- **30-50%** = Moderate opportunity, focus here
- **0-30%** = High opportunity, create content for this theme

### Funnel Stages

**Awareness:**
- Users are exploring and learning
- Need: Educational content, "what is X?", "how does X work?"
- Content type: Guides, tutorials, introductions

**Consideration:**
- Users are comparing alternatives
- Need: Comparisons, feature lists, pros/cons
- Content type: Comparison tables, evaluation guides

**Conversion:**
- Users are ready to act
- Need: Pricing, plans, implementation steps
- Content type: Pricing pages, getting-started guides, FAQs

---

## 🔄 Best Practices

### ✅ Do This:
- **Start with high-priority recommendations** - Maximum impact
- **Implement specific structures** - Don't just add text, add tables/lists/FAQs
- **Match funnel stage** - Create content that matches user intent
- **Track improvements** - Re-analyze after 2-4 weeks
- **Learn from winners** - Study your high-performing URLs

### ❌ Avoid This:
- **Ignoring structure** - "Just adding more text" won't help
- **Wrong funnel stage** - Don't add pricing tables to awareness content
- **One-and-done** - This is iterative, keep improving
- **Copying competitors** - Focus on learning patterns, not copying
- **Skipping FAQs** - LLMs love FAQ sections

---

## 🆘 Troubleshooting

### "Content Opportunities card shows 'No analysis available'"
- **Cause:** No brand presence data uploaded yet
- **Fix:** Upload brand presence Excel files in Step 2

### "Analysis takes too long (>60 seconds)"
- **Cause:** Large dataset (many prompts)
- **Fix:** Wait a bit longer, or refresh and try again

### "AI recommendations say 'not AI generated'"
- **Cause:** Azure OpenAI not configured
- **Fix:** 
  - You'll still get structured recommendations (still useful!)
  - To enable AI: Set `AZURE_OPENAI_KEY` in backend `.env`

### "I see a theme but no URLs performing well"
- **Meaning:** Content gap! None of your URLs are getting cited
- **Action:** This is your biggest opportunity - create content for this theme

### "Recommendations seem generic"
- **If AI enabled:** Try regenerating (click "Regenerate" button)
- **If AI disabled:** Configure Azure OpenAI for personalized recommendations

---

## 📈 Measuring Success

### After implementing recommendations:

1. **Wait 1-2 weeks** for fresh data collection
2. **Upload new brand presence files**
3. **Re-run Content Opportunities analysis**
4. **Compare:**
   - Theme citation rates (should increase)
   - Number of high-opportunity themes (should decrease)
   - Your top-performing URLs (should include new pages)

### Success looks like:
- ✅ "Pricing & Plans" citation rate: 78% → 85%
- ✅ "Video Tutorials" moved from high opportunity (35%) to medium (52%)
- ✅ New URL `/resources/video-guide` appears in top performers
- ✅ Total unique prompts citing you: 45 → 68

---

## 🎓 Pro Tips

1. **Focus on structure over length** - 3 tables beats 2000 words of text
2. **Use clear headings** - H2/H3 with questions work great
3. **Add FAQs everywhere** - LLMs cite FAQ sections frequently
4. **Tables for comparisons** - Always use tables, not paragraphs
5. **Lists for steps** - Numbered lists for processes, bulleted for features
6. **Examples are gold** - "For example..." sections get cited
7. **Match intent exactly** - If prompt asks "how much", show pricing table
8. **Update regularly** - LLMs favor fresh content (check Freshness score)

---

## 🤝 Support

If you have questions:
1. Check the detailed documentation: `CONTENT_OPPORTUNITIES_FEATURE.md`
2. Look at sample recommendations in the UI
3. Start small: Pick 1 high-priority recommendation and implement it
4. Measure results after 2 weeks

**Remember:** This is about learning and improving, not competing. Focus on creating great content that answers user questions effectively! 🚀

