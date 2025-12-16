/**
 * Performance Utilities
 * Helpers for debouncing, throttling, and optimizing interactions
 */

/**
 * Debounce function calls to improve performance
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function calls to limit execution rate
 * Useful for scroll handlers, mousemove events, etc.
 */
export function throttle(func, limit = 100) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Request animation frame wrapper for smooth animations
 */
export function rafThrottle(func) {
  let rafId = null
  return function executedFunction(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args)
        rafId = null
      })
    }
  }
}

/**
 * Lazy load images when they enter viewport
 */
export function lazyLoad(elements, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }

  const observerOptions = { ...defaultOptions, ...options }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        const src = img.getAttribute('data-src')
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      }
    })
  }, observerOptions)

  elements.forEach((el) => imageObserver.observe(el))

  return imageObserver
}

/**
 * Prevent layout shift by calculating and setting dimensions
 */
export function preventLayoutShift(element) {
  if (!element) return

  const { width, height } = element.getBoundingClientRect()
  element.style.minWidth = `${width}px`
  element.style.minHeight = `${height}px`
}

/**
 * Smooth scroll to element with offset
 */
export function smoothScrollTo(elementOrSelector, offset = 0) {
  const element =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector

  if (!element) return

  const top = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({
    top,
    behavior: 'smooth'
  })
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element, offset = 0) {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 - offset &&
    rect.left >= 0 - offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  )
}

/**
 * Get optimal chunk size for processing large arrays
 */
export function getOptimalChunkSize(totalItems, targetDuration = 50) {
  // Aim to process items in ~50ms chunks to avoid blocking UI
  const testChunk = Math.min(100, totalItems)
  const startTime = performance.now()
  
  // Simulate processing
  for (let i = 0; i < testChunk; i++) {
    // Empty loop for timing
  }
  
  const duration = performance.now() - startTime
  const itemsPerMs = testChunk / duration
  return Math.max(1, Math.floor(itemsPerMs * targetDuration))
}

/**
 * Process large arrays in chunks to avoid blocking UI
 */
export async function processInChunks(array, processor, chunkSize = 100, onProgress = null) {
  const results = []
  const totalChunks = Math.ceil(array.length / chunkSize)
  
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(chunk.map(processor))
    results.push(...chunkResults)
    
    // Update progress
    if (onProgress) {
      const progress = Math.min(100, ((i + chunkSize) / array.length) * 100)
      onProgress(progress, i + chunkSize, array.length)
    }
    
    // Yield to browser to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  
  return results
}

/**
 * Memoize expensive function calls
 */
export function memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map()
  
  return function memoized(...args) {
    const key = keyGenerator(...args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Create a simple LRU cache
 */
export function createLRUCache(maxSize = 100) {
  const cache = new Map()
  
  return {
    get(key) {
      if (!cache.has(key)) return undefined
      
      // Move to end (most recent)
      const value = cache.get(key)
      cache.delete(key)
      cache.set(key, value)
      return value
    },
    
    set(key, value) {
      // Remove if exists
      if (cache.has(key)) {
        cache.delete(key)
      }
      
      // Add to end
      cache.set(key, value)
      
      // Remove oldest if over capacity
      if (cache.size > maxSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
    },
    
    has(key) {
      return cache.has(key)
    },
    
    clear() {
      cache.clear()
    }
  }
}

