import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleGoHome = () => {
    this.handleReset()
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      Oops! Something went wrong
                    </h1>
                    <p className="text-gray-600">
                      We encountered an unexpected error
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Don't worry, this happens sometimes. Your data is safe. Here's what you can do:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside ml-2">
                    <li>Try refreshing the page</li>
                    <li>Return to the home page and try again</li>
                    <li>If the problem persists, contact support</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Refresh Page
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 hover:shadow-sm hover:scale-105 active:scale-95"
                  >
                    <Home className="w-5 h-5" />
                    Go Home
                  </button>
                </div>

                {/* Error details (collapsible) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-700">
                      Technical Details (Development Only)
                    </summary>
                    <div className="p-4 border-t border-gray-200 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Error Message:</p>
                        <pre className="text-xs bg-red-50 text-red-800 p-3 rounded border border-red-200 overflow-x-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Component Stack:</p>
                          <pre className="text-xs bg-gray-100 text-gray-700 p-3 rounded border border-gray-300 overflow-x-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-8 py-4">
                <p className="text-xs text-gray-500 text-center">
                  If this issue continues, please contact support with the error details above
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

