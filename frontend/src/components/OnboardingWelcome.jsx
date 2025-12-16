import React, { useState } from 'react'
import { Sparkles, Upload, BarChart3, TrendingUp, X } from 'lucide-react'

/**
 * First-time user onboarding flow
 * Shows welcome message and guides users through initial setup
 */
function OnboardingWelcome({ onComplete, onLoadSample }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to Citation Performance Tracker!",
      description: "Track how often AI platforms cite your URLs and discover optimization opportunities.",
      action: { label: "Get Started", onClick: () => setCurrentStep(1) }
    },
    {
      icon: Upload,
      title: "Step 1: Upload Your Data",
      description: "You'll need two things: (1) A list of target URLs to track, and (2) Brand presence data from AI platforms.",
      tips: [
        "Upload target URLs first (CSV or Excel)",
        "Then upload brand presence data (Excel files)",
        "We'll process everything automatically"
      ],
      action: { label: "I'm Ready to Upload", onClick: onComplete }
    }
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative">
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <Icon className="w-12 h-12 mb-3" />
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-blue-100">{currentStepData.description}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentStepData.tips && (
            <div className="space-y-3 mb-6">
              {currentStepData.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 text-sm pt-0.5">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {currentStep === 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">Upload Data</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">Analyze Performance</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-700">Track Trends</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={currentStepData.action.onClick}
              className="flex-1 btn-primary py-3 text-base font-semibold"
            >
              {currentStepData.action.label}
            </button>
            
            {currentStep === 0 && onLoadSample && (
              <button
                onClick={() => {
                  onLoadSample()
                  onComplete()
                }}
                className="flex-1 btn-secondary py-3 text-base font-semibold"
              >
                Explore Sample Data
              </button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWelcome

