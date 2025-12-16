import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react'

/**
 * Enhanced Toast Notification Component
 * Provides smooth, animated notifications with auto-dismiss
 */
function Toast({ type = 'info', message, onClose, duration = 5000, position = 'top-right' }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // Auto-dismiss timer
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 300) // Match animation duration
  }

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      iconColor: 'text-green-600',
      progressColor: 'bg-green-600'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
      progressColor: 'bg-red-600'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-600',
      progressColor: 'bg-yellow-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
      progressColor: 'bg-blue-600'
    },
    loading: {
      icon: Loader2,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-900',
      iconColor: 'text-gray-600',
      progressColor: 'bg-gray-600'
    }
  }

  const settings = config[type] || config.info
  const Icon = settings.icon

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  const animationClass = isExiting 
    ? 'opacity-0 translate-x-4 scale-95' 
    : isVisible 
      ? 'opacity-100 translate-x-0 scale-100' 
      : 'opacity-0 translate-x-4 scale-95'

  return (
    <div
      className={`
        fixed ${positionClasses[position]} z-50 max-w-md w-full mx-auto
        transition-all duration-300 ease-out
        ${animationClass}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className={`
        ${settings.bgColor} ${settings.borderColor}
        border rounded-lg shadow-lg overflow-hidden
        backdrop-blur-sm bg-opacity-95
      `}>
        <div className="flex items-start gap-3 p-4">
          <div className={`flex-shrink-0 ${settings.iconColor}`}>
            <Icon 
              className={`w-5 h-5 ${type === 'loading' ? 'animate-spin' : ''}`}
            />
          </div>
          <div className={`flex-1 ${settings.textColor} text-sm font-medium leading-relaxed`}>
            {message}
          </div>
          {type !== 'loading' && (
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${settings.iconColor} hover:opacity-75 transition-opacity`}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {duration > 0 && type !== 'loading' && (
          <div className="h-1 bg-gray-200 bg-opacity-30">
            <div
              className={`h-full ${settings.progressColor} transition-all ease-linear`}
              style={{
                width: isExiting ? '0%' : '100%',
                transitionDuration: `${duration}ms`
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Toast Container for managing multiple toasts
 */
export function ToastContainer({ toasts = [], onRemove }) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 p-4 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id || index}
            style={{ '--index': index }}
            className="animate-slide-in-right"
          >
            <Toast
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              position={toast.position}
              onClose={() => onRemove(toast.id || index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Custom hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (type, message, options = {}) => {
    const id = Date.now() + Math.random()
    const toast = {
      id,
      type,
      message,
      duration: options.duration ?? 5000,
      position: options.position ?? 'top-right'
    }
    setToasts(prev => [...prev, toast])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const clearAll = () => {
    setToasts([])
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success: (message, options) => addToast('success', message, options),
    error: (message, options) => addToast('error', message, options),
    warning: (message, options) => addToast('warning', message, options),
    info: (message, options) => addToast('info', message, options),
    loading: (message, options) => addToast('loading', message, { ...options, duration: 0 })
  }
}

export default Toast

