/**
 * App Context
 * Global state management with session persistence
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

// Storage keys
const STORAGE_KEYS = {
  UPLOADED_URLS: 'app_uploaded_urls',
  ANALYSIS_RESULTS: 'app_analysis_results',
  CITATION_DATA: 'app_citation_data',
  ACTIVE_PROJECT: 'app_active_project',
  FILTERS: 'app_filters',
  RECENT_JOBS: 'app_recent_jobs'
};

// Helper functions for localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

const clearStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

export function AppProvider({ children }) {
  // Initialize state from localStorage
  const [uploadedUrls, setUploadedUrls] = useState(() => 
    loadFromStorage(STORAGE_KEYS.UPLOADED_URLS, [])
  );
  
  const [analysisResults, setAnalysisResults] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ANALYSIS_RESULTS, {})
  );
  
  const [citationData, setCitationData] = useState(() => 
    loadFromStorage(STORAGE_KEYS.CITATION_DATA, null)
  );
  
  const [activeProject, setActiveProject] = useState(() => 
    loadFromStorage(STORAGE_KEYS.ACTIVE_PROJECT, null)
  );
  
  const [filters, setFilters] = useState(() => 
    loadFromStorage(STORAGE_KEYS.FILTERS, {
      domain: '',
      platform: '',
      dateRange: null,
      trafficRange: null
    })
  );

  const [recentJobs, setRecentJobs] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RECENT_JOBS, [])
  );

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.UPLOADED_URLS, uploadedUrls);
  }, [uploadedUrls]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ANALYSIS_RESULTS, analysisResults);
  }, [analysisResults]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CITATION_DATA, citationData);
  }, [citationData]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVE_PROJECT, activeProject);
  }, [activeProject]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FILTERS, filters);
  }, [filters]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECENT_JOBS, recentJobs);
  }, [recentJobs]);

  // Action: Add uploaded URLs
  const addUploadedUrls = (urls, metadata = {}) => {
    const newUpload = {
      id: Date.now(),
      urls: Array.isArray(urls) ? urls : [urls],
      uploadedAt: new Date().toISOString(),
      metadata
    };
    setUploadedUrls(prev => [newUpload, ...prev]);
    return newUpload.id;
  };

  // Action: Clear uploaded URLs
  const clearUploadedUrls = () => {
    setUploadedUrls([]);
  };

  // Action: Remove specific upload
  const removeUpload = (uploadId) => {
    setUploadedUrls(prev => prev.filter(u => u.id !== uploadId));
  };

  // Action: Add analysis results
  const addAnalysisResult = (jobId, results) => {
    setAnalysisResults(prev => ({
      ...prev,
      [jobId]: {
        ...results,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Add to recent jobs
    addRecentJob({
      id: jobId,
      type: 'analysis',
      status: results.status,
      timestamp: new Date().toISOString()
    });
  };

  // Action: Update analysis result
  const updateAnalysisResult = (jobId, updates) => {
    setAnalysisResults(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  // Action: Set citation data
  const updateCitationData = (data) => {
    setCitationData({
      ...data,
      uploadedAt: new Date().toISOString()
    });
  };

  // Action: Clear citation data
  const clearCitationData = () => {
    setCitationData(null);
  };

  // Action: Set active project
  const updateActiveProject = (project) => {
    setActiveProject(project);
  };

  // Action: Clear active project
  const clearActiveProject = () => {
    setActiveProject(null);
  };

  // Action: Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Action: Reset filters
  const resetFilters = () => {
    setFilters({
      domain: '',
      platform: '',
      dateRange: null,
      trafficRange: null
    });
  };

  // Action: Add recent job
  const addRecentJob = (job) => {
    setRecentJobs(prev => {
      const filtered = prev.filter(j => j.id !== job.id);
      return [job, ...filtered].slice(0, 10); // Keep last 10 jobs
    });
  };

  // Action: Update recent job
  const updateRecentJob = (jobId, updates) => {
    setRecentJobs(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      )
    );
  };

  // Action: Clear all data
  const clearAllData = () => {
    setUploadedUrls([]);
    setAnalysisResults({});
    setCitationData(null);
    setActiveProject(null);
    setRecentJobs([]);
    // Clear from localStorage
    Object.values(STORAGE_KEYS).forEach(key => clearStorage(key));
  };

  // Computed values
  const allUrls = uploadedUrls.flatMap(upload => upload.urls);
  const hasUploadedData = uploadedUrls.length > 0;
  const hasAnalysisResults = Object.keys(analysisResults).length > 0;
  const hasCitationData = citationData !== null;
  const hasActiveProject = activeProject !== null;

  const value = {
    // State
    uploadedUrls,
    analysisResults,
    citationData,
    activeProject,
    filters,
    recentJobs,
    
    // Computed
    allUrls,
    hasUploadedData,
    hasAnalysisResults,
    hasCitationData,
    hasActiveProject,
    
    // Actions
    addUploadedUrls,
    clearUploadedUrls,
    removeUpload,
    addAnalysisResult,
    updateAnalysisResult,
    updateCitationData,
    clearCitationData,
    updateActiveProject,
    clearActiveProject,
    updateFilters,
    resetFilters,
    addRecentJob,
    updateRecentJob,
    clearAllData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

export default AppContext;

