import React from 'react'

/**
 * Reusable metric card component
 * Displays key performance indicators with consistent styling
 */
function MetricCard({ title, value, icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600'
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">{title}</div>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{subtitle}</div>
    </div>
  )
}

export default MetricCard

