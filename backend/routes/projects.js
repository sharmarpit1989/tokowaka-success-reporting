/**
 * Project Management Routes
 * Handles saving/loading URL collections and filter configurations
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const config = require('../utils/config');

// Support both old projects system and new unified system
const PROJECTS_DIR = config.storage.projectsDir;
const RESULTS_DIR = config.storage.resultsDir;

/**
 * GET /api/projects
 * List all saved projects (both old-style and unified)
 */
router.get('/', async (req, res) => {
  try {
    const projects = [];

    // Load unified projects (new system - AI Visibility)
    await fs.ensureDir(RESULTS_DIR);
    const resultsFiles = await fs.readdir(RESULTS_DIR);
    
    for (const file of resultsFiles) {
      if (file.startsWith('unified-') && file.endsWith('.json')) {
        try {
          const filePath = path.join(RESULTS_DIR, file);
          const project = await fs.readJson(filePath);
          const stats = await fs.stat(filePath);
          
          projects.push({
            id: project.projectId,
            name: project.name || 'Unnamed Project',
            domain: project.targetUrls?.[0] || 'N/A',
            urlCount: project.targetUrls?.length || 0,
            createdAt: project.createdAt,
            updatedAt: stats.mtime,
            description: `Unified analysis project`,
            type: 'unified',
            status: project.status,
            hasCitationData: !!project.citationJobId,
            hasContentAnalysis: !!project.contentAnalysisJobId
          });
        } catch (err) {
          console.warn(`Failed to read unified project ${file}:`, err.message);
        }
      }
    }

    // Load old-style projects (legacy system)
    await fs.ensureDir(PROJECTS_DIR);
    const projectFiles = await fs.readdir(PROJECTS_DIR);
    
    for (const file of projectFiles) {
      if (file.endsWith('.json') && !file.startsWith('unified-')) {
        try {
          const filePath = path.join(PROJECTS_DIR, file);
          const project = await fs.readJson(filePath);
          const stats = await fs.stat(filePath);
          
          projects.push({
            id: project.id,
            name: project.name,
            domain: project.domain,
            urlCount: project.urls?.length || 0,
            createdAt: project.createdAt,
            updatedAt: stats.mtime,
            description: project.description,
            type: 'legacy'
          });
        } catch (err) {
          console.warn(`Failed to read legacy project ${file}:`, err.message);
        }
      }
    }

    // Sort by updated date descending
    projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ projects });

  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res) => {
  try {
    const { name, domain, urls = [], filters = {}, description = '' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectId = uuidv4();
    const project = {
      id: projectId,
      name,
      domain,
      urls,
      filters,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await fs.ensureDir(PROJECTS_DIR);
    const projectPath = path.join(PROJECTS_DIR, `${projectId}.json`);
    await fs.writeJson(projectPath, project, { spaces: 2 });

    res.json({
      success: true,
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/projects/:id
 * Get project details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = path.join(PROJECTS_DIR, `${id}.json`);

    if (!await fs.pathExists(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = await fs.readJson(projectPath);
    res.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = path.join(PROJECTS_DIR, `${id}.json`);

    if (!await fs.pathExists(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingProject = await fs.readJson(projectPath);
    const updatedProject = {
      ...existingProject,
      ...req.body,
      id, // Ensure ID doesn't change
      createdAt: existingProject.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };

    await fs.writeJson(projectPath, updatedProject, { spaces: 2 });

    res.json({
      success: true,
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = path.join(PROJECTS_DIR, `${id}.json`);

    if (!await fs.pathExists(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await fs.remove(projectPath);

    res.json({
      success: true,
      message: 'Project deleted'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/projects/:id/duplicate
 * Duplicate an existing project
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const projectPath = path.join(PROJECTS_DIR, `${id}.json`);

    if (!await fs.pathExists(projectPath)) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingProject = await fs.readJson(projectPath);
    const newId = uuidv4();
    const newProject = {
      ...existingProject,
      id: newId,
      name: `${existingProject.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProjectPath = path.join(PROJECTS_DIR, `${newId}.json`);
    await fs.writeJson(newProjectPath, newProject, { spaces: 2 });

    res.json({
      success: true,
      project: newProject
    });

  } catch (error) {
    console.error('Duplicate project error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

