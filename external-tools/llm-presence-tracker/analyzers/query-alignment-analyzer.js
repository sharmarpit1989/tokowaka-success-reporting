/**
 * Query Alignment Analyzer
 * Analyzes how well content aligns with natural language search queries
 */

const { tokenize } = require('../utils/utils.js');

/**
 * Analyze content alignment with search queries
 * @param {string} text - Page text content
 * @param {string} title - Page title
 * @returns {Object} Query alignment analysis
 */
function analyzeQueryAlignment(text, title = '') {
  // Extract sentences that could be good answers/snippets
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // Identify answer-worthy sentences (good snippet length)
  const answerSentences = sentences.filter(s => {
    return s.length > 40 && s.length < 200 && // Optimal snippet length
           /^[A-Z]/.test(s.trim()) && // Starts with capital
           !/^(The|A|An)\s+(image|figure|table|photo)/i.test(s) && // Not image captions
           !/^(Click|See|View|Download|Learn more)/i.test(s); // Not CTAs
  });
  
  // Extract key phrases (2-4 word combinations)
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .match(/\b[a-z0-9]+\b/g) || [];
  
  // Generate 2-word and 3-word phrases
  const phrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    // Skip common stop words at start
    if (!isStopWord(words[i])) {
      phrases.push(words[i] + ' ' + words[i + 1]);
      
      if (i < words.length - 2 && !isStopWord(words[i + 2])) {
        phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
      }
    }
  }
  
  // Get top phrases by frequency
  const phraseFreq = {};
  phrases.forEach(p => phraseFreq[p] = (phraseFreq[p] || 0) + 1);
  
  // Filter phrases that appear at least twice and aren't too common
  const meaningfulPhrases = Object.entries(phraseFreq)
    .filter(([phrase, count]) => count >= 2 && count <= words.length * 0.1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(e => ({ phrase: e[0], count: e[1] }));
  
  // Extract potential search queries from headings and questions
  const potentialQueries = extractPotentialQueries(text, title);
  
  // Analyze sentence structure
  const avgSentenceLength = answerSentences.reduce((sum, s) => sum + s.length, 0) / 
                            (answerSentences.length || 1);
  
  // Check for conversational language patterns
  const conversationalPatterns = [
    /you can/gi, /you should/gi, /you need/gi, /you'll/gi, /you're/gi,
    /let's/gi, /we'll/gi, /here's/gi, /that's/gi,
    /simply/gi, /easily/gi, /quickly/gi
  ];
  const conversationalCount = conversationalPatterns.reduce((count, pattern) => {
    return count + (text.match(pattern) || []).length;
  }, 0);
  const hasConversationalTone = conversationalCount >= 3;
  
  // Calculate score
  const score = calculateQueryAlignmentScore({
    answerSentenceCount: answerSentences.length,
    phraseCount: meaningfulPhrases.length,
    avgSentenceLength,
    hasConversationalTone,
    potentialQueryCount: potentialQueries.length
  });
  
  return {
    score,
    answerSentenceCount: answerSentences.length,
    sampleAnswerSentences: answerSentences.slice(0, 5),
    avgSentenceLength: Math.round(avgSentenceLength),
    topPhrases: meaningfulPhrases.slice(0, 10),
    phraseCount: meaningfulPhrases.length,
    potentialQueries: potentialQueries.slice(0, 10),
    potentialQueryCount: potentialQueries.length,
    hasConversationalTone,
    conversationalCount,
    recommendations: generateQueryAlignmentRecommendations({
      answerSentenceCount: answerSentences.length,
      phraseCount: meaningfulPhrases.length,
      hasConversationalTone,
      potentialQueryCount: potentialQueries.length
    })
  };
}

/**
 * Check if word is a common stop word
 */
function isStopWord(word) {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'of', 'to', 'in', 'for', 'with', 'by', 'from', 'up', 'about', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under'
  ]);
  return stopWords.has(word.toLowerCase());
}

/**
 * Extract potential search queries from content
 */
function extractPotentialQueries(text, title) {
  const queries = [];
  
  // Extract question-based headings and text
  const questionRegex = /((?:what|how|why|when|where|who|which|can|should|do|does|is|are)\s+[^.!?]+\?)/gi;
  const questions = text.match(questionRegex) || [];
  
  questions.forEach(q => {
    const cleaned = q.trim().replace(/\s+/g, ' ');
    if (cleaned.length > 15 && cleaned.length < 100) {
      queries.push(cleaned);
    }
  });
  
  // Extract "How to" patterns
  const howToRegex = /how to [^.!?\n]{10,80}/gi;
  const howToMatches = text.match(howToRegex) || [];
  queries.push(...howToMatches.map(m => m.trim()));
  
  // Extract "What is" patterns
  const whatIsRegex = /what (?:is|are) [^.!?\n]{5,60}/gi;
  const whatIsMatches = text.match(whatIsRegex) || [];
  queries.push(...whatIsMatches.map(m => m.trim()));
  
  // Use title as a query (if it's descriptive)
  if (title && title.length > 10 && title.length < 100) {
    queries.push(title);
  }
  
  // Remove duplicates and clean up
  return [...new Set(queries)]
    .map(q => q.replace(/\s+/g, ' ').trim())
    .filter(q => q.length >= 15);
}

/**
 * Calculate query alignment score (0-1)
 */
function calculateQueryAlignmentScore(metrics) {
  let score = 0;
  
  // Answer-worthy sentences (35 points)
  if (metrics.answerSentenceCount >= 5) {
    score += 0.35;
  } else if (metrics.answerSentenceCount >= 3) {
    score += 0.25;
  } else if (metrics.answerSentenceCount >= 1) {
    score += 0.15;
  }
  
  // Meaningful phrases (30 points)
  if (metrics.phraseCount >= 10) {
    score += 0.30;
  } else if (metrics.phraseCount >= 5) {
    score += 0.20;
  } else if (metrics.phraseCount >= 2) {
    score += 0.10;
  }
  
  // Sentence length optimization (15 points)
  if (metrics.avgSentenceLength >= 80 && metrics.avgSentenceLength <= 150) {
    score += 0.15; // Ideal for snippets
  } else if (metrics.avgSentenceLength >= 60 && metrics.avgSentenceLength <= 180) {
    score += 0.10;
  }
  
  // Conversational tone (10 points)
  if (metrics.hasConversationalTone) {
    score += 0.10;
  }
  
  // Potential queries (10 points)
  if (metrics.potentialQueryCount >= 5) {
    score += 0.10;
  } else if (metrics.potentialQueryCount >= 2) {
    score += 0.05;
  }
  
  return Math.min(1.0, score);
}

/**
 * Generate recommendations for improving query alignment
 */
function generateQueryAlignmentRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.answerSentenceCount < 5) {
    recommendations.push('Add more direct, concise answer sentences (40-200 characters)');
  }
  
  if (metrics.phraseCount < 5) {
    recommendations.push('Use more consistent key phrases throughout the content');
  }
  
  if (!metrics.hasConversationalTone) {
    recommendations.push('Adopt a more conversational tone (use "you", "we", "here\'s")');
  }
  
  if (metrics.potentialQueryCount < 3) {
    recommendations.push('Include more question-based headings and content');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Query alignment is strong - content matches natural search patterns');
  }
  
  return recommendations;
}

module.exports = {
  analyzeQueryAlignment
};

