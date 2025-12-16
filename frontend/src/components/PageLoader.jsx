import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

/**
 * Page Loader Component
 * Shows during initial app load with smooth fade out
 */
function PageLoader() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`
        fixed inset-0 z-[9999] bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800
        flex items-center justify-center
        transition-opacity duration-500
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-24 h-24 mx-auto mb-8 animate-scale-in">
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
          <div className="absolute inset-0 bg-white/30 rounded-2xl animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-primary-600 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
          AI Visibility Dashboard
        </h1>
        <p className="text-primary-100 text-sm animate-fade-in" style={{animationDelay: '0.1s'}}>
          Loading your insights...
        </p>

        {/* Loading Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-shimmer" style={{width: '100%'}}></div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  )
}

export default PageLoader

