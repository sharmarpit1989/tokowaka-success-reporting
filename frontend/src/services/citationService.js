/**
 * Citation Service
 * Handles all citation tracking related API calls
 */

import apiClient, { uploadFile } from './api';

/**
 * Upload brand presence files
 */
export async function uploadBrandPresence(files, onProgress) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  return uploadFile('/citations/upload', formData, onProgress);
}

/**
 * Get citation rates
 */
export async function getCitationRates(filters = {}) {
  return apiClient.get('/citations/rates', { params: filters });
}

/**
 * Get citation trends
 */
export async function getCitationTrends(filters = {}) {
  return apiClient.get('/citations/trends', { params: filters });
}

/**
 * Get citation history
 */
export async function getCitationHistory() {
  return apiClient.get('/citations/history');
}

/**
 * Get citation details for a specific URL
 */
export async function getCitationDetails(url) {
  return apiClient.get(`/citations/details`, { params: { url } });
}

export default {
  uploadBrandPresence,
  getCitationRates,
  getCitationTrends,
  getCitationHistory,
  getCitationDetails
};

