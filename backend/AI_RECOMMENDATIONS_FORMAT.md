# AI Recommendations Format Specification

## Overview

When generating AI-powered recommendations, the backend should return a **structured JSON array** instead of plain text. This ensures consistent, clean formatting on the frontend.

---

## Expected Format

### Basic Structure

```json
[
  {
    "title": "Short, clear recommendation title",
    "description": "Detailed explanation of why this matters and what it will achieve",
    "actions": [
      "Specific action item 1",
      "Specific action item 2",
      "Specific action item 3"
    ],
    "priority": "high"
  }
]
```

---

## Field Specifications

### `title` (Required)
- **Type:** String
- **Description:** A clear, concise title for the recommendation
- **Length:** 5-15 words recommended
- **Format:** Title Case
- **Examples:**
  - ✅ "Enhance Answerability with Clear Question Headings"
  - ✅ "Optimize Snippet Quality with Structured Data"
  - ✅ "Add Step-by-Step Instructions for Cover Selection"
  - ❌ "optimization" (too vague)
  - ❌ "You should really consider maybe improving the page structure if possible" (too long)

### `description` (Optional but Recommended)
- **Type:** String
- **Description:** Explains the context, current state, and expected benefit
- **Length:** 1-3 sentences
- **Format:** Complete sentences
- **Examples:**
  - ✅ "Currently, there are questions on the page, but no question headings. Adding specific question headings will improve answerability and help users find answers quickly."
  - ✅ "The page lacks structured data, which can enhance snippet quality. Implementing schema markup will help search engines display better previews."
  - ❌ "bad seo" (not descriptive)
  - ❌ "The page has some issues that need to be fixed..." (too vague)

### `actions` (Optional but Recommended)
- **Type:** Array of Strings
- **Description:** Specific, actionable steps the user should take
- **Length:** 2-5 items recommended
- **Format:** Each item should start with an action verb
- **Examples:**
  - ✅ `["Add H2: 'How Do I Choose the Right Cover?'", "Include FAQ section with schema markup", "Use descriptive alt text for all images"]`
  - ✅ `["Implement JSON-LD schema for products", "Add price, availability, and image data", "Define each product variant clearly"]`
  - ❌ `["fix it", "make better"]` (not specific)
  - ❌ `["You could try adding some headings maybe"]` (not actionable)

### `priority` (Optional)
- **Type:** String (enum)
- **Values:** `"high"`, `"medium"`, `"low"`
- **Description:** Indicates the importance/urgency of this recommendation
- **Default:** If not provided, no priority indicator is shown
- **Visual Effect:**
  - `high` → 🔴 Red accent border
  - `medium` → 🟡 Yellow accent border
  - `low` → 🟢 Green accent border

---

## Complete Example

### Good Example ✅

```json
[
  {
    "title": "Enhance Answerability with Clear Question Headings",
    "description": "Currently, there are questions on the page, but no question headings. To improve answerability, add specific question headings that align with user queries.",
    "actions": [
      "Add H2: 'How Do I Choose the Right Sectional Cover?'",
      "Add H2: 'What Are the Benefits of Modular Couch Covers?'",
      "Add H2: 'How Do I Measure My Sectional for a Cover?'"
    ],
    "priority": "high"
  },
  {
    "title": "Improve Structure with Hierarchical Headings",
    "description": "The page currently lacks any H1, H2, or H3 headings. Introduce a structured hierarchy to improve readability and snippet quality.",
    "actions": [
      "Add H1: 'Explore Our Range of Modular Sectional Couch Covers'",
      "Add H2: 'Why Choose Lovesac Sectionals?'",
      "Add H3: 'Customization Options'",
      "Add H3: 'Material Quality and Durability'"
    ],
    "priority": "high"
  },
  {
    "title": "Optimize Snippet Quality with Structured Data",
    "description": "The page lacks structured data, which can enhance snippet quality and improve how search engines display the page in search results.",
    "actions": [
      "Use JSON-LD schema for product details (name, price, availability, image)",
      "Ensure each product variant is clearly defined within the structured data",
      "Add aggregate rating schema if reviews are available"
    ],
    "priority": "medium"
  },
  {
    "title": "Increase Freshness by Adding Current Year References",
    "description": "The page does not mention the current year, which can affect its freshness score. Incorporate references to the current year in promotional content.",
    "actions": [
      "Add a line: 'Discover our latest 2025 collection of Sactional covers'",
      "Update seasonal offers to include the year (e.g., '2025 Spring Sale: 40% Off')"
    ],
    "priority": "low"
  },
  {
    "title": "Add Step-by-Step Instructions for Cover Selection",
    "description": "Currently, there are no step-by-step instructions. Adding these can improve answerability and help users make informed decisions.",
    "actions": [
      "Add section: 'How to Select Your Perfect Sectional Cover in 3 Steps'",
      "Include step 1: 'Choose Your Fabric'",
      "Include step 2: 'Select Your Color'",
      "Include step 3: 'Customize Your Fit'"
    ],
    "priority": "medium"
  }
]
```

---

## Bad Example ❌

```json
[
  "1. Enhance Answerability with Clear Question Headings Currently, there are questions on the page, but no question headings. To improve answerability, add specific question headings that align with user queries. For example: - Add H2: \"How Do I Choose the Right Sectional Cover?\" - Add H2: \"What Are the Benefits of Modular Couch Covers?\" These headings can guide users directly to the answers they are seeking, improving the page's answerability score. 2. Improve Structure with Hierarchical Headings The page currently lacks any H1, H2, or H3 headings. Introduce a structured hierarchy..."
]
```

**Problems:**
- ❌ All recommendations concatenated into one string
- ❌ No structure (title, description, actions separate)
- ❌ Hard to parse
- ❌ Inconsistent formatting
- ❌ Numbered list in text instead of array

---

## Implementation Guide

### For Azure OpenAI / GPT Models

Use **JSON mode** or structure your prompt to request JSON output:

```javascript
const prompt = `Analyze this web page and provide 3-5 specific, actionable recommendations 
to improve its LLM discoverability and SEO performance.

Return your response as a JSON array with the following structure:
[
  {
    "title": "Clear, concise recommendation title",
    "description": "Context and explanation (1-3 sentences)",
    "actions": ["Specific action 1", "Specific action 2"],
    "priority": "high" or "medium" or "low"
  }
]

Page content: ${pageContent}
Current metrics: ${metrics}

Focus on:
1. Content structure and headings
2. Answerability and question alignment
3. Freshness and temporal relevance
4. Structured data and schema markup
5. User journey and step-by-step guidance

Return ONLY the JSON array, no additional text.`

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_object" }, // Enable JSON mode
  messages: [
    { role: "system", content: "You are an SEO and LLM discoverability expert. Always return valid JSON." },
    { role: "user", content: prompt }
  ]
})

const recommendations = JSON.parse(response.choices[0].message.content)
```

### Response Validation

Before sending to frontend, validate the structure:

```javascript
function validateRecommendations(recs) {
  if (!Array.isArray(recs)) {
    console.warn('Recommendations is not an array, wrapping it')
    recs = [recs]
  }

  return recs.map((rec, idx) => {
    if (typeof rec === 'string') {
      // Fallback for plain strings
      return {
        title: `Recommendation ${idx + 1}`,
        description: rec,
        actions: [],
        priority: undefined
      }
    }

    return {
      title: rec.title || `Recommendation ${idx + 1}`,
      description: rec.description || rec.recommendation || '',
      actions: Array.isArray(rec.actions) ? rec.actions : [],
      priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : undefined
    }
  })
}

// Use in your endpoint
const rawRecommendations = await generateRecommendations(pageContent)
const validatedRecommendations = validateRecommendations(rawRecommendations)
return { recommendations: validatedRecommendations }
```

---

## Frontend Rendering

The frontend will automatically render:

```
┌──────────────────────────────────────────────┐
│ 1  🔴  Enhance Answerability with Clear      │
│        Question Headings                     │
│                                              │
│   Currently, there are questions on the      │
│   page, but no question headings...          │
│                                              │
│   Action Items:                              │
│   ▪ Add H2: 'How Do I Choose...'            │
│   ▪ Add H2: 'What Are the Benefits...'      │
└──────────────────────────────────────────────┘
```

---

## Testing

### Test Cases

**Test 1: Valid structured data**
```json
[{
  "title": "Test Recommendation",
  "description": "This is a test",
  "actions": ["Action 1", "Action 2"],
  "priority": "high"
}]
```
✅ Should render perfectly

**Test 2: Plain string (fallback)**
```json
["This is a plain text recommendation"]
```
✅ Should render as simple card with generic title

**Test 3: Missing actions**
```json
[{
  "title": "Test Recommendation",
  "description": "This is a test"
}]
```
✅ Should render without action items section

**Test 4: Invalid priority**
```json
[{
  "title": "Test",
  "priority": "critical"
}]
```
✅ Should render without priority indicator (only high/medium/low are valid)

---

## Migration Path

### Current State (Text Blob)
```
"1. Enhance Answerability... 2. Improve Structure... 3. Optimize..."
```

### Desired State (Structured JSON)
```json
[
  { "title": "Enhance Answerability...", ... },
  { "title": "Improve Structure...", ... },
  { "title": "Optimize...", ... }
]
```

### Interim Solution
The frontend currently handles both formats but prefers structured JSON. Update the backend prompt to return JSON, and the frontend will automatically display it beautifully.

---

## Benefits

✅ **Consistency** - Every recommendation looks the same
✅ **Clarity** - Clear separation of title, context, and actions
✅ **Actionability** - Specific steps are easy to follow
✅ **Scannability** - Users can quickly review all recommendations
✅ **Maintainability** - No complex parsing logic needed
✅ **Extensibility** - Easy to add new fields (e.g., `impact`, `effort`)

---

## Future Enhancements

Potential additional fields:

```json
{
  "title": "...",
  "description": "...",
  "actions": [...],
  "priority": "high",
  "category": "SEO" | "Content" | "Technical" | "UX",
  "impact": "high" | "medium" | "low",
  "effort": "easy" | "moderate" | "complex",
  "estimatedTime": "30 minutes",
  "resources": ["Link to guide", "Tool recommendation"]
}
```

---

## Summary

**DO:**
- ✅ Return JSON array of objects
- ✅ Use clear, specific titles
- ✅ Provide context in description
- ✅ List concrete actions
- ✅ Set priority when appropriate

**DON'T:**
- ❌ Return concatenated text strings
- ❌ Use numbered lists in text
- ❌ Mix formats
- ❌ Use vague language
- ❌ Forget to structure the output

**The golden rule:** If you can structure it in JSON, do it. The frontend will make it beautiful.

