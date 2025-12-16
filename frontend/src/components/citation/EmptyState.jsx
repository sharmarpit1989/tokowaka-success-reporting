import React from 'react'
import { BarChart3, Upload } from 'lucide-react'

/**
 * Empty state component for when no citation data is available
 */
function EmptyState() {
  return (
    <div className="card text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Citation Data Yet</h3>
        <p className="text-gray-600 mb-6">
          Upload your target URLs and brand presence files to start tracking citation performance across AI platforms.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmptyState

