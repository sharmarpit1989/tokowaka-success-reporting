/**
 * Unified Analysis Service
 * Handles unified analysis combining content analysis and citations
 */

import apiClient, { uploadFile } from './api';

/**
 * Create unified project from URL file
 */
export async function createProjectFromFile(file, domain, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('domain', domain);
  
  return uploadFile('/unified/create-from-file', formData, onProgress);
}

/**
 * Create unified project from sitemaps
 */
export async function createProjectFromSitemaps(domain, sitemapUrls) {
  return apiClient.post('/unified/create', { domain, sitemapUrls });
}

/**
 * Upload brand presence data for project
 */
export async function uploadProjectCitations(projectId, files, onProgress) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  return uploadFile(`/unified/${projectId}/upload-citations`, formData, onProgress);
}

/**
 * Start content analysis for project
 */
export async function analyzeProjectContent(projectId, urls = null, options = {}) {
  return apiClient.post(`/unified/${projectId}/analyze-content`, { urls, options });
}

/**
 * Get unified dashboard data
 */
export async function getUnifiedDashboard(projectId) {
  return apiClient.get(`/unified/${projectId}/dashboard`);
}

/**
 * Get project status
 */
export async function getProjectStatus(projectId) {
  return apiClient.get(`/unified/${projectId}/status`);
}

export default {
  createProjectFromFile,
  createProjectFromSitemaps,
  uploadProjectCitations,
  analyzeProjectContent,
  getUnifiedDashboard,
  getProjectStatus
};

