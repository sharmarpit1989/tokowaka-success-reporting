/**
 * Direct Answerability Analyzer
 * Analyzes how well content directly answers user questions
 */

/**
 * Analyze content's ability to directly answer questions
 * @param {Object} $ - Cheerio instance
 * @param {string} text - Page text content
 * @returns {Object} Answerability analysis
 */
function analyzeAnswerability($, text) {
  // Helper function to check if element is in non-content area
  function isInNonContentArea($element) {
    const classes = $element.attr('class') || '';
    const id = $element.attr('id') || '';
    
    // Check element and all parents
    let $current = $element;
    while ($current.length > 0) {
      const currentClasses = $current.attr('class') || '';
      const currentId = $current.attr('id') || '';
      const tagName = $current.prop('tagName') ? $current.prop('tagName').toLowerCase() : '';
      
      // Skip patterns for non-content areas
      const skipPatterns = [
        'nav', 'menu', 'header', 'footer', 'sidebar', 
        'toolbar', 'dropdown', 'filter', 'breadcrumb',
        'tabs', 'pagination', 'gallery', 'grid', 'carousel',
        'banner', 'promo', 'popup', 'modal', 'overlay'
      ];
      
      const shouldSkip = skipPatterns.some(pattern => 
        currentClasses.toLowerCase().includes(pattern) || 
        currentId.toLowerCase().includes(pattern)
      ) || ['nav', 'header', 'footer', 'aside'].includes(tagName);
      
      if (shouldSkip) return true;
      
      $current = $current.parent();
    }
    
    return false;
  }
  
  // Extract structured elements from content areas only
  let h1Count = 0;
  $('h1').each((i, el) => {
    if (!isInNonContentArea($(el))) h1Count++;
  });
  
  let h2Count = 0;
  $('h2').each((i, el) => {
    if (!isInNonContentArea($(el))) h2Count++;
  });
  
  let h3Count = 0;
  $('h3').each((i, el) => {
    if (!isInNonContentArea($(el))) h3Count++;
  });
  
  // Count only content lists, excluding navigation/UI lists
  let listCount = 0;
  $('ul, ol').each((i, el) => {
    if (!isInNonContentArea($(el))) listCount++;
  });
  
  const tableCount = $('table').length;
  
  // Capture sample headings for AI context (from content areas only)
  const sampleH2Headings = [];
  $('h2').each((i, el) => {
    if (!isInNonContentArea($(el)) && sampleH2Headings.length < 5) {
      sampleH2Headings.push($(el).text().trim());
    }
  });
  
  // Extract list items for analysis
  const listItems = [];
  $('ul li, ol li').each((i, el) => {
    const itemText = $(el).text().trim();
    if (itemText.length > 10 && itemText.length < 200) {
      listItems.push(itemText);
    }
  });
  
  // Check for question patterns in headings (from content areas only)
  const headings = [];
  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    if (!isInNonContentArea($(el))) {
      headings.push($(el).text().trim());
    }
  });
  
  // Enhanced multilingual question patterns
  const questionPatterns = [
    // English patterns
    /what is/gi, /what are/gi, /how to/gi, /how do/gi, /how does/gi,
    /why does/gi, /why is/gi, /why are/gi,
    /when will/gi, /when is/gi, /when are/gi, /when should/gi,
    /where can/gi, /where is/gi, /where are/gi,
    /who is/gi, /who are/gi,
    /which is/gi, /which are/gi,
    /can i/gi, /can you/gi,
    
    // Spanish patterns
    /qué es/gi, /cómo/gi, /por qué/gi, /cuándo/gi, /dónde/gi,
    
    // French patterns
    /qu'est-ce que/gi, /comment/gi, /pourquoi/gi, /quand/gi, /où/gi,
    
    // German patterns
    /was ist/gi, /wie/gi, /warum/gi, /wann/gi, /wo/gi,
    
    // Indonesian patterns
    /bagaimana/gi, /apa/gi, /apakah/gi, /mengapa/gi, /kapan/gi, /di mana/gi,
    
    // Portuguese patterns
    /o que é/gi, /como/gi, /por que/gi, /quando/gi, /onde/gi,
    
    // Italian patterns
    /cos'è/gi, /come/gi, /perché/gi, /quando/gi, /dove/gi,
    
    // Question marks (catches any language)
    /\?/g  // Any question mark in text (not just at end)
  ];
  
  const headingsWithQuestions = headings.filter(h => 
    questionPatterns.some(pattern => pattern.test(h))
  );
  const hasQuestionHeadings = headingsWithQuestions.length > 0;
  
  // Check for question-answer patterns in text
  // Also check for sentences ending with question marks
  const hasQuestions = questionPatterns.some(pattern => pattern.test(text)) ||
                       (text.match(/[^.!?]+\?/g) || []).length >= 2;
  
  // Check for definition patterns (multilingual)
  const definitionPatterns = [
    // English patterns
    /is defined as/gi, /refers to/gi, /means that/gi, /meaning of/gi,
    /is a type of/gi, /is an example of/gi, /is called/gi,
    /definition:/gi, /means:/gi,
    
    // Spanish
    /se define como/gi, /significa/gi, /es un tipo de/gi,
    
    // French
    /est défini comme/gi, /signifie/gi, /est un type de/gi,
    
    // German
    /ist definiert als/gi, /bedeutet/gi, /ist eine art von/gi,
    
    // Indonesian
    /didefinisikan sebagai/gi, /berarti/gi, /adalah jenis/gi,
    
    // Portuguese
    /é definido como/gi, /significa/gi, /é um tipo de/gi,
    
    // Universal pattern: colon followed by capital letter or number
    /:\s*[A-Z0-9]/g
  ];
  const hasDefinitions = definitionPatterns.some(pattern => pattern.test(text));
  
  // Extract definition-like sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const definitionSentences = sentences.filter(s =>
    definitionPatterns.some(pattern => pattern.test(s)) &&
    s.length > 40 && s.length < 300
  ).slice(0, 5);
  
  // Check for step-by-step content (multilingual)
  const stepPatterns = [
    // English patterns
    /step \d+/gi, /first,/gi, /second,/gi, /third,/gi, /then,/gi,
    /finally,/gi, /next,/gi, /after that,/gi, /following/gi,
    
    // Spanish
    /paso \d+/gi, /primero,/gi, /segundo,/gi, /luego,/gi, /finalmente,/gi,
    
    // French
    /étape \d+/gi, /d'abord,/gi, /ensuite,/gi, /puis,/gi, /enfin,/gi,
    
    // German
    /schritt \d+/gi, /zuerst,/gi, /dann,/gi, /schließlich,/gi,
    
    // Indonesian
    /langkah \d+/gi, /pertama,/gi, /kedua,/gi, /kemudian,/gi, /akhirnya,/gi,
    
    // Portuguese
    /passo \d+/gi, /primeiro,/gi, /segundo,/gi, /então,/gi, /finalmente,/gi,
    
    // Universal: numbered lists (any language)
    /\d+\.\s+[A-Z\u00C0-\u024F\u1E00-\u1EFF]/g  // Numbered lists with accented chars
  ];
  const hasSteps = stepPatterns.some(pattern => pattern.test(text));
  
  // Extract step-like content
  const numberedListPattern = /\d+\.\s+([^\n]+)/g;
  const numberedSteps = [];
  let match;
  while ((match = numberedListPattern.exec(text)) !== null) {
    numberedSteps.push(match[1].trim());
  }
  
  // Check for comparison content (multilingual)
  const comparisonPatterns = [
    // English patterns
    /vs\./gi, /versus/gi, /compared to/gi, /comparison/gi,
    /difference between/gi, /differences/gi,
    /better than/gi, /worse than/gi,
    /pros and cons/gi, /advantages and disadvantages/gi,
    
    // Spanish
    /comparado con/gi, /diferencia entre/gi, /ventajas y desventajas/gi,
    
    // French
    /comparé à/gi, /différence entre/gi, /avantages et inconvénients/gi,
    
    // German
    /im vergleich zu/gi, /unterschied zwischen/gi, /vor- und nachteile/gi,
    
    // Indonesian
    /dibandingkan dengan/gi, /perbedaan antara/gi, /kelebihan dan kekurangan/gi,
    
    // Portuguese
    /comparado com/gi, /diferença entre/gi, /vantagens e desvantagens/gi,
    
    // Universal symbol
    /\svs[\s\.]/gi  // "X vs Y" pattern
  ];
  const hasComparisons = comparisonPatterns.some(pattern => pattern.test(text));
  
  // Check for FAQ section
  const hasFAQ = /FAQ|Frequently Asked Questions/gi.test(text) || 
                 $('[class*="faq" i], [id*="faq" i]').length > 0;
  
  // JSON-LD structured data
  const jsonLDScripts = $('script[type="application/ld+json"]');
  const hasJSONLD = jsonLDScripts.length > 0;
  const jsonLDTypes = [];
  
  jsonLDScripts.each((i, el) => {
    try {
      const jsonData = JSON.parse($(el).html());
      const type = jsonData['@type'] || (jsonData['@graph'] && jsonData['@graph'][0] && jsonData['@graph'][0]['@type']);
      if (type) {
        jsonLDTypes.push(type);
      }
    } catch (e) {
      // Invalid JSON
    }
  });
  
  // Check for specific answer-worthy structured data types
  const hasAnswerSchema = jsonLDTypes.some(type => 
    ['FAQPage', 'QAPage', 'HowTo', 'Article', 'NewsArticle', 'BlogPosting'].includes(type)
  );
  
  // Calculate score
  const score = calculateAnswerabilityScore({
    h1Count, h2Count, h3Count, listCount, tableCount,
    hasQuestions, hasDefinitions, hasSteps, hasComparisons,
    hasJSONLD, hasAnswerSchema, hasFAQ, hasQuestionHeadings,
    listItemCount: listItems.length,
    definitionCount: definitionSentences.length,
    stepCount: numberedSteps.length
  });
  
  return {
    score,
    h1Count,
    h2Count,
    h3Count,
    sampleHeadings: sampleH2Headings,
    listCount,
    tableCount,
    listItemCount: listItems.length,
    sampleListItems: listItems.slice(0, 5),
    hasQuestions,
    hasQuestionHeadings,
    questionHeadingCount: headingsWithQuestions.length,
    sampleQuestionHeadings: headingsWithQuestions.slice(0, 5),
    hasDefinitions,
    definitionCount: definitionSentences.length,
    sampleDefinitions: definitionSentences,
    hasSteps,
    stepCount: numberedSteps.length,
    sampleSteps: numberedSteps.slice(0, 5),
    hasComparisons,
    hasFAQ,
    hasJSONLD,
    jsonLDTypes,
    hasAnswerSchema,
    recommendations: generateAnswerabilityRecommendations({
      h1Count, listCount, hasQuestions, hasDefinitions, 
      hasSteps, hasJSONLD, hasFAQ
    })
  };
}

/**
 * Calculate answerability score (0-1)
 */
function calculateAnswerabilityScore(metrics) {
  let score = 0;
  
  // Heading structure (15 points)
  if (metrics.h1Count === 1) score += 0.05; // Single H1 is good
  if (metrics.h2Count >= 3) score += 0.05; // Multiple H2s
  if (metrics.h3Count >= 2) score += 0.05; // Some H3s
  
  // Lists (15 points)
  if (metrics.listCount > 0) {
    score += Math.min(0.15, metrics.listCount * 0.03);
  }
  
  // Tables (10 points)
  if (metrics.tableCount > 0) {
    score += Math.min(0.10, metrics.tableCount * 0.05);
  }
  
  // Questions (20 points)
  if (metrics.hasQuestions) score += 0.10;
  if (metrics.hasQuestionHeadings) score += 0.10;
  
  // Definitions (15 points)
  if (metrics.hasDefinitions) {
    score += Math.min(0.15, 0.05 + (metrics.definitionCount * 0.02));
  }
  
  // Step-by-step content (10 points)
  if (metrics.hasSteps) {
    score += Math.min(0.10, 0.05 + (metrics.stepCount * 0.01));
  }
  
  // Comparisons (5 points)
  if (metrics.hasComparisons) score += 0.05;
  
  // Structured data (10 points)
  if (metrics.hasJSONLD) score += 0.05;
  if (metrics.hasAnswerSchema) score += 0.05;
  
  // FAQ section (bonus)
  if (metrics.hasFAQ) score += 0.05;
  
  return Math.min(1.0, score);
}

/**
 * Generate recommendations for improving answerability
 */
function generateAnswerabilityRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.h1Count === 0) {
    recommendations.push('Add a clear H1 heading to define the main topic');
  } else if (metrics.h1Count > 1) {
    recommendations.push('Use only one H1 heading per page');
  }
  
  if (metrics.listCount < 2) {
    recommendations.push('Add bulleted or numbered lists to organize information');
  }
  
  if (!metrics.hasQuestions) {
    recommendations.push('Include question-based headings (e.g., "What is...", "How to...")');
  }
  
  if (!metrics.hasDefinitions) {
    recommendations.push('Add clear definitions of key terms and concepts');
  }
  
  if (!metrics.hasSteps) {
    recommendations.push('Consider adding step-by-step instructions or procedures');
  }
  
  if (!metrics.hasJSONLD) {
    recommendations.push('Add JSON-LD structured data (e.g., Article, FAQPage, HowTo)');
  }
  
  if (!metrics.hasFAQ) {
    recommendations.push('Consider adding an FAQ section for common questions');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Content is highly answerable - maintain structure and clarity');
  }
  
  return recommendations;
}

module.exports = {
  analyzeAnswerability
};

