# Content Opportunities Feature

## 🎯 Overview

A comprehensive AI-powered feature that analyzes prompt-level citation patterns from brand presence data to provide actionable content recommendations. Instead of focusing on competition, this feature helps users discover content gaps, learn from successful patterns, and create better content to improve LLM citations.

## ✨ Key Capabilities

### 1. **Prompt-Level Citation Analysis**
- Analyzes every unique prompt in your brand presence data
- Tracks citation rates for your URLs vs other URLs
- Identifies consistency patterns (which prompts appear week over week)
- Calculates potential citation gains for each content opportunity

### 2. **Thematic Grouping**
- Automatically groups prompts into themes using keyword analysis
- Identifies 6 main themes:
  - Pricing & Plans (conversion)
  - Getting Started & Tutorials (awareness)
  - Features & Capabilities (consideration)
  - Comparisons (consideration)
  - Troubleshooting & Support (conversion)
  - Best Practices (consideration)

### 3. **Content Structure Analysis**
- Compares high-performing vs low-performing content
- Detects content elements that correlate with citations:
  - Comparison tables
  - Numbered/bulleted lists
  - Step-by-step guides
  - Concrete examples
  - Pricing information
  - FAQs

### 4. **AI-Generated Recommendations**
- Provides 5-7 specific, actionable content recommendations
- Each recommendation includes:
  - **Title**: Clear, actionable description
  - **Theme**: Which prompt theme this addresses
  - **Description**: Why this opportunity matters
  - **Content Structure**: Specific elements to include (e.g., "3 tables, 2 lists, 5 steps")
  - **Action Items**: Step-by-step what to create/improve
  - **Funnel Insight**: What users expect at this stage (awareness/consideration/conversion)
  - **Potential Impact**: Estimated citation gains

## 🏗️ Architecture

### Backend Services

#### 1. **`promptAnalyzer.js`**
- Analyzes prompt-level citation patterns
- Groups prompts into themes
- Identifies content opportunities
- **Key Functions:**
  - `analyzePromptPatterns()` - Main analysis function
  - `groupPromptsIntoThemes()` - Thematic grouping
  - `identifyContentOpportunities()` - Gap detection

#### 2. **`contentPatternAnalyzer.js`**
- Analyzes content structure patterns
- Compares high vs low performing content
- Generates structural recommendations
- **Key Functions:**
  - `analyzeContentPatterns()` - Main pattern analysis
  - `analyzeAnswerStructures()` - Infer content elements
  - `generateStructuralRecommendations()` - Create recommendations

#### 3. **`contentOpportunityAI.js`**
- Generates AI-powered recommendations using Azure OpenAI
- Falls back to structured recommendations if AI unavailable
- **Key Functions:**
  - `generateContentRecommendations()` - Main AI generation
  - `buildPrompt()` - Constructs detailed prompt for AI
  - `generateFallbackRecommendations()` - Non-AI fallback

### API Endpoint

**`POST /api/unified/:projectId/content-opportunities`**
- Loads citation data for the project
- Runs prompt analysis
- Runs content pattern analysis
- Generates AI recommendations
- Returns comprehensive analysis

**Response Format:**
```json
{
  "promptAnalysis": {
    "totalUniquePrompts": 150,
    "themes": [ /* array of theme objects */ ],
    "opportunities": [ /* array of opportunity objects */ ]
  },
  "contentPatterns": {
    "highPerforming": { /* structure metrics */ },
    "lowPerforming": { /* structure metrics */ },
    "structuralRecommendations": [ /* array */ ]
  },
  "aiRecommendations": [ /* array of AI-generated recs */ ],
  "isAIGenerated": true,
  "generatedAt": "2024-12-10T..."
}
```

### Frontend Component

**`ContentOpportunities.jsx`**
- Displays comprehensive analysis in collapsible card
- Shows 4 summary stats (unique prompts, themes, opportunities, recommendations)
- Theme analysis with expandable cards showing:
  - Citation rates
  - Sample prompts
  - Top performing URLs
- AI recommendations with:
  - Priority badges (high/medium/low)
  - Content structure visualization
  - Expandable action items
  - Funnel insights
- Content structure comparison (high vs low performing)

## 📊 User Experience Flow

1. **User uploads brand presence data** (already done in Step 2)
2. **User navigates to AI Visibility Analysis dashboard**
3. **Content Opportunities card appears** (collapsed by default)
4. **User expands the card** → System analyzes data (15-30 seconds)
5. **User sees:**
   - Summary stats
   - 6 thematic groups with citation rates
   - Specific AI recommendations with action items
   - Content structure comparison

## 🎓 Educational Focus

### What Users Learn:

✅ **"Your pricing content is winning - here's what makes it work"**
- Shows citation rate: 78%
- Highlights: Clear tables, FAQs, structured comparisons
- Recommendation: Apply this structure to other sections

✅ **"You're missing 47 'video tutorial' prompts - here's the gap"**
- Current citation rate: 35%
- Potential gain: +18 citations/week
- Sample prompts shown with citation patterns

✅ **"Top pages for this topic use 3 tables + 2 lists - yours have 0"**
- High-performing: 85% have comparison tables
- Your content: 0% have comparison tables
- Recommendation: Add specific comparison tables

✅ **"Create this specific content to capture more citations"**
- Exact content type: "Complete Video Editing Workflow Guide"
- Structure: 3 comparison tables, 2 numbered lists, 8 FAQs
- Funnel insight: "Users at consideration stage need structured comparisons"

### What Users DON'T See:

❌ "Competitor X is beating you"
❌ "You're losing to this URL"
❌ Competitive framing or adversarial language

## 🔧 Technical Implementation Details

### Prompt Analysis Algorithm

1. **Group by unique prompt** - Create a map of all unique prompts
2. **Track citations** - For each prompt, count:
   - How many times your URLs were cited
   - How many times any domain URL was cited
   - Which specific URLs were cited
3. **Calculate rates** - Citation rate = (times your URL cited) / (total occurrences)
4. **Group into themes** - Keyword matching against theme definitions
5. **Identify opportunities** - Themes with:
   - Citation rate < 60%
   - At least 5 prompts
   - Appears in at least 2 weeks

### Content Pattern Analysis

1. **Separate prompts** by performance level (high: >60%, low: <40%)
2. **Analyze LLM answers** to infer content structure:
   - Look for keywords like "comparison", "table", "step 1", "example"
   - These indicate the cited content had those structures
3. **Compare patterns** - High vs low performing
4. **Generate recommendations** - If high-performing content has significantly more of a structure element (e.g., +15% more tables), recommend adding that element

### AI Prompt Engineering

The AI prompt includes:
- **Context**: Domain, URL count, total prompts, themes discovered
- **Thematic Analysis**: Top 5 themes with citation rates and sample prompts
- **Opportunity Gaps**: Top 5 opportunities with potential gains
- **Content Structure Analysis**: Comparison of high vs low performing patterns
- **Task Instructions**: Generate 5-7 specific, actionable recommendations
- **Critical Rules**: Focus on creating/enhancing, not competing; include structural details; be funnel-aware
- **Output Format**: JSON array with specific structure

## 📈 Expected Impact

### User Benefits:
- **Discover content gaps** they didn't know existed
- **Learn from success patterns** (what's working and why)
- **Get specific action items** (not vague advice)
- **Understand user intent** (funnel-aware recommendations)
- **Prioritize efforts** (high/medium/low priority + potential impact)

### Example Recommendations:

**High Priority:**
> **Create Comprehensive Comparison Content for "Video Editing Tutorials"**
> 
> **Theme:** Getting Started & Tutorials
> 
> **Description:** 47 prompts in this theme tested over 4 weeks. Your current citation rate is 35% vs top-performing URLs at 75%. By creating structured comparison content, you could gain ~18 more citations per week.
> 
> **Content Structure:**
> - 3 comparison tables
> - 2 structured lists
> - 6-8 embedded examples
> 
> **Actions:**
> - Create `/resources/video-editing-workflow-guide`
> - Add comparison table: Premiere Pro vs Final Cut vs DaVinci (features, pricing, use cases)
> - Add numbered list: "10-Step Professional Video Editing Workflow"
> - Include FAQ section: "Which plan is right for me?", "What hardware do I need?"
> 
> **Funnel Insight:** Users at consideration stage are comparing alternatives and need structured comparisons, feature lists, and evaluation criteria.
> 
> **Potential Impact:** +18 citations/week

## 🚀 Future Enhancements

1. **Real-time tracking** - Monitor which recommendations improve citation rates
2. **Content templates** - Generate actual content drafts based on recommendations
3. **Competitive benchmarking** - Optional: show how industry averages compare
4. **Prompt similarity** - Use embeddings to find related prompts across themes
5. **Weekly reports** - Email digest of new opportunities
6. **Success stories** - Track which content improvements worked best

## 🎯 Success Metrics

Track these to measure feature success:
- **Recommendations implemented** - How many users act on recommendations
- **Citation rate improvements** - Week-over-week changes after implementation
- **Theme coverage** - Are users creating content for low-citation themes?
- **User engagement** - Time spent in Content Opportunities section
- **Content created** - New pages added based on recommendations

## 🔐 Configuration

### Required:
- Brand presence data uploaded (Excel files)
- Target URLs defined

### Optional:
- **Azure OpenAI** configured for AI-generated recommendations
  - Without: Uses structured fallback recommendations
  - With: Gets personalized, natural-language recommendations

## 📝 Notes

- Analysis runs on-demand (not cached) for freshness
- First analysis may take 15-30 seconds
- Recommendations regenerate each time for latest data
- Works with existing brand presence data format
- No changes needed to data collection process

---

**Built:** December 2024  
**Status:** ✅ Complete and Integrated  
**Location:** AI Visibility Analysis → Content Opportunities card

