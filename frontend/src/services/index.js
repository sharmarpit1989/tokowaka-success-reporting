/**
 * Service Layer Index
 * Export all services from a single entry point
 */

export { default as citationService } from './citationService';
export { default as projectService } from './projectService';
export { default as unifiedService } from './unifiedService';
export { default as spacecatService } from './spacecatService';
export { default as apiClient } from './api';

// Re-export individual functions for convenience
export * from './citationService';
export * from './projectService';
export * from './unifiedService';
export * from './spacecatService';

