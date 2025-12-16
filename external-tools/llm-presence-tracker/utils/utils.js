/**
 * Shared utilities for HTML parsing and text analysis
 * Used by both Chrome extension and main.js for consistent results
 * Unified version with dependency injection
 */

// Global reference for cheerio (will be set by main.js)
let cheerioRef = null;

// Function to set cheerio reference for Node.js environment
function setCheerio(cheerio) {
  cheerioRef = cheerio;
}

// ============== HTML Parsing and Text Extraction ==============

const navigationSelectors = [
  'nav', 'header', 'footer', 
  '.nav', '.navigation', '.navbar', '.nav-bar', '.menu', '.main-menu',
  '.header', '.site-header', '.page-header', '.top-header',
  '.footer', '.site-footer', '.page-footer', '.bottom-footer',
  '.breadcrumb', '.breadcrumbs',
  '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
  // Common class patterns
  '.navigation-wrapper', '.nav-wrapper', '.header-wrapper', '.footer-wrapper',
  '.site-navigation', '.primary-navigation', '.secondary-navigation',
  '.top-nav', '.bottom-nav', '.sidebar-nav',
  // ID selectors for common navigation/footer elements
  '#nav', '#navigation', '#navbar', '#header', '#footer', '#menu', '#main-menu',
  '#site-header', '#site-footer', '#page-header', '#page-footer'
];

// ============== Cookie Banner Detection ==============

/**
 * Comprehensive cookie banner detection and removal
 * Uses multiple strategies to identify genuine cookie consent banners
 */
function removeCookieBanners(element) {
  const classBasedSelectors = [
    '.cc-banner', '.cc-grower', '.consent-banner', '.cookie-banner', 
    '.privacy-banner', '.gdpr-banner', '.cookie-consent', '.privacy-consent',
    '.cookie-notice', '.privacy-notice', '.cookie-policy', '.privacy-policy',
    '.cookie-bar', '.privacy-bar', '.consent-bar', '.gdpr-bar',
    '.cookie-popup', '.privacy-popup', '.consent-popup', '.gdpr-popup',
    '.cookie-modal', '.privacy-modal', '.consent-modal', '.gdpr-modal',
    '.cookie-overlay', '.privacy-overlay', '.consent-overlay', '.gdpr-overlay'
  ];
  
  const idBasedSelectors = [
    '#cookie-banner', '#privacy-banner', '#consent-banner', '#gdpr-banner',
    '#cookie-notice', '#privacy-notice', '#cookie-consent', '#privacy-consent',
    '#cookie-bar', '#privacy-bar', '#consent-bar', '#gdpr-bar', '#cookiemgmt',
    '#cookie-popup', '#privacy-popup', '#consent-popup', '#gdpr-popup',
    '#onetrust-consent-sdk', '#onetrust-banner-sdk',
  ];
  
  const ariaSelectors = [
    '[role="dialog"][aria-label="Consent Banner"]',
    '[role="dialog"][aria-label*="cookie" i]',
    '[role="dialog"][aria-label*="privacy" i]',
    '[role="dialog"][aria-label*="consent" i]',
    '[role="alertdialog"][aria-label*="cookie" i]',
    '[role="alertdialog"][aria-label*="privacy" i]',
    '[aria-describedby*="cookie" i]',
    '[aria-describedby*="privacy" i]'
  ];
  
  // Combine all selectors
  const allSelectors = [...classBasedSelectors, ...idBasedSelectors, ...ariaSelectors];
  
  // Apply class/ID/ARIA based detection with text validation
  allSelectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => {
      if (isCookieBannerElement(el)) {
        el.remove();
      }
    });
  });
}

/**
 * Validates if an element is likely a cookie banner based on text content
 */
function isCookieBannerElement(element) {
  const text = element.textContent.toLowerCase();
  const cookieKeywords = [
    'cookie', 'cookies', 'privacy', 'consent', 'tracking',
    'personalization', 'analytics', 'marketing', 'advertising',
    'data protection', 'terms of service', 'privacy policy',
    'accept all', 'reject all', 'manage preferences', 'cookie settings'
  ];
  
  // Must contain at least one cookie-related keyword
  return cookieKeywords.some(keyword => text.includes(keyword));
}

function filterHtmlContent(htmlContent, ignoreNavFooter = true, returnText = true) {
  /** Filter HTML content by removing unwanted elements, optionally return HTML or text */
  if (!htmlContent) return "";
  
  // For browser environment (Chrome extension)
  if (typeof document !== 'undefined' && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    // Process the entire document to capture JSON-LD in both head and body
    const documentElement = doc.documentElement || doc;
    
    // Remove script elements except JSON-LD structured data, also remove style, noscript, template elements
    documentElement.querySelectorAll("script").forEach(n => {
      // Preserve JSON-LD structured data scripts by converting them to code blocks
      if (n.type === "application/ld+json") {
        const jsonContent = n.textContent || n.innerText || "";
        if (jsonContent.trim()) {
          try {
            // Parse and re-stringify JSON to ensure consistent formatting
            // Handle both single and double quoted JSON
            let cleanJsonContent = jsonContent.trim();
            // Try to fix common JSON issues like single quotes
            const startsValid = cleanJsonContent.startsWith('{') || cleanJsonContent.startsWith('[');
            const endsValid = cleanJsonContent.endsWith('}') || cleanJsonContent.endsWith(']');
            
            if (!startsValid || !endsValid) {
              throw new Error('Not valid JSON structure');
            }
            
            const parsedJson = JSON.parse(cleanJsonContent);
            const formattedJson = JSON.stringify(parsedJson, null, 2);
            
            // Create a pre/code block to preserve JSON-LD for markdown conversion
            const codeBlock = document.createElement("pre");
            const code = document.createElement("code");
            code.className = "ld-json";
            code.textContent = formattedJson;
            codeBlock.appendChild(code);
            n.parentNode.insertBefore(codeBlock, n);
          } catch (e) {
            // If JSON parsing fails, fall back to original content
            const codeBlock = document.createElement("pre");
            const code = document.createElement("code");
            code.className = "ld-json";
            code.textContent = jsonContent.trim();
            codeBlock.appendChild(code);
            n.parentNode.insertBefore(codeBlock, n);
          }
        }
      }
      n.remove();
    });
    documentElement.querySelectorAll("style,noscript,template").forEach(n => n.remove());
    
    // Remove all media elements (images, videos, audio, etc.) to keep only text
    documentElement.querySelectorAll("img,video,audio,picture,svg,canvas,embed,object,iframe").forEach(n => n.remove());
    
    // Remove consent banners with intelligent detection
    removeCookieBanners(documentElement);

    // Conditionally remove navigation and footer elements
    if (ignoreNavFooter) {
      filterNavigationAndFooter(documentElement);
    }
    
    if (returnText) {
      return (documentElement && documentElement.textContent) ? documentElement.textContent : "";
    } else {
      return documentElement.outerHTML;
    }
  }
  
  // For Node.js environment (main.js)
  if (cheerioRef) {
    const $ = cheerioRef.load(htmlContent);
    
    // Remove script elements except JSON-LD structured data, also remove style, noscript, template tags
    $('script').each(function() {
      // Preserve JSON-LD structured data scripts by converting them to code blocks
      if ($(this).attr('type') === 'application/ld+json') {
        const jsonContent = $(this).text().trim();
        if (jsonContent) {
          try {
            // Parse and re-stringify JSON to ensure consistent formatting
            // Handle both single and double quoted JSON
            let cleanJsonContent = jsonContent;
            const startsValid = cleanJsonContent.startsWith('{') || cleanJsonContent.startsWith('[');
            const endsValid = cleanJsonContent.endsWith('}') || cleanJsonContent.endsWith(']');
            
            if (!startsValid || !endsValid) {
              throw new Error('Not valid JSON structure');
            }
            
            const parsedJson = JSON.parse(cleanJsonContent);
            const formattedJson = JSON.stringify(parsedJson, null, 2);
            const codeBlock = `<pre><code class="ld-json">${formattedJson}</code></pre>`;
            $(this).before(codeBlock);
          } catch (e) {
            // If JSON parsing fails, fall back to original content
            const codeBlock = `<pre><code class="ld-json">${jsonContent}</code></pre>`;
            $(this).before(codeBlock);
          }
        }
        $(this).remove();
      } else {
        $(this).remove();
      }
    });
    $('style, noscript, template').remove();
    
    // Remove all media elements (images, videos, audio, etc.) to keep only text
    $('img, video, audio, picture, svg, canvas, embed, object, iframe').remove();
    
    // Conditionally remove navigation and footer elements
    if (ignoreNavFooter) {
      filterNavigationAndFooterCheerio($);
    }
    
    if (returnText) {
      // Get text content from document element
      const textContent = $('html').text() || $('body').text() || "";
      // Clean up whitespace
      return textContent.replace(/\s+/g, ' ').trim();
    } else {
      return $.html();
    }
  }
  
  return "";
}

function stripTagsToText(htmlContent, ignoreNavFooter = true) {
  /** Backward compatibility wrapper for filterHtmlContent */
  return filterHtmlContent(htmlContent, ignoreNavFooter, true);
}

function filterNavigationAndFooter(element) {
  /** Remove navigation and footer elements (browser environment) */
  const allSelectors = navigationSelectors.join(',');
  const elements = element.querySelectorAll(allSelectors);
  elements.forEach(el => el.remove());
}

function filterNavigationAndFooterCheerio($) {
  /** Remove navigation and footer elements (Node.js environment) */
  const allSelectors = navigationSelectors.join(',');
  $(allSelectors).remove();
}

// ============== Word Counting and Tokenization ==============

function extractWordCount(htmlContent) {
  /** Extract word count from HTML content using consistent logic */
  if (!htmlContent) {
    return { word_count: 0 };
  }
  
  const textContent = stripTagsToText(htmlContent);
  
  const word_count = tokenize(textContent, "word").length;
  
  return { word_count };
}


/**
 * Tokenizes text into words or lines with intelligent normalization
 * 
 * @param {string} text - The input text to tokenize
 * @param {string} [mode="word"] - Tokenization mode: "word" or "line"
 * 
 * @returns {string[]} Array of normalized tokens
 * 
 * @description
 * Word mode features:
 * - Normalizes whitespace (collapses multiple spaces, removes leading/trailing)
 * - Standardizes punctuation spacing (e.g., "hello , world" → "hello, world")
 * - Preserves URLs, emails, and structured data as single tokens
 * - Uses robust placeholder system with private Unicode characters
 * - Protects: https://, www., .com/.org/.net/.edu/.gov, email@domain.ext
 * 
 * Line mode features:
 * - Normalizes line endings to consistent format
 * - Collapses horizontal whitespace within lines
 * - Removes empty lines and excessive line breaks
 * 
 * @example
 * // Word tokenization with punctuation normalization
 * tokenize("Hello , world !") 
 * // → ["Hello,", "world!"]
 * 
 * @example
 * // URL preservation
 * tokenize("Visit https://example.com , please")
 * // → ["Visit", "https://example.com,", "please"]
 * 
 * @example
 * // Line tokenization
 * tokenize("Line 1\n\nLine 2\n   Line 3", "line")
 * // → ["Line 1", "Line 2", "Line 3"]
 */
function tokenize(text, mode = "word") {
  if (mode === "line") {
    // For line mode: normalize whitespace first, then split by lines and filter out empty lines
    const normalized = text
      .replace(/\r\n?|\n/g, "\n")  // Normalize line endings
      .replace(/[ \t]+/g, " ")     // Collapse horizontal whitespace to single space
      .replace(/\n\s*\n/g, "\n")   // Collapse multiple empty lines to single
      .trim();
    return normalized.split(/\n/).filter(line => line.length > 0);
  } else {
    // For word mode: normalize all whitespace thoroughly before tokenizing
    let clean = text
      .replace(/\r\n?|\n/g, " ")   // Convert newlines to spaces
      .replace(/\s+/g, " ")        // Collapse multiple whitespace to single space
      .replace(/^\s+|\s+$/g, "");  // Remove leading/trailing whitespace more explicitly
    
    // Protect URLs/links by temporarily replacing them with unique placeholders
    const urlPattern = /\S*(?:https?:\/\/|www\.|\.com|\.org|\.net|\.edu|\.gov|@\S+\.\S+)\S*/gi;
    const urlMap = new Map();
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    clean = clean.replace(urlPattern, (match) => {
      const placeholder = `\u{E000}${uniqueId}_${urlMap.size}\u{E001}`; // Using private use Unicode chars
      urlMap.set(placeholder, match);
      return placeholder;
    });
    
    // Now normalize punctuation spacing on the text without URLs
    clean = clean
      .replace(/\s*([,.!?;:])\s*/g, "$1 ")  // Normalize punctuation spacing
      .replace(/\s+/g, " ");               // Final collapse of any remaining multi-spaces
    
    // Restore URLs
    for (const [placeholder, originalUrl] of urlMap) {
      clean = clean.replace(placeholder, originalUrl);
    }
    
    // Split by whitespace and filter out empty tokens
    return clean.split(/\s+/).filter(token => token.length > 0);
  }
}

// ============== Utility Functions ==============

function hashDJB2(str) {
  /** Generate hash for content comparison */
  if (!str) return "";
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

function pct(n) {
  /** Format percentage with 1 decimal place */
  return (Number.isFinite(n) ? (n * 100).toFixed(1) + "%" : "–");
}

function formatNumberToK(num) {
  /** Format number to K/M format */
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// ============== Diff Engine ==============

function diffTokens(aStr, bStr, mode = "word") {
  /** LCS-based diff returning sequence of {type: 'same'|'add'|'del', text} */
  const A = tokenize(aStr, mode);
  const B = tokenize(bStr, mode);

  // Map tokens to ints for faster LCS
  const sym = new Map();
  const mapTok = t => {
    if (!sym.has(t)) sym.set(t, sym.size + 1);
    return sym.get(t);
  };
  const a = A.map(mapTok);
  const b = B.map(mapTok);

  // LCS length table
  const m = a.length, n = b.length;
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = (a[i - 1] === b[j - 1]) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack to collect ops
  const ops = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: "same", text: A[i - 1] });
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: "del", text: A[i - 1] });
      i--;
    } else {
      ops.push({ type: "add", text: B[j - 1] });
      j--;
    }
  }
  while (i > 0) { ops.push({ type: "del", text: A[i - 1] }); i--; }
  while (j > 0) { ops.push({ type: "add", text: B[j - 1] }); j--; }
  ops.reverse();
  return ops;
}

function generateDiffReport(initText, finText, mode = "word") {
  /** Generate diff report with statistics */
  if (!initText || !finText) {
    return {
      addCount: 0,
      delCount: 0,
      sameCount: 0,
      diffOps: [],
      summary: "No text to compare"
    };
  }

  const ops = diffTokens(initText, finText, mode);
  let addCount = 0, delCount = 0, sameCount = 0;

  ops.forEach(op => {
    if (op.type === "add") addCount++;
    else if (op.type === "del") delCount++;
    else sameCount++;
  });

  return {
    addCount,
    delCount,
    sameCount,
    diffOps: ops,
    summary: `Added: ${addCount.toLocaleString()} • Removed: ${delCount.toLocaleString()} • Same: ${sameCount.toLocaleString()} • Granularity: ${mode}`
  };
}

// ============== Analysis Functions ==============

function analyzeTextComparison(initHtml, finHtml) {
  /** Comprehensive text-only analysis between initial and final HTML */
  const initText = stripTagsToText(initHtml);
  const finText = stripTagsToText(finHtml);
  
  const initTextLength = initText.length;
  const finTextLength = finText.length;
  const textRetention = finTextLength > 0 ? initTextLength / finTextLength : 0;
  
  const wordDiff = generateDiffReport(initText, finText, "word");
  const lineDiff = generateDiffReport(initText, finText, "line");
  
  return {
    initialText: initText,
    finalText: finText,
    initialTextLength: initTextLength,
    finalTextLength: finTextLength,
    textRetention,
    textRetentionPercent: pct(textRetention),
    wordDiff,
    lineDiff,
    initialTextHash: hashDJB2(initText),
    finalTextHash: hashDJB2(finText)
  };
}

// Multi-environment exports
if (typeof window !== 'undefined') {
  // Browser environment (Chrome extension)
  window.HTMLComparisonUtils = {
    filterHtmlContent,
    stripTagsToText,
    extractWordCount,
    analyzeTextComparison,
    hashDJB2,
    pct,
    formatNumberToK,
    tokenize,
    diffTokens,
    generateDiffReport,
    filterNavigationAndFooter
  };
}

// Node.js CommonJS exports (for require() usage)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    filterHtmlContent,
    stripTagsToText,
    extractWordCount,
    analyzeTextComparison,
    hashDJB2,
    pct,
    formatNumberToK,
    tokenize,
    diffTokens,
    generateDiffReport,
    setCheerio
  };
}

