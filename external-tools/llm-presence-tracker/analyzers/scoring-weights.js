/**
 * Page Type-Specific Scoring Weights
 * Different page types are optimized for different purposes
 */

/**
 * Default weights (used when page type is unknown)
 */
const DEFAULT_WEIGHTS = {
  freshness: 0.20,
  answerability: 0.25,
  queryAlignment: 0.15,
  snippetQuality: 0.15,
  authority: 0.15,
  structure: 0.10
};

/**
 * Page type-specific scoring weights
 * Each page type has different priorities for LLM discoverability
 */
const PAGE_TYPE_WEIGHTS = {
  
  // ========== TOOLS & UTILITIES ==========
  
  ONLINE_TOOL: {
    // Online tools need clear instructions, good snippets, less emphasis on freshness
    freshness: 0.10,        // ↓ Tools are evergreen
    answerability: 0.30,    // ↑ Step-by-step critical
    queryAlignment: 0.20,   // ↑ "how to convert PDF" queries
    snippetQuality: 0.20,   // ↑ Good first paragraph crucial
    authority: 0.10,        // ↓ Less important for free tools
    structure: 0.10,        // = Standard importance
    reasoning: "Tools need clear instructions and good snippets for 'how to' queries"
  },
  
  DEMO_SANDBOX: {
    freshness: 0.15,
    answerability: 0.25,
    queryAlignment: 0.20,
    snippetQuality: 0.15,
    authority: 0.15,
    structure: 0.10,
    reasoning: "Interactive demos need clear instructions and good discoverability"
  },
  
  // ========== CONTENT & INFORMATION ==========
  
  BLOG_POST: {
    // Blog posts need freshness, good content, less emphasis on authority
    freshness: 0.35,        // ↑↑ Recency critical for blogs
    answerability: 0.20,    // = Answer questions
    queryAlignment: 0.20,   // ↑ Natural language matching
    snippetQuality: 0.15,   // ↑ Featured snippets
    authority: 0.05,        // ↓ Author matters less than content
    structure: 0.05,        // ↓ Less structured than docs
    reasoning: "Blog posts live or die by freshness and topical relevance"
  },
  
  TUTORIAL_GUIDE: {
    // Tutorials need step-by-step, good structure
    freshness: 0.15,        // ↓ Tutorials can be evergreen
    answerability: 0.35,    // ↑↑ Step-by-step is everything
    queryAlignment: 0.20,   // ↑ "how to" queries
    snippetQuality: 0.10,   // = Standard
    authority: 0.10,        // ↓ Content quality matters more
    structure: 0.10,        // = Clear organization needed
    reasoning: "Tutorials must have clear step-by-step instructions for LLM citation"
  },
  
  DOCUMENTATION: {
    // Documentation needs structure, authority, comprehensive answers
    freshness: 0.10,        // ↓ Docs are relatively stable
    answerability: 0.30,    // ↑ Must answer technical questions
    queryAlignment: 0.15,   // = Technical query matching
    snippetQuality: 0.15,   // = Clear definitions
    authority: 0.15,        // ↑ Official docs matter
    structure: 0.15,        // ↑ Organization critical
    reasoning: "Documentation requires clear structure and authoritative answers"
  },
  
  FAQ_PAGE: {
    // FAQ pages are all about answerability and question matching
    freshness: 0.10,        // ↓ FAQs are relatively stable
    answerability: 0.40,    // ↑↑ Question-answer format essential
    queryAlignment: 0.25,   // ↑↑ Natural questions critical
    snippetQuality: 0.15,   // ↑ Each Q&A is a snippet
    authority: 0.05,        // ↓ Less critical
    structure: 0.05,        // ↓ Simple Q&A format
    reasoning: "FAQ pages must have clear question-answer pairs for LLM extraction"
  },
  
  KNOWLEDGE_BASE: {
    freshness: 0.15,
    answerability: 0.30,
    queryAlignment: 0.20,
    snippetQuality: 0.15,
    authority: 0.10,
    structure: 0.10,
    reasoning: "Knowledge base articles need clear answers to specific problems"
  },
  
  // ========== PRODUCT & COMMERCE ==========
  
  PRODUCT_PAGE: {
    // Product pages need authority, good snippets, freshness for features
    freshness: 0.20,        // ↑ Feature updates matter
    answerability: 0.20,    // = Answer "what is" questions
    queryAlignment: 0.15,   // = Product name queries
    snippetQuality: 0.25,   // ↑↑ First impression critical
    authority: 0.15,        // ↑ Brand trust matters
    structure: 0.05,        // ↓ Less critical than content
    reasoning: "Product pages need strong snippets and authority for brand queries"
  },
  
  PRODUCT_CATEGORY: {
    freshness: 0.15,
    answerability: 0.20,
    queryAlignment: 0.20,
    snippetQuality: 0.20,
    authority: 0.15,
    structure: 0.10,
    reasoning: "Category pages need good organization and clear product listings"
  },
  
  PRICING_PAGE: {
    // Pricing needs freshness (prices change), clarity, authority
    freshness: 0.30,        // ↑↑ Prices change frequently
    answerability: 0.20,    // ↑ "how much" questions
    queryAlignment: 0.15,   // = "pricing" queries
    snippetQuality: 0.20,   // ↑ Clear pricing in snippets
    authority: 0.10,        // = Trust in pricing
    structure: 0.05,        // ↓ Simple table structure
    reasoning: "Pricing pages must have current prices with clear presentation"
  },
  
  LANDING_PAGE: {
    // Landing pages need strong snippets, authority, clear value prop
    freshness: 0.15,
    answerability: 0.20,
    queryAlignment: 0.20,
    snippetQuality: 0.25,   // ↑ Hook critical
    authority: 0.15,
    structure: 0.05,
    reasoning: "Landing pages need compelling snippets for campaign discoverability"
  },
  
  // ========== COMPANY & INFO ==========
  
  HOMEPAGE: {
    // Homepage needs authority, good snippet, comprehensive overview
    freshness: 0.15,        // = Regular updates
    answerability: 0.20,    // = "what does company do"
    queryAlignment: 0.15,   // = Brand name queries
    snippetQuality: 0.25,   // ↑ First impression
    authority: 0.20,        // ↑ Brand authority critical
    structure: 0.05,        // ↓ Flexible structure
    reasoning: "Homepage needs strong brand authority and clear value proposition"
  },
  
  ABOUT_PAGE: {
    freshness: 0.15,
    answerability: 0.25,    // "who is", "what does"
    queryAlignment: 0.15,
    snippetQuality: 0.20,
    authority: 0.20,        // Company credibility
    structure: 0.05,
    reasoning: "About pages establish company authority and answer identity questions"
  },
  
  CONTACT_PAGE: {
    freshness: 0.10,        // Contact info stable
    answerability: 0.30,    // "how to contact"
    queryAlignment: 0.20,   // "contact" queries
    snippetQuality: 0.20,   // Contact details in snippet
    authority: 0.15,
    structure: 0.05,
    reasoning: "Contact pages must have clear contact methods immediately visible"
  },
  
  // ========== RESOURCES ==========
  
  RESOURCE_CENTER: {
    freshness: 0.20,        // New resources added
    answerability: 0.20,
    queryAlignment: 0.20,
    snippetQuality: 0.15,
    authority: 0.15,
    structure: 0.10,
    reasoning: "Resource centers need organized, discoverable asset libraries"
  },
  
  CASE_STUDY: {
    freshness: 0.25,        // Recent case studies matter
    answerability: 0.25,    // Problem-solution format
    queryAlignment: 0.20,
    snippetQuality: 0.15,
    authority: 0.10,
    structure: 0.05,
    reasoning: "Case studies need fresh examples with clear problem-solution narratives"
  },
  
  WHITEPAPER_EBOOK: {
    freshness: 0.25,        // Research currency matters
    answerability: 0.25,
    queryAlignment: 0.15,
    snippetQuality: 0.15,
    authority: 0.15,        // Research credibility
    structure: 0.05,
    reasoning: "Research content needs freshness and authoritative insights"
  },
  
  // ========== COMMUNITY ==========
  
  COMMUNITY_FORUM: {
    freshness: 0.30,        // Active forums matter
    answerability: 0.25,
    queryAlignment: 0.20,
    snippetQuality: 0.10,
    authority: 0.10,
    structure: 0.05,
    reasoning: "Forums need active, current discussions with real answers"
  },
  
  EVENTS_WEBINAR: {
    freshness: 0.40,        // ↑↑ Event dates critical
    answerability: 0.20,    // What, when, where
    queryAlignment: 0.15,
    snippetQuality: 0.15,
    authority: 0.05,
    structure: 0.05,
    reasoning: "Event pages must have current dates and clear event details"
  },
  
  // ========== COMPARISON ==========
  
  COMPARISON_PAGE: {
    // Comparison pages need structure, clear differences, less freshness
    freshness: 0.15,
    answerability: 0.25,    // "X vs Y" questions
    queryAlignment: 0.25,   // ↑ "vs" queries
    snippetQuality: 0.15,
    authority: 0.10,
    structure: 0.10,        // Tables help
    reasoning: "Comparison pages need clear differentiation and comparison queries"
  },
  
  // ========== DEFAULT ==========
  
  OTHER: DEFAULT_WEIGHTS
};

/**
 * Get scoring weights for a specific page type
 * @param {string} pageTypeKey - Page type key (e.g., "ONLINE_TOOL")
 * @returns {Object} Weights object with reasoning
 */
function getWeightsForPageType(pageTypeKey) {
  const weights = PAGE_TYPE_WEIGHTS[pageTypeKey] || DEFAULT_WEIGHTS;
  
  // Validate weights sum to 1.0 (with small tolerance for rounding)
  const sum = weights.freshness + weights.answerability + weights.queryAlignment +
              weights.snippetQuality + weights.authority + weights.structure;
  
  if (Math.abs(sum - 1.0) > 0.01) {
    console.warn(`Warning: Weights for ${pageTypeKey} sum to ${sum}, not 1.0`);
  }
  
  return weights;
}

/**
 * Calculate final score with page-type-specific weights
 * @param {Object} scores - Individual dimension scores
 * @param {string} pageTypeKey - Page type key
 * @returns {Object} Final score with breakdown
 */
function calculatePageTypeScore(scores, pageTypeKey) {
  const weights = getWeightsForPageType(pageTypeKey);
  
  const breakdown = {
    freshness: scores.freshness * weights.freshness,
    answerability: scores.answerability * weights.answerability,
    queryAlignment: scores.queryAlignment * weights.queryAlignment,
    snippetQuality: scores.snippetQuality * weights.snippetQuality,
    authority: scores.authority * weights.authority,
    structure: scores.structure * weights.structure
  };
  
  const finalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return {
    finalScore,
    breakdown,
    weights,
    reasoning: weights.reasoning || 'Standard scoring weights applied'
  };
}

/**
 * Compare scores using default vs page-type-specific weights
 * @param {Object} scores - Individual dimension scores
 * @param {string} pageTypeKey - Page type key
 * @returns {Object} Comparison with delta
 */
function compareScoring(scores, pageTypeKey) {
  const defaultResult = calculatePageTypeScore(scores, 'OTHER');
  const specificResult = calculatePageTypeScore(scores, pageTypeKey);
  
  const delta = specificResult.finalScore - defaultResult.finalScore;
  const deltaPercent = (delta * 100).toFixed(1);
  
  return {
    defaultScore: defaultResult.finalScore,
    specificScore: specificResult.finalScore,
    delta,
    deltaPercent: `${deltaPercent > 0 ? '+' : ''}${deltaPercent}%`,
    improvement: delta > 0 ? 'Better with specific weights' : 'Worse with specific weights',
    reasoning: specificResult.reasoning
  };
}

/**
 * Get all page type weights for documentation
 */
function getAllPageTypeWeights() {
  return PAGE_TYPE_WEIGHTS;
}

module.exports = {
  getWeightsForPageType,
  calculatePageTypeScore,
  compareScoring,
  getAllPageTypeWeights,
  DEFAULT_WEIGHTS,
  PAGE_TYPE_WEIGHTS
};

