import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles,
  Zap,
  Trash2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import DataPersistenceIndicator from './DataPersistenceIndicator'

function Layout({ children }) {
  const location = useLocation()
  const { allUrls, hasAnalysisResults, hasActiveProject, clearAllData } = useAppContext()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'AI Visibility Analysis', href: '/ai-visibility', icon: Zap },
    { name: 'Citation Performance', href: '/citation-performance', icon: TrendingUp },
    { name: 'Trends & Insights', href: '/trends-insights', icon: Sparkles },
  ]

  const sidebarWidth = isSidebarExpanded || isPinned ? 'w-64' : 'w-20'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Visibility Dashboard</h1>
                <p className="text-xs text-gray-500">Track & optimize AI platform visibility</p>
              </div>
            </div>
            
            {/* Quick Stats in Header */}
            {(allUrls.length > 0 || hasActiveProject) && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">{allUrls.length}</span> URLs tracked
                  </span>
                </div>
                {hasAnalysisResults && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-600">Analysis ready</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Hover-Expandable Sidebar */}
        <aside 
          className={`
            ${sidebarWidth} bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] 
            sticky top-16 transition-all duration-300 ease-in-out z-40
            ${!isPinned && !isSidebarExpanded ? 'shadow-lg' : ''}
          `}
          onMouseEnter={() => !isPinned && setIsSidebarExpanded(true)}
          onMouseLeave={() => !isPinned && setIsSidebarExpanded(false)}
        >
          {/* Pin/Unpin Button */}
          <div className="absolute -right-3 top-4 z-50">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-1.5 bg-white border-2 border-gray-300 rounded-full hover:border-primary-500 hover:bg-primary-50 transition-all shadow-md group"
              title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {isPinned ? (
                <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-primary-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const Icon = item.icon
              const showText = isSidebarExpanded || isPinned
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group relative flex items-center px-3 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 font-medium shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                    }
                    ${!showText ? 'justify-center' : 'space-x-3'}
                  `}
                  title={!showText ? item.name : ''}
                >
                  <Icon className={`
                    w-5 h-5 flex-shrink-0 transition-transform duration-200
                    ${isActive ? 'text-primary-700' : 'text-gray-500 group-hover:text-gray-700'}
                    ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                  `} />
                  
                  {showText && (
                    <span className="transition-opacity duration-200 whitespace-nowrap">
                      {item.name}
                    </span>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full"></div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {!showText && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Session Info - Only show when expanded */}
          {(isSidebarExpanded || isPinned) && (
            <div className="px-4 py-4 mt-auto border-t border-gray-200 animate-fade-in">
              <div className="text-xs text-gray-500 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Session Data
                  </span>
                </div>
                
                <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Project</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${hasActiveProject 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {hasActiveProject ? '✓ Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total URLs</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {allUrls.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Analysis</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${hasAnalysisResults 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {hasAnalysisResults ? '✓ Ready' : 'None'}
                    </span>
                  </div>
                </div>
                
                {/* Clear Data Button */}
                {(allUrls.length > 0 || hasAnalysisResults || hasActiveProject) && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all session data? This cannot be undone.')) {
                        clearAllData();
                      }
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All Data
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Collapsed State Indicator */}
          {!isSidebarExpanded && !isPinned && (allUrls.length > 0 || hasActiveProject) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="text-xs font-bold text-gray-900">{allUrls.length}</div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Data Persistence Indicator */}
              <DataPersistenceIndicator />
              
              {/* Content Container with subtle shadow */}
              <div className="bg-white/50 rounded-xl backdrop-blur-sm">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

