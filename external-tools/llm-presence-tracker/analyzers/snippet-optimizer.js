/**
 * Snippet Optimization Analyzer
 * Analyzes how well content is optimized for search engine and LLM snippets
 */

/**
 * Analyze snippet optimization
 * @param {Object} $ - Cheerio instance
 * @param {string} text - Page text content
 * @returns {Object} Snippet optimization analysis
 */
function analyzeSnippetQuality($, text) {
  // First paragraph analysis (most important for snippets)
  // Try multiple strategies to find the first meaningful paragraph
  let firstParagraph = $('p').first().text().trim();
  
  // If first <p> is empty or too short, try finding first text after H1
  if (!firstParagraph || firstParagraph.length < 30) {
    const h1 = $('h1').first();
    if (h1.length > 0) {
      // Get the next sibling elements after H1 and find first text
      let nextElement = h1.next();
      while (nextElement.length > 0 && !firstParagraph) {
        const text = nextElement.text().trim();
        if (text.length >= 30) {
          firstParagraph = text;
          break;
        }
        nextElement = nextElement.next();
      }
    }
  }
  
  // If still empty, try first div with class containing 'intro', 'description', 'summary'
  if (!firstParagraph || firstParagraph.length < 30) {
    $('[class*="intro"], [class*="description"], [class*="summary"], [class*="lead"]').each((i, el) => {
      if (!firstParagraph) {
        const text = $(el).text().trim();
        if (text.length >= 30) {
          firstParagraph = text;
          return false; // break
        }
      }
    });
  }
  
  const firstParaLength = firstParagraph.length;
  
  // Meta description
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const metaDescLength = metaDescription.length;
  
  // Meta title
  const metaTitle = $('title').text().trim() ||
                   $('meta[property="og:title"]').attr('content') || '';
  const metaTitleLength = metaTitle.length;
  
  // Check if first paragraph is a good snippet
  const isGoodFirstParagraph = 
    firstParaLength >= 120 && 
    firstParaLength <= 160 &&
    /^[A-Z]/.test(firstParagraph) &&
    !firstParagraph.includes('...') &&
    !firstParagraph.toLowerCase().includes('click here') &&
    !firstParagraph.toLowerCase().includes('learn more');
  
  // Check if meta description is optimized
  const isGoodMetaDescription =
    metaDescLength >= 120 &&
    metaDescLength <= 160 &&
    metaDescription.length > 0;
  
  // Check if title is optimized
  const isGoodTitle =
    metaTitleLength >= 30 &&
    metaTitleLength <= 60 &&
    metaTitle.length > 0;
  
  // Extract potential featured snippet content
  
  // 1. Lists (good for featured snippets)
  const lists = [];
  $('ul, ol').each((i, el) => {
    const items = $(el).find('li');
    if (items.length >= 3 && items.length <= 8) {
      const listItems = [];
      items.each((j, item) => {
        const text = $(item).text().trim();
        if (text.length > 10 && text.length < 150) {
          listItems.push(text);
        }
      });
      if (listItems.length >= 3) {
        lists.push({
          type: $(el).is('ol') ? 'ordered' : 'unordered',
          itemCount: listItems.length,
          items: listItems
        });
      }
    }
  });
  const hasGoodLists = lists.length > 0;
  
  // 2. Tables (good for comparison snippets)
  const tables = [];
  $('table').each((i, el) => {
    const rows = $(el).find('tr');
    if (rows.length >= 2 && rows.length <= 10) {
      const headers = [];
      $(el).find('th').each((j, th) => {
        headers.push($(th).text().trim());
      });
      
      if (headers.length >= 2) {
        tables.push({
          headerCount: headers.length,
          rowCount: rows.length,
          headers: headers
        });
      }
    }
  });
  const hasGoodTables = tables.length > 0;
  
  // 3. Definition content (good for "what is" snippets)
  const definitions = [];
  $('p').each((i, el) => {
    const paraText = $(el).text().trim();
    if (/\b(?:is|means|refers to|defined as)\b/i.test(paraText) && 
        paraText.length >= 100 && paraText.length <= 300) {
      definitions.push(paraText);
    }
  });
  const hasGoodDefinitions = definitions.length > 0;
  
  // 4. Structured data for rich snippets
  const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
  
  // Check for Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const hasOpenGraph = !!(ogTitle && ogDescription);
  
  // Check for Twitter Card tags
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const hasTwitterCard = !!twitterCard;
  
  // Calculate score
  const score = calculateSnippetScore({
    isGoodFirstParagraph,
    isGoodMetaDescription,
    isGoodTitle,
    hasGoodLists,
    hasGoodTables,
    hasGoodDefinitions,
    hasStructuredData,
    hasOpenGraph,
    hasTwitterCard,
    firstParaLength,
    metaDescLength,
    metaTitleLength
  });
  
  return {
    score,
    firstParagraph: {
      text: firstParagraph.substring(0, 200),
      length: firstParaLength,
      isOptimized: isGoodFirstParagraph
    },
    metaDescription: {
      text: metaDescription,
      length: metaDescLength,
      isOptimized: isGoodMetaDescription
    },
    metaTitle: {
      text: metaTitle,
      length: metaTitleLength,
      isOptimized: isGoodTitle
    },
    lists: {
      count: lists.length,
      hasGoodLists,
      samples: lists.slice(0, 2)
    },
    tables: {
      count: tables.length,
      hasGoodTables,
      samples: tables.slice(0, 2)
    },
    definitions: {
      count: definitions.length,
      hasGoodDefinitions,
      samples: definitions.slice(0, 2).map(d => d.substring(0, 150) + '...')
    },
    structuredData: {
      hasStructuredData,
      hasOpenGraph,
      hasTwitterCard
    },
    recommendations: generateSnippetRecommendations({
      isGoodFirstParagraph,
      isGoodMetaDescription,
      isGoodTitle,
      hasGoodLists,
      hasStructuredData,
      hasOpenGraph,
      firstParaLength,
      metaDescLength,
      metaTitleLength
    })
  };
}

/**
 * Calculate snippet optimization score (0-1)
 */
function calculateSnippetScore(metrics) {
  let score = 0;
  
  // First paragraph optimization (25 points)
  if (metrics.isGoodFirstParagraph) {
    score += 0.25;
  } else if (metrics.firstParaLength >= 80 && metrics.firstParaLength <= 200) {
    score += 0.15;
  }
  
  // Meta description (20 points)
  if (metrics.isGoodMetaDescription) {
    score += 0.20;
  } else if (metrics.metaDescLength > 0) {
    score += 0.10;
  }
  
  // Meta title (15 points)
  if (metrics.isGoodTitle) {
    score += 0.15;
  } else if (metrics.metaTitleLength > 0) {
    score += 0.08;
  }
  
  // Lists for featured snippets (15 points)
  if (metrics.hasGoodLists) {
    score += 0.15;
  }
  
  // Tables for comparison snippets (10 points)
  if (metrics.hasGoodTables) {
    score += 0.10;
  }
  
  // Definitions (5 points)
  if (metrics.hasGoodDefinitions) {
    score += 0.05;
  }
  
  // Structured data (7 points)
  if (metrics.hasStructuredData) {
    score += 0.07;
  }
  
  // Open Graph (2 points)
  if (metrics.hasOpenGraph) {
    score += 0.02;
  }
  
  // Twitter Card (1 point)
  if (metrics.hasTwitterCard) {
    score += 0.01;
  }
  
  return Math.min(1.0, score);
}

/**
 * Generate recommendations for snippet optimization
 */
function generateSnippetRecommendations(metrics) {
  const recommendations = [];
  
  if (!metrics.isGoodFirstParagraph) {
    if (metrics.firstParaLength < 120) {
      recommendations.push('Expand first paragraph to 120-160 characters for better snippets');
    } else if (metrics.firstParaLength > 160) {
      recommendations.push('Shorten first paragraph to 120-160 characters for optimal snippets');
    } else {
      recommendations.push('Improve first paragraph to make it more snippet-worthy');
    }
  }
  
  if (!metrics.isGoodMetaDescription) {
    if (metrics.metaDescLength === 0) {
      recommendations.push('Add a meta description (120-160 characters)');
    } else if (metrics.metaDescLength < 120) {
      recommendations.push('Expand meta description to 120-160 characters');
    } else if (metrics.metaDescLength > 160) {
      recommendations.push('Shorten meta description to 120-160 characters');
    }
  }
  
  if (!metrics.isGoodTitle) {
    if (metrics.metaTitleLength === 0) {
      recommendations.push('Add a page title (30-60 characters)');
    } else if (metrics.metaTitleLength < 30) {
      recommendations.push('Expand page title to 30-60 characters');
    } else if (metrics.metaTitleLength > 60) {
      recommendations.push('Shorten page title to 30-60 characters');
    }
  }
  
  if (!metrics.hasGoodLists) {
    recommendations.push('Add bulleted or numbered lists (3-8 items) for featured snippets');
  }
  
  if (!metrics.hasStructuredData) {
    recommendations.push('Add JSON-LD structured data for rich snippets');
  }
  
  if (!metrics.hasOpenGraph) {
    recommendations.push('Add Open Graph meta tags for social sharing');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Snippet optimization is excellent - content is well-formatted');
  }
  
  return recommendations;
}

module.exports = {
  analyzeSnippetQuality
};

