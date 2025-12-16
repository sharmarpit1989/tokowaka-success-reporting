/**
 * Spacecat Service
 * Handles all Spacecat API related calls
 */

import apiClient from './api';

/**
 * Get top pages for a domain
 */
export async function getTopPages(domain, limit = 100) {
  return apiClient.get(`/spacecat/top-pages/${domain}`, {
    params: { limit }
  });
}

/**
 * Get traffic data for specific URL
 */
export async function getUrlTraffic(url) {
  return apiClient.get(`/spacecat/traffic`, {
    params: { url }
  });
}

/**
 * Get traffic data for multiple URLs
 */
export async function getBulkTraffic(urls) {
  return apiClient.post(`/spacecat/bulk-traffic`, { urls });
}

/**
 * Get available domains
 */
export async function getAvailableDomains() {
  return apiClient.get(`/spacecat/domains`);
}

export default {
  getTopPages,
  getUrlTraffic,
  getBulkTraffic,
  getAvailableDomains
};

