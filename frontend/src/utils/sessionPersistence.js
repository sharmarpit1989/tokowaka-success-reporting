/**
 * Session Persistence Utility
 * Handles UI-specific localStorage operations with error handling and versioning
 * 
 * NOTE: Data persistence (citation data, URLs) is handled by AppContext.
 * This utility only manages UI preferences (filters, collapsed sections, onboarding state).
 */

const STORAGE_VERSION = '2.0' // Bumped for single-source-of-truth refactor
const STORAGE_KEYS = {
  // UI preferences only (data is in AppContext)
  SELECTED_WEEKS: 'citationPerformance_selectedWeeks',
  SELECTED_URLS: 'citationPerformance_selectedUrls',
  VERSION: 'citationPerformance_version',
  ONBOARDING_COMPLETE: 'citationPerformance_onboardingComplete',
  UI_STATE: 'citationPerformance_uiState'
  // Removed: CITATION_DATA, TARGET_URLS, LAST_UPDATED (now in AppContext)
}

/**
 * Check if localStorage is available and writable
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    console.warn('[Session Persistence] localStorage not available:', e.message)
    return false
  }
}

/**
 * Check if stored data version matches current version
 */
function checkVersion() {
  if (!isLocalStorageAvailable()) return false
  
  const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION)
  if (storedVersion !== STORAGE_VERSION) {
    console.log('[Session Persistence] Version mismatch, clearing old data')
    clearSession()
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION)
    return false
  }
  return true
}

/**
 * NOTE: Citation data and target URLs are now managed by AppContext
 * These functions have been removed to maintain single source of truth
 * Data persistence happens automatically via AppContext
 */

/**
 * Save filter selections
 */
export function saveFilters(selectedWeeks, selectedUrls) {
  if (!isLocalStorageAvailable()) return false
  
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_WEEKS, JSON.stringify(selectedWeeks))
    localStorage.setItem(STORAGE_KEYS.SELECTED_URLS, JSON.stringify(selectedUrls))
    console.log('[Session Persistence] Filters saved')
    return true
  } catch (e) {
    console.error('[Session Persistence] Failed to save filters:', e.message)
    return false
  }
}

/**
 * Load filter selections
 */
export function loadFilters() {
  if (!isLocalStorageAvailable() || !checkVersion()) return { weeks: [], urls: [] }
  
  try {
    const weeks = localStorage.getItem(STORAGE_KEYS.SELECTED_WEEKS)
    const urls = localStorage.getItem(STORAGE_KEYS.SELECTED_URLS)
    
    return {
      weeks: weeks ? JSON.parse(weeks) : [],
      urls: urls ? JSON.parse(urls) : []
    }
  } catch (e) {
    console.error('[Session Persistence] Failed to load filters:', e.message)
    return { weeks: [], urls: [] }
  }
}

/**
 * Save UI state (collapsed sections, etc.)
 */
export function saveUIState(state) {
  if (!isLocalStorageAvailable()) return false
  
  try {
    localStorage.setItem(STORAGE_KEYS.UI_STATE, JSON.stringify(state))
    return true
  } catch (e) {
    console.error('[Session Persistence] Failed to save UI state:', e.message)
    return false
  }
}

/**
 * Load UI state
 */
export function loadUIState() {
  if (!isLocalStorageAvailable() || !checkVersion()) return null
  
  try {
    const state = localStorage.getItem(STORAGE_KEYS.UI_STATE)
    return state ? JSON.parse(state) : null
  } catch (e) {
    console.error('[Session Persistence] Failed to load UI state:', e.message)
    return null
  }
}

/**
 * Check if onboarding has been completed
 */
export function isOnboardingComplete() {
  if (!isLocalStorageAvailable()) return true // Skip if localStorage not available
  
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true'
  } catch (e) {
    return true
  }
}

/**
 * Mark onboarding as complete
 */
export function setOnboardingComplete() {
  if (!isLocalStorageAvailable()) return
  
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true')
    console.log('[Session Persistence] Onboarding marked complete')
  } catch (e) {
    console.error('[Session Persistence] Failed to mark onboarding complete:', e.message)
  }
}

/**
 * Get last updated timestamp (from AppContext citation data)
 */
export function getLastUpdated() {
  console.warn('[Session Persistence] getLastUpdated() is deprecated. Use citationData.uploadedAt from AppContext instead.')
  return null
}

/**
 * Clear all session data
 */
export function clearSession() {
  if (!isLocalStorageAvailable()) return
  
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('[Session Persistence] Session cleared')
  } catch (e) {
    console.error('[Session Persistence] Failed to clear session:', e.message)
  }
}

/**
 * Get storage statistics (UI preferences only)
 * Data statistics are available via AppContext
 */
export function getStorageStats() {
  if (!isLocalStorageAvailable()) {
    return { available: false }
  }
  
  try {
    const selectedWeeks = localStorage.getItem(STORAGE_KEYS.SELECTED_WEEKS)
    const selectedUrls = localStorage.getItem(STORAGE_KEYS.SELECTED_URLS)
    const uiState = localStorage.getItem(STORAGE_KEYS.UI_STATE)
    
    return {
      available: true,
      hasFilters: !!(selectedWeeks || selectedUrls),
      hasUIState: !!uiState,
      onboardingComplete: isOnboardingComplete(),
      note: 'Data storage managed by AppContext'
    }
  } catch (e) {
    return { available: true, error: e.message }
  }
}

export default {
  // UI preferences only
  saveFilters,
  loadFilters,
  saveUIState,
  loadUIState,
  isOnboardingComplete,
  setOnboardingComplete,
  clearSession,
  getStorageStats
  // Note: Data functions removed - use AppContext for data
}

