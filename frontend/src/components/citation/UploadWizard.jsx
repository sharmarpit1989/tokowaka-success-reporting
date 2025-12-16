import React, { useState } from 'react'
import { Upload, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react'
import LoadingState from '../LoadingState'
import ErrorPanel from '../ErrorPanel'

/**
 * Linear 3-step upload wizard for Citation Performance
 * Replaces confusing dual-upload interface with clear sequential flow
 */
function UploadWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [targetUrls, setTargetUrls] = useState([])
  const [citationJobId, setCitationJobId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  // Step 1: Upload Target URLs
  const handleUrlFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setProgress(30)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/unified/upload-urls', {
        method: 'POST',
        body: formData
      })
      
      setProgress(60)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
      
      const data = await response.json()
      setTargetUrls(data.urls)
      setProgress(100)
      
      // Auto-advance to step 2 after success
      setTimeout(() => {
        setCurrentStep(2)
        setIsProcessing(false)
        setProgress(0)
      }, 500)
    } catch (err) {
      console.error('[Upload Wizard] URL upload error:', err)
      setError({
        title: 'Failed to Upload URLs',
        message: 'We couldn\'t process your URL file.',
        details: err.message,
        actions: [
          { label: 'Try Again', primary: true, onClick: () => setError(null) },
          { label: 'View Help', onClick: () => window.open('/docs/upload-guide', '_blank') }
        ]
      })
      setIsProcessing(false)
    }
  }

  // Step 2: Upload Brand Presence Data
  const handleCitationUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsProcessing(true)
    setError(null)
    setProgress(20)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }
    formData.append('targetUrls', JSON.stringify(targetUrls))

    try {
      const response = await fetch('/api/citations/upload', {
        method: 'POST',
        body: formData
      })
      
      setProgress(40)
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
      
      const data = await response.json()
      setCitationJobId(data.jobId)
      
      // Poll for results
      await pollForResults(data.jobId)
    } catch (err) {
      console.error('[Upload Wizard] Citation upload error:', err)
      setError({
        title: 'Failed to Upload Citation Data',
        message: 'There was a problem processing your brand presence files.',
        details: err.message,
        actions: [
          { label: 'Try Again', primary: true, onClick: () => setError(null) },
          { label: 'Go Back', onClick: () => setCurrentStep(1) }
        ]
      })
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const pollForResults = async (jobId) => {
    const maxAttempts = 40
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/citations/status/${jobId}`)
        const data = await response.json()

        setProgress(40 + (attempts / maxAttempts) * 50)

        if (data.status === 'completed') {
          setProgress(100)
          
          // Fetch actual results
          const resultsResponse = await fetch(`/api/citations/results/${jobId}`)
          const results = await resultsResponse.json()
          
          // Complete wizard
          setTimeout(() => {
            onComplete({ targetUrls, citationData: results, jobId })
            setIsProcessing(false)
          }, 500)
          return
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Processing failed')
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000)
        } else {
          throw new Error('Processing timeout - this is taking longer than expected')
        }
      } catch (err) {
        throw err
      }
    }

    await checkStatus()
  }

  const steps = [
    {
      number: 1,
      title: 'Upload Target URLs',
      description: 'Upload a CSV or Excel file containing URLs you want to track',
      status: currentStep > 1 ? 'complete' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      number: 2,
      title: 'Upload Citation Data',
      description: 'Upload your brand presence data (Excel files from AI platforms)',
      status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      number: 3,
      title: 'View Results',
      description: 'Analyze your citation performance',
      status: currentStep === 3 ? 'complete' : 'pending'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${step.status === 'complete' ? 'bg-green-600 text-white' :
                  step.status === 'active' ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'}
              `}>
                {step.status === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : step.number}
              </div>
              <div className={`hidden md:block ${step.status === 'active' ? 'opacity-100' : 'opacity-50'}`}>
                <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-600">{step.description}</div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className={`w-5 h-5 ${step.status === 'complete' ? 'text-green-600' : 'text-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <ErrorPanel
          title={error.title}
          message={error.message}
          details={error.details}
          actions={error.actions}
          onClose={() => setError(null)}
        />
      )}

      {/* Step Content */}
      <div className="card">
        {/* Step 1: Upload Target URLs */}
        {currentStep === 1 && !isProcessing && (
          <div className="text-center py-8">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Step 1: Upload Target URLs</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Upload a CSV or Excel file with the URLs you want to track. We'll use these to calculate citation rates.
            </p>
            
            <label className="btn-primary cursor-pointer inline-flex items-center gap-2 text-base py-3 px-6">
              <Upload className="w-5 h-5" />
              Choose File
              <input 
                type="file" 
                className="hidden" 
                accept=".csv,.xlsx,.xls"
                onChange={handleUrlFileUpload}
              />
            </label>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <div className="flex items-start gap-2 text-left">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">File Requirements:</p>
                  <ul className="text-xs space-y-1 list-disc ml-4">
                    <li>CSV or Excel format (.csv, .xlsx, .xls)</li>
                    <li>Must have a column named "URL" or "url"</li>
                    <li>One URL per row</li>
                    <li>Include protocol (https://)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Upload Citation Data */}
        {currentStep === 2 && !isProcessing && (
          <div className="text-center py-8">
            <Upload className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Step 2: Upload Citation Data</h3>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              Upload your brand presence data from AI platforms (Excel files).
            </p>
            <p className="text-sm text-green-700 mb-6 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {targetUrls.length} target URLs loaded
            </p>
            
            <label className="btn-primary cursor-pointer inline-flex items-center gap-2 text-base py-3 px-6">
              <Upload className="w-5 h-5" />
              Choose Files
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls"
                multiple
                onChange={handleCitationUpload}
              />
            </label>
            
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <LoadingState
            message={currentStep === 1 ? "Processing URL file..." : "Processing citation data..."}
            progress={progress}
            estimatedTime={currentStep === 2 ? "30-60 seconds" : null}
            size="large"
          />
        )}
      </div>
    </div>
  )
}

export default UploadWizard

