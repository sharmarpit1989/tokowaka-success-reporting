/**
 * Project Service
 * Handles all project management related API calls
 */

import apiClient from './api';

/**
 * Create a new project
 */
export async function createProject(projectData) {
  return apiClient.post('/projects', projectData);
}

/**
 * Get all projects
 */
export async function getProjects() {
  return apiClient.get('/projects');
}

/**
 * Get project by ID
 */
export async function getProject(projectId) {
  return apiClient.get(`/projects/${projectId}`);
}

/**
 * Update project
 */
export async function updateProject(projectId, updates) {
  return apiClient.put(`/projects/${projectId}`, updates);
}

/**
 * Delete project
 */
export async function deleteProject(projectId) {
  return apiClient.delete(`/projects/${projectId}`);
}

/**
 * Duplicate project
 */
export async function duplicateProject(projectId) {
  return apiClient.post(`/projects/${projectId}/duplicate`);
}

export default {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  duplicateProject
};

