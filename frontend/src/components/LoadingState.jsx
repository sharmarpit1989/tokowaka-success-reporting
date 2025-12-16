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
  size = "medium" 
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600 mb-3`} />
      <p className="text-sm font-medium text-gray-700">{message}</p>
      
      {progress !== null && (
        <div className="w-64 mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
      
      {estimatedTime && (
        <p className="text-xs text-gray-500 mt-2">
          Estimated time: {estimatedTime}
        </p>
      )}
    </div>
  )
}

export default LoadingState

