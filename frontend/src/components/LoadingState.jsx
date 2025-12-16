import React from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Consistent loading state component with progress tracking
 * Used throughout the app for all async operations
 */
function LoadingState({ 
  message = "Loading...", 
  progress = null, 
  estimatedTime = null,
  size = "medium",
  showSpinner = true,
  className = ""
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 animate-fade-in ${className}`}>
      {showSpinner && (
        <div className="relative mb-4">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-blue-400 opacity-20 animate-pulse`}></div>
          {/* Spinner */}
          <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 relative`} />
        </div>
      )}
      <p className="text-sm font-medium text-gray-700 animate-pulse-soft">{message}</p>
      
      {progress !== null && (
        <div className="w-64 mt-4 animate-fade-in">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center font-medium">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
      
      {estimatedTime && (
        <p className="text-xs text-gray-500 mt-3 animate-fade-in">
          ⏱️ Estimated time: {estimatedTime}
        </p>
      )}
      
      {/* Subtle loading dots */}
      {!progress && (
        <div className="flex gap-1.5 mt-3">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      )}
    </div>
  )
}

export default LoadingState

