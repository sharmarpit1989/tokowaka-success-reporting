# AI Visibility Dashboard - Metrics Guide

## 📖 Overview

This comprehensive guide explains every score and metric in the AI Visibility Dashboard, helping you understand what each measurement means and how to improve it.

---

## 📑 Table of Contents

### Core Metrics
1. [LLM Presence Scores](#-llm-presence-scores) - Content optimization scores
   - Overall LLM Presence Score
   - Freshness Score
   - Answerability Score
   - Query Alignment Score
   - Authority Score
   - Structure Score
   - Snippet Quality Score

2. [Thematic Analysis](#-thematic-analysis) - Prompt grouping and content opportunities
   - Prompt Themes (6 categories)
   - Theme-Level Metrics
   - Content Opportunities
   - Use Cases and Best Practices

3. [Citation Performance Metrics](#-citation-performance-metrics) - Real-world citation tracking
   - Citation Rate
   - Platform Performance
   - Weekly Trends
   - URL Performance

4. [Content Analysis Metrics](#-content-analysis-metrics) - Page-level insights
   - Page Type Classification
   - Word Count
   - AI-Generated Prompts

5. [Visual Analytics](#-visual-analytics-charts) - Charts and graphs
   - Weekly Citation Trend
   - Platform Performance
   - URL Performance Distribution

### Practical Guidance
- [How to Improve Scores](#-how-to-improve-your-scores)
- [Interpreting Combined Metrics](#-interpreting-combined-metrics)
- [Troubleshooting Low Scores](#-troubleshooting-low-scores)
- [Thematic Analysis Quick Reference](#-thematic-analysis-quick-reference)
- [Glossary](#-glossary)
- [Pro Tips](#-pro-tips)

---

## 🎯 LLM Presence Scores

These scores measure how well your content is optimized for discovery and citation by AI language models like ChatGPT, Claude, Perplexity, and others.

### Overall LLM Presence Score

**What it measures:** Your content's overall discoverability and citation-worthiness by AI models.

**How it's calculated:** Weighted average of six sub-metrics:
- **Freshness:** 20% weight
- **Answerability:** 25% weight  
- **Query Alignment:** 15% weight
- **Snippet Quality:** 15% weight
- **Authority:** 15% weight
- **Structure:** 10% weight

**Score interpretation:**
- **80-100% (Excellent):** Highly discoverable by LLMs. Content is well-optimized.
- **60-79% (Good):** Good LLM discoverability with room for improvement.
- **40-59% (Fair):** Moderate LLM discoverability. Significant improvements possible.
- **0-39% (Poor):** Low LLM discoverability. Major improvements required.

**Why it matters:** This is your "north star" metric. Higher scores correlate with more frequent citations by AI models.

---

### 1. Freshness Score

**What it measures:** How current and time-sensitive your content appears.

**Scoring breakdown (100 points total):**

#### Current Year Mentions (30 points max)
- Mentions current year → 25 points
- 5+ mentions of current year → +5 bonus points

**Example:** Content mentioning "2025" multiple times signals it's up-to-date.

#### Freshness Keywords (25 points max)
- Each keyword adds ~3 points (up to 25)
- Keywords: "latest", "new", "updated", "recent", "current", "now", "today", "upcoming", "announced", "released", "this week", "this month"

#### Pricing Information (15 points)
- Has pricing ($ € £ ₹) → 15 points
- Pricing is time-sensitive and signals current information

#### Version Numbers (10 points)
- Has version numbers (v1.2.3, iOS 17, Android 14) → 10 points
- Shows technical content is current

#### Dates Mentioned (10 points max)
- Each date reference adds ~2 points (up to 10)

#### Last Modified Date (15 points max)
- Modified within 7 days → 15 points
- Within 30 days → 12 points
- Within 90 days → 8 points
- Within 180 days → 4 points
- Older than 180 days → 0 points

**Why it matters:** AI models prefer recent information. Fresh content is more likely to be cited, especially for time-sensitive queries.

**Example comparison:**

❌ **Low Score (20%):**
> "Our product helps businesses improve efficiency. Contact us to learn more."

✅ **High Score (85%):**
> "Updated January 2025: Our platform now includes AI-powered analytics. Latest pricing: $99/month. Version 2.4 released this week with new automation features."

---

### 2. Answerability Score

**What it measures:** How well your content directly answers user questions.

**Scoring breakdown (100 points total):**

#### Heading Structure (15 points max)
- Single H1 tag → 5 points (good practice)
- 3+ H2 headings → 5 points (good structure)
- 2+ H3 headings → 5 points (depth)

#### Lists (15 points max)
- Each list adds ~3 points (up to 15)
- AI models love bulleted/numbered lists for easy extraction

#### Tables (10 points max)
- Each table adds ~5 points (up to 10)
- Great for comparison data

#### Questions (20 points max)
- Has questions in text → 10 points
- Has question-based headings → 10 points
- Patterns: "What is...", "How to...", "Why does...", "When should..."

#### Definitions (15 points max)
- Has definition patterns → 5 points base
- Each additional definition → +2 points (up to 15)
- Patterns: "is defined as", "refers to", "means that"

#### Step-by-Step Content (10 points max)
- Has step patterns → 5 points base
- Each step → +1 point (up to 10)
- Patterns: "Step 1:", "First,", "Then,", "Finally,"

#### Comparisons (5 points)
- Has comparison content → 5 points
- Patterns: "vs", "versus", "compared to", "difference between", "pros and cons"

#### Structured Data (10 points max)
- Has JSON-LD → 5 points
- Has answer-specific schema (FAQPage, QAPage, HowTo) → 5 points

#### FAQ Section (5 points bonus)
- Has dedicated FAQ section → 5 points

**Why it matters:** AI models need to extract clear answers. Well-structured, question-answering content is highly citation-worthy.

**Example comparison:**

❌ **Low Score (25%):**
> "Our enterprise solution provides various benefits through innovative technology."

✅ **High Score (90%):**
> **What is AI visibility tracking?**
> 
> AI visibility tracking is defined as monitoring how often your content appears in AI-generated responses. Here's how it works:
> 
> 1. Upload your target URLs
> 2. Track citations across platforms
> 3. Analyze performance trends
> 
> **Key benefits:**
> - Real-time citation tracking
> - Multi-platform support
> - Actionable insights
>
> **ChatGPT vs Perplexity: Which cites more?**
> [comparison table here]

---

### 3. Query Alignment Score

**What it measures:** How well your content aligns with natural language search queries and AI prompts.

**Scoring breakdown (100 points total):**

#### Answer-Worthy Sentences (35 points max)
- **What qualifies:**
  - 40-200 characters long (optimal snippet length)
  - Starts with capital letter
  - Not image captions or CTAs
  
- **Scoring:**
  - 5+ sentences → 35 points (full score)
  - 3-4 sentences → 25 points
  - 1-2 sentences → 15 points
  - 0 sentences → 0 points

#### Meaningful Key Phrases (30 points max)
- **What it analyzes:**
  - 2-3 word combinations
  - Frequency and consistency
  - Excludes common stop words
  
- **Scoring:**
  - 10+ meaningful phrases → 30 points (full score)
  - 5-9 phrases → 20 points
  - 2-4 phrases → 10 points
  - <2 phrases → 0 points

**Example:** If "AI visibility", "citation tracking", "brand mentions" appear frequently, they become strong key phrases.

#### Optimal Sentence Length (15 points max)
- **Ideal for AI snippet extraction:**
  - 80-150 characters → 15 points (perfect!)
  - 60-180 characters → 10 points
  - Outside range → 0 points

#### Conversational Tone (10 points max)
- **What it detects:**
  - "you can", "you should", "you'll", "you're"
  - "let's", "we'll", "here's", "that's"
  - "simply", "easily", "quickly"
  
- **Scoring:**
  - 3+ conversational phrases → 10 points
  - <3 phrases → 0 points

#### Potential Search Queries (10 points max)
- **What it extracts:**
  - Questions: "What is...", "How to...", "Why does..."
  - Question marks in headings
  - Page title as query
  
- **Scoring:**
  - 5+ potential queries → 10 points
  - 2-4 queries → 5 points
  - <2 queries → 0 points

**Why it matters:** This specifically targets how AI models retrieve your content. Content that naturally answers questions users are asking scores higher.

**Example comparison:**

❌ **Low Score (20%)** - Corporate jargon:
> "Our enterprise-grade solution leverages synergistic methodologies to optimize stakeholder engagement through paradigm-shifting frameworks."

✅ **High Score (85%)** - Query-aligned:
> "**How do you track AI citations?**
> 
> You can easily track citations across 15 URLs. Here's what you'll see: which AI platforms mention your content most often, weekly performance trends, and specific prompts that triggered citations. Simply upload your brand presence data, and you'll get instant insights."

---

### 4. Authority Score

**What it measures:** Trust signals and domain authority indicators.

**Scoring breakdown (100 points total):**

#### HTTPS Protocol (20 points)
- Secure connection → 20 points

#### Author Information (15 points)
- Has author attribution (rel="author" or meta author) → 15 points

#### External Links (15 points)
- 3+ external links (shows research/citations) → 15 points

#### Organization Schema (15 points)
- Has Organization or Person structured data → 15 points

#### Contact Information (10 points)
- Has contact details (email, phone, address) → 10 points

#### Professional Domain Setup (5 points)
- Domain starts with "www." → 5 points

#### About Page (10 points)
- Links to /about page → 10 points

#### Privacy/Terms Pages (10 points)
- Has privacy policy or terms of service → 10 points

**Why it matters:** AI models favor authoritative sources. Trust signals increase the likelihood of citation.

**Example authority indicators:**
- ✅ https://www.example.com (secure, www prefix)
- ✅ Author: John Smith, Senior Analyst
- ✅ References: 12 external sources cited
- ✅ Organization schema markup
- ✅ Privacy Policy | Terms | Contact Us

---

### 5. Structure Score

**What it measures:** Content organization and readability.

**Scoring breakdown (100 points total):**

#### Word Count (30 points max)
- **Ideal:** 300-2,000 words → 30 points
- **Acceptable:** 150-3,000 words → 20 points
- **Minimum:** 100+ words → 10 points
- Too short or too long → lower scores

#### Paragraph Count (20 points max)
- **Ideal:** 3-20 paragraphs → 20 points
- **Minimum:** 2+ paragraphs → 10 points

#### Readability (20 points max)
- **What it measures:** Average words per sentence
- **Ideal:** 10-25 words/sentence → 20 points (good readability)
- **Acceptable:** 8-30 words/sentence → 10 points
- Too short (choppy) or too long (hard to read) → lower scores

#### Image Alt Text (15 points max)
- **Calculation:** (Images with alt text / Total images) × 15
- All images have alt text → 15 points
- No images present → 5 points (okay for text content)

#### Internal Linking (15 points max)
- 3+ internal links → 15 points
- 1-2 internal links → 8 points

**Why it matters:** Well-structured content is easier for AI to parse and extract. Good structure improves citation accuracy.

**Example:**
- ✅ 1,200 words across 8 paragraphs
- ✅ Average 18 words per sentence (readable)
- ✅ All 6 images have descriptive alt text
- ✅ 5 internal links to related content

---

### 6. Snippet Quality Score

**What it measures:** How well your content is optimized for search engine and AI snippets.

**Scoring breakdown (100 points total):**

#### First Paragraph (25 points max)
- **Ideal:** 120-160 characters, well-written → 25 points
- **Acceptable:** 80-200 characters → 15 points
- Too short/long or poor quality → 0 points

#### Meta Description (20 points max)
- **Ideal:** 120-160 characters → 20 points
- **Acceptable:** Any length present → 10 points
- Missing → 0 points

#### Meta Title (15 points max)
- **Ideal:** 30-60 characters → 15 points
- **Acceptable:** Any length present → 8 points
- Missing → 0 points

#### Lists (15 points)
- Has well-formatted lists (3-8 items) → 15 points
- Perfect for featured snippets

#### Tables (10 points)
- Has comparison tables → 10 points
- Great for comparison snippets

#### Definitions (5 points)
- Has definition-like paragraphs → 5 points
- Good for "what is" snippets

#### Structured Data (7 points)
- Has JSON-LD markup → 7 points

#### Open Graph Tags (2 points)
- Has og:title and og:description → 2 points

#### Twitter Card (1 point)
- Has twitter:card meta tag → 1 point

**Why it matters:** Optimized snippets increase the chances of your content being selected for AI responses.

**Example:**

✅ **Optimized page:**
```html
<title>AI Citation Tracking Tool - Monitor LLM Mentions | 2025</title>
<meta name="description" content="Track how often AI models cite your content. Get real-time insights across ChatGPT, Claude, Perplexity, and more. Free trial available.">

<h1>AI Citation Tracking Tool</h1>
<p>AI citation tracking helps you monitor brand visibility across large language models. Our tool analyzes 15+ platforms and provides weekly performance reports.</p>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Citation Tracker"
}
</script>
```

---

## 🎨 Thematic Analysis

Thematic Analysis groups user prompts into meaningful themes to help you understand what topics drive citations and identify content gaps.

### What is Thematic Analysis?

**What it measures:** How prompts cluster into topic categories and which themes have citation opportunities.

**How it works:**
1. Analyzes all unique prompts from your brand presence data
2. Groups prompts into themes using keyword matching
3. Calculates citation rates per theme
4. Identifies content opportunities where you're underperforming

**Why it matters:** Understanding prompt themes reveals what questions users are asking and where your content falls short, enabling strategic content creation.

---

### Prompt Themes

The system automatically categorizes prompts into 6 thematic groups:

#### 1. **Pricing & Plans**
- **Funnel Stage:** Conversion (bottom of funnel)
- **Keywords:** cost, price, pricing, plan, subscription, pay, free, trial, discount, refund
- **User Intent:** Ready to buy, comparing options
- **Example Prompts:**
  - "How much does [product] cost?"
  - "What are the pricing plans for [service]?"
  - "Is there a free trial?"

**Why it matters:** These prompts indicate high purchase intent. Strong performance here directly impacts revenue.

---

#### 2. **Getting Started & Tutorials**
- **Funnel Stage:** Awareness (top of funnel)
- **Keywords:** how to, tutorial, guide, learn, beginner, start, basics, introduction, first
- **User Intent:** Learning, education, first-time exploration
- **Example Prompts:**
  - "How to get started with [product]?"
  - "Beginner's guide to [topic]"
  - "What is [concept]?"

**Why it matters:** Captures users at the beginning of their journey. Strong performance builds brand awareness.

---

#### 3. **Features & Capabilities**
- **Funnel Stage:** Consideration (middle of funnel)
- **Keywords:** feature, can i, does it, support, capability, function, tool, option
- **User Intent:** Evaluating functionality
- **Example Prompts:**
  - "Does [product] support [feature]?"
  - "What features does [product] have?"
  - "Can I use [product] for [purpose]?"

**Why it matters:** Users evaluating options. Citations here position you as a viable solution.

---

#### 4. **Comparisons**
- **Funnel Stage:** Consideration (middle of funnel)
- **Keywords:** vs, versus, compare, comparison, alternative, better, difference, between
- **User Intent:** Evaluating competitors
- **Example Prompts:**
  - "[Product A] vs [Product B]"
  - "What's the difference between [X] and [Y]?"
  - "Best alternatives to [competitor]"

**Why it matters:** Users actively choosing between options. Critical for competitive positioning.

---

#### 5. **Troubleshooting & Support**
- **Funnel Stage:** Conversion (retention focus)
- **Keywords:** fix, error, problem, issue, troubleshoot, not working, help, support
- **User Intent:** Solving problems, seeking help
- **Example Prompts:**
  - "How to fix [error]?"
  - "[Product] not working"
  - "Troubleshooting [issue]"

**Why it matters:** Affects customer retention and satisfaction. Poor performance leads to churn.

---

#### 6. **Best Practices**
- **Funnel Stage:** Consideration (middle of funnel)
- **Keywords:** best, optimize, improve, tips, advice, should i, recommend
- **User Intent:** Seeking recommendations
- **Example Prompts:**
  - "Best practices for [topic]"
  - "How to optimize [process]?"
  - "What should I use for [use case]?"

**Why it matters:** Users seeking expert guidance. Citations establish thought leadership.

---

### Theme-Level Metrics

**For each theme, you'll see:**

#### Prompt Count
**What it measures:** Number of unique prompts in this theme.

**Example:** "Pricing & Plans" has 23 unique prompts.

**Interpretation:**
- **High count (>20):** Popular topic, users asking frequently
- **Medium count (10-20):** Steady interest
- **Low count (<10):** Niche topic or emerging interest

---

#### Total Occurrences
**What it measures:** Total times prompts in this theme appeared across all weeks and platforms.

**Example:** 23 prompts appeared 187 total times.

**Why it matters:** Shows sustained interest vs one-time queries.

---

#### Citation Rate
**What it measures:** Percentage of prompts in this theme that cited your content.

**Formula:**
```
Theme Citation Rate = (Prompts that cited your URLs / Total prompts in theme) × 100
```

**Example:**
- Theme: "Features & Capabilities"
- Total prompts: 30
- Prompts that cited you: 12
- **Citation Rate: 40%**

**Benchmark targets:**
- **>60%:** Excellent - You're dominating this theme
- **40-60%:** Good - Strong presence
- **20-40%:** Fair - Room for improvement
- **<20%:** Poor - Major content gap

---

#### Top Cited URLs
**What it measures:** Which of your URLs get cited most for this theme.

**Example:**
```
Pricing & Plans theme:
1. /pricing → 15 citations
2. /plans → 8 citations
3. /free-trial → 5 citations
```

**Why it matters:** Reveals which pages are theme champions. Replicate their approach for other themes.

---

### Content Opportunities

**What they are:** Themes with high prompt volume but low citation rates = gaps you can fill.

**Identification criteria:**
1. **Citation rate < 60%** (room for improvement)
2. **At least 5 prompts** (significant volume)
3. **Appears in 2+ weeks** (consistent interest, not a fluke)

**Metrics per opportunity:**

#### Current Citation Rate
Your current performance in this theme.

**Example:** 18% for "Comparisons" theme

---

#### Potential Gain
**What it measures:** Estimated additional citations if you improve to 75% citation rate.

**Formula:**
```
Potential Gain = Total Occurrences × (Target Rate - Current Rate)
Potential Gain = 150 × (0.75 - 0.18) = 86 additional citations
```

**Why it matters:** Quantifies the opportunity size. Prioritize high-gain themes.

---

#### Priority Level
**How it's assigned:**
- **High:** Potential gain > 20 citations
- **Medium:** Potential gain 10-20 citations
- **Low:** Potential gain < 10 citations

**Why it matters:** Helps you focus on highest-impact opportunities first.

---

#### Sample Prompts
**What they are:** 5 representative prompts from this theme.

**Example for "Pricing" opportunity:**
```
1. "How much does [product] cost per month?"
2. "What are the pricing tiers for [service]?"
3. "Is there a free version of [product]?"
4. "Can I get a discount on [product]?"
5. "[Product] pricing comparison"
```

**Why they matter:** Show exactly what questions your content should answer.

---

#### Currently Performing URLs
**What they are:** Your URLs (if any) that already get citations for this theme.

**Example:**
```
Currently performing for "Comparisons":
- /vs-competitor-a (3 citations)
- /product-comparison (2 citations)
```

**Why it matters:** Learn from what's working. Expand on successful content.

---

### Thematic Analysis Use Cases

#### 1. **Content Gap Identification**

**Scenario:** You have 40 prompts about "Getting Started" but only 12% citation rate.

**Action:**
- Create comprehensive beginner's guide
- Add "How to Get Started" video tutorial
- Write step-by-step onboarding docs

**Expected Impact:** Increase citation rate from 12% → 60% = +48 additional citations

---

#### 2. **Content Prioritization**

**Scenario:** Limited resources, multiple themes need work.

**Analysis:**
```
Theme A: 100 occurrences × 45% gap = 45 potential gain → HIGH priority
Theme B: 30 occurrences × 40% gap = 12 potential gain → LOW priority
```

**Action:** Focus on Theme A first for maximum impact.

---

#### 3. **Competitive Positioning**

**Scenario:** "Comparisons" theme shows 89 prompts, 22% citation rate.

**Insight:** Users are comparing you to competitors, but AI rarely cites you.

**Action:**
- Create "[Your Product] vs [Competitor]" comparison pages
- Add feature comparison tables
- Include pros/cons for each option
- Add pricing comparison charts

**Expected Impact:** Capture competitive searches, improve positioning.

---

#### 4. **Funnel Optimization**

**Analysis by stage:**
```
Awareness (Getting Started): 65% citation rate ✅
Consideration (Features): 28% citation rate ⚠️
Conversion (Pricing): 18% citation rate ❌
```

**Insight:** Losing users in consideration and conversion stages.

**Action:**
1. Create detailed feature comparison guides (consideration)
2. Add transparent pricing calculator (conversion)
3. Include case studies with ROI data (conversion)

---

### How Themes are Detected

**Method:** Keyword matching against predefined patterns.

**Example matching logic:**
```
Prompt: "How much does the premium plan cost?"

Keyword matches:
✓ "how" → Getting Started keywords
✓ "cost" → Pricing keywords
✓ "plan" → Pricing keywords

Match strength:
- Getting Started: 1 match
- Pricing: 2 matches

Result: Categorized as "Pricing & Plans" ✅
```

**Note:** A prompt can only belong to one theme (the one with most keyword matches).

---

### Reading Thematic Analysis Reports

**Example summary:**
```
📊 Thematic Analysis Summary

Total Unique Prompts: 287
Themes Identified: 6

Top Performing Theme:
✅ Getting Started (72% citation rate, 45 prompts)

Biggest Opportunity:
⚠️  Pricing & Plans (18% citation rate, 89 prompts, HIGH priority)
   Potential gain: 51 additional citations

Currently Underserved:
❌ Comparisons (15% citation rate, 34 prompts)
❌ Troubleshooting (22% citation rate, 28 prompts)
```

**How to act on this:**
1. **Maintain excellence** in "Getting Started" (already strong)
2. **Immediate focus** on "Pricing & Plans" (highest impact)
3. **Next priority** for "Comparisons" and "Troubleshooting"

---

### Best Practices for Thematic Content

#### For "Pricing & Plans" Content:
- ✅ Show prices clearly (tables, calculators)
- ✅ Compare all plan tiers side-by-side
- ✅ Include "What's included" for each tier
- ✅ Add FAQ about billing and refunds
- ✅ Mention free trial prominently

#### For "Getting Started" Content:
- ✅ Step-by-step tutorials (numbered lists)
- ✅ Screenshots or videos
- ✅ Assume zero prior knowledge
- ✅ "5 minutes to first result" approach
- ✅ Link to next steps

#### For "Features" Content:
- ✅ Bulleted feature lists with descriptions
- ✅ Use cases for each feature
- ✅ Show features in action (demos)
- ✅ Group related features logically
- ✅ Indicate which plan includes each feature

#### For "Comparisons" Content:
- ✅ Side-by-side comparison tables
- ✅ Pros and cons for each option
- ✅ Be fair to competitors (builds trust)
- ✅ Include pricing comparison
- ✅ "Best for..." recommendations

#### For "Troubleshooting" Content:
- ✅ Common error messages and fixes
- ✅ Step-by-step resolution guides
- ✅ Screenshots of error states
- ✅ "Still not working?" escalation path
- ✅ Searchable FAQ structure

#### For "Best Practices" Content:
- ✅ Expert tips and recommendations
- ✅ "Do this, not that" guidance
- ✅ Real-world examples
- ✅ Performance benchmarks
- ✅ Common pitfalls to avoid

---

### Interpreting Theme Citation Patterns

#### Pattern 1: High Volume, Low Citation
```
Theme: Comparisons
Prompts: 78 unique prompts
Citation Rate: 12%
```

**Diagnosis:** Content gap. Users asking, you're not answering.

**Action:** High-priority content creation opportunity.

---

#### Pattern 2: Low Volume, High Citation
```
Theme: Troubleshooting
Prompts: 8 unique prompts
Citation Rate: 87%
```

**Diagnosis:** Niche topic, but you're the authority.

**Action:** Maintain quality. Consider expanding related content.

---

#### Pattern 3: Declining Citation Rate Over Time
```
Week 1: 45% citation rate
Week 2: 38% citation rate
Week 3: 28% citation rate
```

**Diagnosis:** Content becoming outdated or competitors improving.

**Action:** Refresh content, update information, improve comprehensiveness.

---

#### Pattern 4: Strong Performance Across All Themes
```
All themes: 55-75% citation rates
```

**Diagnosis:** Well-rounded content strategy.

**Action:** Focus on conversion optimization and content depth.

---

### Limitations and Considerations

**1. Keyword-Based Detection:**
- Current implementation uses predefined keywords
- Some prompts may not fit neatly into themes
- Can miss nuanced categorizations

**2. Theme Overlap:**
- Prompts can touch multiple themes
- System assigns to best-matching single theme
- Some information loss in edge cases

**3. Emerging Topics:**
- New topics may not match existing themes
- Requires periodic theme definition updates
- Monitor "uncategorized" prompts

**4. Domain-Specific Nuances:**
- Theme relevance varies by industry
- Some businesses need custom themes
- Default themes work for most use cases

---

## 📊 Citation Performance Metrics

These metrics track how often AI models actually cite your content in real-world scenarios.

### Citation Rate (Primary Metric)

**What it measures:** The percentage of AI prompts that resulted in at least one citation of your target URL.

**Formula:**
```
Citation Rate = (Unique prompts with citation / Total unique prompts) × 100
```

**Example:**
- Total prompts executed: 100
- Prompts that cited your URL: 15
- **Citation Rate: 15%**

**Important notes:**
- Based on **unique prompts**, not total rows
- A prompt that cites your URL 5 times still counts as 1
- Calculated per URL, per platform, per week

**Benchmark targets:**
- **>20%:** Excellent - Your content is highly relevant
- **10-20%:** Good - Strong presence
- **5-10%:** Fair - Room for improvement
- **<5%:** Needs work - Content optimization required

---

### Selected URL Rate vs Domain Rate

#### Selected URL Rate
**What it measures:** Citation rate for your specific target URLs only.

**Example:**
- You track: lovesac.com/sactionals
- AI cites: lovesac.com/sactionals → **Counts**
- AI cites: lovesac.com/other-page → Doesn't count

#### Domain Citation Rate
**What it measures:** Citation rate for ANY page on your domain.

**Example:**
- Your domain: lovesac.com
- AI cites: lovesac.com/sactionals → **Counts**
- AI cites: lovesac.com/about → **Counts**
- AI cites: lovesac.com/contact → **Counts**

**Why both matter:**
- **Selected URL Rate:** Shows if your targeted content is working
- **Domain Rate:** Shows overall brand visibility
- **Gap between them:** Indicates if other pages are getting more citations

---

### Platform Performance

**What it measures:** How citation rates vary across different AI platforms.

**Tracked platforms:**
- ChatGPT (Free)
- ChatGPT (Paid/Plus)
- Claude
- Perplexity
- Gemini
- And others...

**Why it matters:** Different AI models have different retrieval algorithms. Understanding which platforms cite you helps prioritize optimization efforts.

**Example insights:**
- Perplexity cites you 23% → Great for search-focused queries
- ChatGPT-paid cites you 8% → Needs improvement for conversational AI
- Claude cites you 15% → Solid technical content performance

---

### Weekly Trends

**What it measures:** How citation rates change over time.

**Key metrics:**
- **Week-over-week change:** Are you improving?
- **Best performing week:** What was different?
- **Worst performing week:** What went wrong?
- **Trend direction:** Upward, downward, or stable

**Why it matters:** Tracks the impact of your content optimizations and identifies seasonal patterns.

---

### Citations by URL

**What it measures:** Which specific URLs in your tracking list perform best.

**Metrics per URL:**
- Total citations received
- Citation rate (%)
- Unique prompts that mentioned it
- Top citing platforms
- Weekly performance trend

**Why it matters:** Identifies your star content and pages that need improvement.

**Example:**
| URL | Citation Rate | Top Platform | Trend |
|-----|---------------|--------------|-------|
| /product-guide | 28% | Perplexity | ↗️ +5% |
| /pricing | 18% | ChatGPT | ↔️ Stable |
| /features | 9% | Claude | ↘️ -3% |
| /blog/new-post | 3% | All | ↘️ New |

---

## 📈 Content Analysis Metrics

### Page Type Classification

**What it measures:** What type of page your content represents.

**Types detected:**
- **Product Page:** E-commerce, product details
- **Category Page:** Product listings, collections
- **Blog/Article:** Long-form content, news
- **How-To/Guide:** Instructional content
- **About Page:** Company information
- **Landing Page:** Campaign-specific pages
- **FAQ Page:** Question and answer format
- **Documentation:** Technical documentation

**Confidence levels:**
- **High:** >80% confident in classification
- **Medium:** 50-80% confident
- **Low:** <50% confident

**Why it matters:** Each page type has different optimal scoring weights. A product page needs strong snippet quality, while a guide needs high answerability.

---

### Word Count

**What it measures:** Total words on the page (excluding navigation, footer, etc.).

**Benchmarks by page type:**
- **Product pages:** 300-800 words
- **Blog articles:** 1,000-2,500 words
- **How-to guides:** 800-2,000 words
- **Landing pages:** 400-1,200 words

**Why it matters:** Both too little and too much content can hurt discoverability. AI models prefer comprehensive but concise answers.

---

### AI-Generated Prompts

**What it measures:** Sample prompts that AI might use to discover your content.

**Types generated:**

#### Awareness Stage (Top of Funnel)
Questions users ask when learning about a topic.

**Example:** "What is modular furniture?"

#### Consideration Stage (Middle of Funnel)
Questions users ask when evaluating options.

**Example:** "How does Lovesac Sactionals compare to traditional sofas?"

#### Conversion Stage (Bottom of Funnel)
Questions users ask when ready to buy.

**Example:** "Where can I buy Lovesac Sactionals covers?"

**Why it matters:** These prompts help you understand what questions your content should answer to maximize citations.

---

## 🎨 Visual Analytics Charts

### Weekly Citation Trend (Line Chart)

**What it shows:** Average citation rate over time.

**How to use it:**
- Look for upward trends → Your optimizations are working
- Spot drops → Investigate what changed
- Identify seasonal patterns

---

### Platform Performance (Bar Chart)

**What it shows:** Citation rates across different AI platforms.

**How to use it:**
- Identify which platforms cite you most
- Focus optimization on underperforming platforms
- Benchmark against your top performer

---

### URL Performance Distribution (Doughnut Chart)

**What it shows:** How many URLs fall into each performance tier.

**Tiers:**
- **Excellent (>50%):** Top performers
- **Good (25-50%):** Strong performers
- **Fair (10-25%):** Average performers
- **Poor (5-10%):** Needs improvement
- **Very Poor (<5%):** Requires attention

**How to use it:**
- **Many in "Very Poor"?** → Content strategy needs overhaul
- **Most in "Fair/Good"?** → Push them to "Excellent"
- **Many in "Excellent"?** → Analyze what makes them successful

---

### URL Comparison Over Time (Multi-Line Chart)

**What it shows:** Performance trends for selected URLs side-by-side.

**How to use it:**
- Compare similar content types
- Identify which URL strategies work better
- Spot correlations (e.g., all URLs drop on same week = platform change)

---

## 🎯 How to Improve Your Scores

### Quick Wins (Easy, High Impact)

1. **Add current year mentions** → Boosts Freshness by 25-30%
2. **Write a 130-character meta description** → Boosts Snippet Quality by 20%
3. **Add 3-5 question-based H2 headings** → Boosts Answerability by 20%
4. **Use conversational language** → Boosts Query Alignment by 10%
5. **Add JSON-LD structured data** → Boosts multiple scores

### Medium Effort, High Impact

1. **Create an FAQ section** → Boosts Answerability + Query Alignment
2. **Add 3-8 item bulleted lists** → Boosts Structure + Snippet Quality
3. **Write step-by-step instructions** → Boosts Answerability
4. **Add comparison tables** → Boosts Snippet Quality
5. **Include author information and external citations** → Boosts Authority

### Long-term Strategy

1. **Monitor citation trends weekly** → Identify what content works
2. **A/B test different content approaches** → Use URL comparison charts
3. **Optimize for top-performing platforms** → Focus where you get best ROI
4. **Update old content** → Refresh dates and information
5. **Create comprehensive guides** → 1,000-2,000 words with all elements

---

## 📖 Interpreting Combined Metrics

### Strong Profile Example

```
Overall LLM Presence: 78% (Good)
├─ Freshness: 85% ✅
├─ Answerability: 82% ✅
├─ Query Alignment: 75% ✅
├─ Authority: 70% ⚠️  (can improve)
├─ Structure: 80% ✅
└─ Snippet Quality: 76% ✅

Citation Rate: 22% ✅
Domain Rate: 31% ✅ (other pages performing well)
Top Platform: Perplexity (32% citation rate)
Trend: ↗️ +8% over last 4 weeks
```

**Diagnosis:** Excellent content that's trending up. Focus on improving Authority score by adding author info and external citations.

---

### Weak Profile Example

```
Overall LLM Presence: 34% (Poor)
├─ Freshness: 15% ❌ (no current year, old dates)
├─ Answerability: 45% ⚠️  (lacks structure)
├─ Query Alignment: 22% ❌ (too formal, no questions)
├─ Authority: 40% ⚠️
├─ Structure: 38% ❌ (too short, no lists)
└─ Snippet Quality: 25% ❌ (no meta description)

Citation Rate: 3.2% ❌
Domain Rate: 8% ⚠️
Top Platform: ChatGPT-free (5% citation rate)
Trend: ↔️ Flat
```

**Diagnosis:** Needs comprehensive overhaul. Start with quick wins: add current year, write conversational FAQ section, create meta description, add bulleted lists.

---

## 🆘 Troubleshooting Low Scores

### "My Freshness score is low"
✅ **Fix:**
- Add current year prominently
- Include "Updated [Month] 2025" at top
- Add pricing if applicable
- Include version numbers for products
- Update meta "last-modified" date

### "My Answerability score is low"
✅ **Fix:**
- Add question-based H2 headings
- Create FAQ section
- Add numbered lists (steps)
- Include comparison content
- Add JSON-LD FAQPage schema

### "My Query Alignment score is low"
✅ **Fix:**
- Write in conversational tone ("you", "here's how")
- Add question marks in headings
- Create 120-160 character answer sentences
- Use consistent key phrases
- Adopt second-person perspective

### "My Authority score is low"
✅ **Fix:**
- Add author byline
- Include 3+ external citations
- Add privacy policy and terms links
- Include contact information
- Add Organization structured data
- Use HTTPS

### "My Structure score is low"
✅ **Fix:**
- Aim for 500-1,500 words
- Break into 5-10 paragraphs
- Add bulleted/numbered lists
- Write 15-20 word sentences
- Add alt text to all images
- Include 3+ internal links

### "My Snippet Quality score is low"
✅ **Fix:**
- Write 130-character meta description
- Optimize first paragraph (120-160 chars)
- Create 3-8 item lists
- Add comparison table
- Include JSON-LD structured data
- Add Open Graph tags

### "My Citation Rate is low despite good LLM scores"
**Possible reasons:**
1. **Content-market mismatch:** Your content doesn't match what users ask
2. **Niche topic:** Few people query about this topic
3. **Strong competition:** Other sources rank higher
4. **Platform-specific issues:** Optimize for specific platforms

✅ **Fix:**
- Review AI-generated prompts → Are these questions your content answers?
- Check top-performing URLs → What makes them different?
- Look at platform breakdown → Focus on platforms where you perform best
- Update older content with current information

---

## 📋 Thematic Analysis Quick Reference

| Theme | Funnel Stage | Typical Citation Target | Content Type |
|-------|--------------|------------------------|--------------|
| Pricing & Plans | Conversion | >60% | Pricing pages, plan comparisons, calculators |
| Getting Started | Awareness | >50% | Tutorials, guides, onboarding docs |
| Features | Consideration | >55% | Feature lists, capability pages, demos |
| Comparisons | Consideration | >50% | Comparison tables, "vs" pages, alternatives |
| Troubleshooting | Conversion | >65% | FAQs, error guides, support docs |
| Best Practices | Consideration | >50% | Expert guides, tips, recommendations |

**Quick Decision Matrix:**

**If theme has:**
- High volume (>30 prompts) + Low citation (<30%) = 🔥 **URGENT** priority
- High volume (>30 prompts) + Medium citation (30-50%) = ⚠️ **HIGH** priority  
- Medium volume (15-30 prompts) + Low citation (<30%) = 📋 **MEDIUM** priority
- Low volume (<15 prompts) + Low citation (<30%) = 📌 **LOW** priority
- Any volume + High citation (>60%) = ✅ **MAINTAIN** (already strong)

---

## 📚 Glossary

**Citation:** When an AI model includes your URL in its response to a user prompt.

**Theme:** A topical category that groups related prompts together (e.g., "Pricing & Plans").

**Theme Citation Rate:** Percentage of prompts in a theme that cited your content.

**Content Opportunity:** A theme with high prompt volume but low citation rate, indicating a content gap.

**Prompt:** A question or request submitted to an AI model by a user.

**Unique Prompts:** Distinct prompts (duplicates removed) used for citation rate calculation.

**Target URL:** A specific URL you're tracking for citations.

**Domain Rate:** Citation rate for any page on your domain, not just tracked URLs.

**LLM:** Large Language Model (e.g., GPT-4, Claude, Gemini).

**Structured Data:** Machine-readable code (JSON-LD) that helps AI understand your content.

**Featured Snippet:** Highlighted answer box at top of search results (also used by AI).

**Schema Markup:** Structured data vocabulary (schema.org) for web content.

---

## 🔗 Additional Resources

- **External Tool:** This dashboard uses the [LLM Presence Tracker](https://github.com/your-repo/llm-presence-tracker) for content analysis
- **Schema Reference:** https://schema.org
- **Open Graph Guide:** https://ogp.me/
- **JSON-LD Guide:** https://json-ld.org/

---

*Last Updated: December 2025*
*Version: 1.1 - Added Thematic Analysis section*

---

## 💡 Pro Tips

1. **Focus on one metric at a time** → Don't try to fix everything at once
2. **Monitor weekly trends** → Consistent improvement over time beats sporadic changes
3. **Learn from your best URLs** → Replicate what works
4. **Update regularly** → Freshness is the easiest score to maintain
5. **Test and iterate** → Use the URL comparison chart to validate changes
6. **Use thematic analysis for strategic planning** → Identify which topics need content investment
7. **Prioritize high-gain opportunities** → Focus on themes with most potential citations
8. **Create theme-specific content** → One comprehensive page per major theme
9. **Monitor theme trends over time** → Track if your content improvements increase theme citation rates
10. **Balance funnel coverage** → Ensure you have strong content at awareness, consideration, and conversion stages

**Remember:** These metrics are interconnected. Improving one often improves others. Start with quick wins, then tackle larger improvements systematically. Use thematic analysis to guide your content strategy and focus on opportunities with the highest potential impact.

