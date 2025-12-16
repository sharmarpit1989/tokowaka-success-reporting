import React from 'react'
import { AlertCircle, RefreshCw, HelpCircle, X } from 'lucide-react'

/**
 * User-friendly error panel with recovery actions
 * Replaces technical error alerts throughout the app
 */
function ErrorPanel({ 
  title = "Something went wrong",
  message = "An unexpected error occurred",
  details = null,
  actions = [],
  onClose = null,
  severity = "error" // error, warning, info
}) {
  const severityConfig = {
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      messageColor: "text-red-800",
      icon: AlertCircle
    },
    warning: {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      titleColor: "text-orange-900",
      messageColor: "text-orange-800",
      icon: AlertCircle
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      messageColor: "text-blue-800",
      icon: HelpCircle
    }
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-sm animate-fade-in`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className={`text-sm font-bold ${config.titleColor} mb-1`}>
              {title}
            </h3>
            {onClose && (
              <button
                onClick={onClose}
                className={`${config.iconColor} hover:opacity-70 transition-opacity`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className={`text-sm ${config.messageColor} mb-2`}>
            {message}
          </p>
          
          {details && (
            <details className="mt-2">
              <summary className={`text-xs ${config.messageColor} cursor-pointer hover:underline`}>
                Technical details
              </summary>
              <pre className="mt-2 text-xs bg-white bg-opacity-50 rounded p-2 overflow-x-auto">
                {details}
              </pre>
            </details>
          )}
          
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    action.primary 
                      ? `bg-${severity === 'error' ? 'red' : severity === 'warning' ? 'orange' : 'blue'}-600 hover:bg-${severity === 'error' ? 'red' : severity === 'warning' ? 'orange' : 'blue'}-700 text-white`
                      : `bg-white hover:bg-gray-50 ${config.messageColor} border ${config.borderColor}`
                  }`}
                >
                  {action.icon && <action.icon className="w-3 h-3 inline mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorPanel

