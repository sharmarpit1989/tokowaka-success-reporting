import { TrendingUp, Info } from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import ContentOpportunities from '../components/ContentOpportunities'

function TrendsInsights() {
  const { activeProject } = useAppContext()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm animate-fade-in hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="animate-scale-in">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              Trends & Insights
            </h1>
            <p className="text-gray-600 max-w-3xl">
              Discover content opportunities, analyze prompt patterns, and get AI-powered recommendations to improve your citation performance
            </p>
          </div>
        </div>
      </div>

      {/* Content Opportunities Section */}
      {activeProject && activeProject.projectId ? (
        <ContentOpportunities projectId={activeProject.projectId} />
      ) : (
        <div className="card">
          <div className="flex items-start gap-4 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">No Active Project</h3>
              <p className="text-blue-800 mb-4">
                To view trends and insights, you need to have an active project with citation data.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Step 1:</strong> Go to <strong>AI Visibility Analysis</strong> and create a project</p>
                <p><strong>Step 2:</strong> Upload target URLs</p>
                <p><strong>Step 3:</strong> Upload brand presence data (citation data)</p>
                <p><strong>Step 4:</strong> Return here to see content opportunities and AI recommendations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-all duration-300 stagger-item">
        <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About Trends & Insights
        </h3>
        <div className="space-y-3 text-yellow-800">
          <p>
            This dashboard uses advanced analysis to help you discover content gaps and optimization opportunities:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li className="stagger-item"><strong>Thematic Analysis:</strong> Groups prompts into themes (Pricing, Features, Comparisons, etc.)</li>
            <li className="stagger-item" style={{animationDelay: '0.1s'}}><strong>Content Opportunities:</strong> Identifies themes with low citation rates but high prompt volume</li>
            <li className="stagger-item" style={{animationDelay: '0.15s'}}><strong>Pattern Analysis:</strong> Compares high-performing vs low-performing content structures</li>
            <li className="stagger-item" style={{animationDelay: '0.2s'}}><strong>AI Recommendations:</strong> Get specific, actionable suggestions powered by Azure OpenAI</li>
            <li className="stagger-item" style={{animationDelay: '0.25s'}}><strong>Opportunity Sizing:</strong> See volume and performance gaps for each theme</li>
          </ul>
          <p className="mt-4 text-sm animate-fade-in">
            💡 <strong>Tip:</strong> Focus on opportunities marked "HIGH" priority for maximum impact on your citation rates.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TrendsInsights

