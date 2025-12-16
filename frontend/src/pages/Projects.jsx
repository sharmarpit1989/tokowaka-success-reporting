import { useState, useEffect } from 'react'
import { Plus, FolderOpen, Calendar, Link as LinkIcon, Loader, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Add cache-busting timestamp to prevent stale data
      const response = await fetch(`/api/projects?_=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) throw new Error('Failed to load projects')
      
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('[Projects] Error loading:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openProject = (project) => {
    if (project.type === 'unified') {
      // Store project ID in localStorage and navigate to AI Visibility
      localStorage.setItem('activeProject', JSON.stringify({
        projectId: project.id,
        name: project.name
      }))
      navigate('/ai-visibility')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">
            Manage your URL collections and analysis configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadProjects}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
            title="Refresh projects list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => navigate('/ai-visibility')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Projects</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={loadProjects} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="card text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create a project to save your URL collections, filters, and analysis settings. 
            This makes it easy to switch between different campaigns or domains.
          </p>
          <button 
            onClick={() => navigate('/ai-visibility')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </button>
        </div>
      )}

      {/* Projects Grid (when data exists) */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => openProject(project)}
              className="card hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  {project.type === 'unified' && (
                    <StatusBadge status={project.status} />
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description'}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <span>{project.urlCount} URLs</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                {project.type === 'unified' && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                    {project.hasCitationData && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3 h-3" /> Citations
                      </span>
                    )}
                    {project.hasContentAnalysis && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <CheckCircle2 className="w-3 h-3" /> Analysis
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">📁 About Projects</h3>
        <p className="text-blue-800 text-sm">
          Projects help you organize your work by domain, campaign, or time period. Each project can store:
          URL collections, filter preferences, analysis results, and citation data. Switch between projects 
          seamlessly to compare performance or track different initiatives.
        </p>
      </div>
    </div>
  )
}

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    completed: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2, label: 'Ready' },
    processing_citations: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Processing' },
    processing_content: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock, label: 'Analyzing' },
    error: { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle, label: 'Error' }
  }

  const config = statusConfig[status] || statusConfig.completed
  const Icon = config.icon

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export default Projects

