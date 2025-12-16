import { useState, useEffect } from 'react';
import {
  Lightbulb, TrendingUp, Target, Sparkles,
  RefreshCw, Info, AlertCircle, CheckCircle, FileText, List, Table,
  BarChart3, Users, Zap, ChevronRight
} from 'lucide-react';

/**
 * Content Opportunities Component
 * Displays prompt analysis, theme insights, and AI-generated content recommendations
 */
function ContentOpportunities({ projectId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Auto-load content opportunities on mount when projectId is available
  useEffect(() => {
    if (projectId && !data && !loading) {
      loadOpportunities();
    }
  }, [projectId]); // Auto-loads when component mounts with a valid projectId

  const loadOpportunities = async (regenerate = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/unified/${projectId}/content-opportunities?regenerate=${regenerate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to load opportunities: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      console.log('[Content Opportunities] Data loaded:', {
        cached: result.cached,
        generatedAt: result.generatedAt,
        themesCount: result.promptAnalysis?.themes?.length || 0,
        recommendationsCount: result.aiRecommendations?.length || 0
      });
    } catch (err) {
      console.error('[Content Opportunities] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tips Banner - When this section provides maximum value */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-purple-900 mb-2">💡 Get the Most Value From This Analysis</h4>
            <div className="text-sm text-purple-800 space-y-1">
              <p>✅ <strong>Upload Brand Presence data</strong> from multiple weeks to identify citation patterns and trends</p>
              <p>✅ <strong>Analyze your content</strong> (URLs) to validate recommendations against what you already have</p>
              <p>✅ <strong>More data = Better insights:</strong> The more URLs analyzed and weeks tracked, the more accurate the content gaps and opportunities identified</p>
              <p>💾 <strong>Data persists:</strong> Your analysis is automatically saved and will load instantly on future visits. Click "Regenerate" to refresh with new data.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-green-600" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">Content Opportunities</h3>
                  {data?.cached && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      ⚡ Cached
                    </span>
                  )}
                  {data?.generatedAt && (
                    <span className="text-xs text-gray-500">
                      Generated {new Date(data.generatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  AI-powered analysis of prompt patterns and content gaps
                </p>
              </div>
            </div>
            {data && !loading && (
              <button
                onClick={() => loadOpportunities(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 border border-blue-200"
                title="Regenerate analysis with latest data"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={loadOpportunities} />
          ) : data ? (
            <>
              {/* Summary Stats */}
              <SummaryStats data={data} />

              {/* Theme Analysis */}
              {data.promptAnalysis?.themes && data.promptAnalysis.themes.length > 0 && (
                <ThemeAnalysisSection 
                  themes={data.promptAnalysis.themes}
                  selectedTheme={selectedTheme}
                  onSelectTheme={setSelectedTheme}
                />
              )}

              {/* AI Recommendations */}
              {data.aiRecommendations && data.aiRecommendations.length > 0 && (
              <AIRecommendationsSection 
                recommendations={data.aiRecommendations}
                isAIGenerated={data.isAIGenerated}
                validation={data.validation}
                onRegenerate={loadOpportunities}
              />
              )}

              {/* Content Structure Insights */}
              {data.contentPatterns && (
                <ContentStructureInsights patterns={data.contentPatterns} />
              )}
            </>
          ) : (
            <EmptyState onLoad={loadOpportunities} />
          )}
        </div>
      </div>
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-sm text-gray-600 font-medium">Analyzing prompt patterns...</p>
        <p className="text-xs text-gray-500 mt-2">This may take 15-30 seconds</p>
      </div>
    </div>
  );
}

// Error State
function ErrorState({ error, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-red-900 font-bold text-base mb-2">Unable to Load Content Opportunities</h4>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="text-sm text-red-600 hover:text-red-700 underline font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ onLoad }) {
  return (
    <div className="text-center py-12">
      <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">No analysis available yet</p>
      <button onClick={onLoad} className="btn-primary inline-flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Analyze Content Opportunities
      </button>
    </div>
  );
}

// Summary Stats
function SummaryStats({ data }) {
  const { promptAnalysis, contentPatterns } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<FileText className="w-5 h-5 text-blue-600" />}
        label="Unique Prompts"
        value={promptAnalysis?.totalUniquePrompts || 0}
        color="blue"
      />
      <StatCard
        icon={<Target className="w-5 h-5 text-purple-600" />}
        label="Themes Identified"
        value={promptAnalysis?.themes?.length || 0}
        color="purple"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        label="Opportunities"
        value={promptAnalysis?.opportunities?.length || 0}
        color="green"
      />
      <StatCard
        icon={<Lightbulb className="w-5 h-5 text-yellow-600" />}
        label="Recommendations"
        value={data.aiRecommendations?.length || 0}
        color="yellow"
      />
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200'
  };

  return (
    <div className={`${colors[color]} rounded-lg p-4 border`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

// Theme Analysis Section
function ThemeAnalysisSection({ themes, selectedTheme, onSelectTheme }) {
  return (
    <div className="border-t-2 border-gray-200 pt-6">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-600" />
        Thematic Analysis
        <span className="text-xs text-gray-500 font-normal ml-2">
          ({themes.length} themes discovered)
        </span>
      </h4>

      <div className="space-y-3">
        {themes.slice(0, 6).map((theme, idx) => (
          <ThemeCard
            key={idx}
            theme={theme}
            isSelected={selectedTheme === idx}
            onClick={() => onSelectTheme(selectedTheme === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({ theme, isSelected, onClick }) {
  const priorityColor = 
    theme.citationRate < 0.3 ? 'red' :
    theme.citationRate < 0.6 ? 'yellow' : 'green';

  const priorityColors = {
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green: 'bg-green-100 text-green-800 border-green-300'
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
      <button
        onClick={onClick}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="font-bold text-gray-900">{theme.name}</h5>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[priorityColor]}`}>
                {(theme.citationRate * 100).toFixed(0)}% cited
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {theme.funnelStage}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{theme.promptCount} prompts</span>
              <span>•</span>
              <span>{theme.totalOccurrences} occurrences</span>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {isSelected && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3 animate-fade-in">
          {/* Sample Prompts */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">SAMPLE PROMPTS:</p>
            <div className="space-y-2">
              {theme.prompts.slice(0, 3).map((p, idx) => (
                <div key={idx} className="bg-white rounded p-2 text-sm border border-gray-200">
                  <p className="text-gray-800">"{p.prompt}"</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{(p.yourUrlCitationRate * 100).toFixed(0)}% citation rate</span>
                    <span>•</span>
                    <span>{p.weeks.length} weeks</span>
                    <span>•</span>
                    <span>{p.totalOccurrences} tests</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cited URLs */}
          {theme.topCitedUrls && theme.topCitedUrls.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">YOUR TOP PERFORMING URLS:</p>
              <div className="space-y-1">
                {theme.topCitedUrls.slice(0, 3).map((urlData, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded p-2 text-sm border border-gray-200">
                    <a 
                      href={urlData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 truncate flex-1 mr-2"
                    >
                      {urlData.url}
                    </a>
                    <span className="text-green-600 font-semibold">{urlData.count} citations</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// AI Recommendations Section
function AIRecommendationsSection({ recommendations, isAIGenerated, validation, onRegenerate }) {
  return (
    <div className="border-t-2 border-gray-200 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
          <Sparkles className="w-5 h-5 text-yellow-600" />
          AI-Powered Content Recommendations
          {isAIGenerated && (
            <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              ✨ AI Generated
            </span>
          )}
          {validation?.enabled && (
            <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-1 rounded-full font-medium">
              ✅ Validated ({validation.analyzedUrls} pages)
            </span>
          )}
        </h4>
        <button
          onClick={onRegenerate}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
      </div>

      {/* Validation Status Info */}
      {validation && !validation.enabled && validation.totalUrls > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Validation Not Available</p>
              <p className="text-xs mt-1">
                {validation.analyzedUrls === 0 
                  ? `Analyze some of your ${validation.totalUrls} URLs to validate recommendations against your actual content.`
                  : `${validation.analyzedUrls} of ${validation.totalUrls} URLs analyzed. Analyzing more URLs improves validation accuracy.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} index={idx} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, index }) {
  const [expanded, setExpanded] = useState(false);

  const priorityConfig = {
    high: { color: 'border-red-300 bg-red-50', badge: 'bg-red-100 text-red-800', icon: '🔴' },
    medium: { color: 'border-yellow-300 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    low: { color: 'border-green-300 bg-green-50', badge: 'bg-green-100 text-green-800', icon: '🟢' }
  };

  const validationConfig = {
    exists: { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅', label: 'Optimize Existing' },
    partial: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️', label: 'Expand Content' },
    missing: { color: 'bg-red-100 text-red-800 border-red-300', icon: '❌', label: 'Create New' }
  };

  const priority = recommendation.priority || 'medium';
  const config = priorityConfig[priority];
  const validation = recommendation.validation;

  return (
    <div className={`border-l-4 ${config.color} rounded-lg overflow-hidden`}>
      <div className="bg-white p-4">
        <div className="flex items-start gap-3">
          {/* Number Badge */}
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white text-sm flex items-center justify-center font-bold shadow">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h5 className="font-bold text-gray-900 text-base flex-1">
                {recommendation.title}
              </h5>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                {validation && validation.status && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${validationConfig[validation.status].color} font-medium`}>
                    {validationConfig[validation.status].icon} {validationConfig[validation.status].label}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${config.badge} font-medium`}>
                  {config.icon} {priority}
                </span>
              </div>
            </div>

            {/* Theme tag */}
            {recommendation.theme && (
              <span className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mb-3">
                {recommendation.theme}
              </span>
            )}

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-3">
              {recommendation.description}
            </p>

            {/* Validation Message (if available) */}
            {validation && validation.message && (
              <div className={`mb-3 p-3 rounded-lg border ${
                validation.status === 'exists' ? 'bg-green-50 border-green-200' :
                validation.status === 'partial' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {validation.message}
                </p>
                
                {/* Existing URLs */}
                {validation.existingUrls && validation.existingUrls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1">FOUND ON:</p>
                    <div className="space-y-1">
                      {validation.existingUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-blue-600 hover:text-blue-700 underline truncate"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content Structure (if available) */}
            {recommendation.contentStructure && Object.keys(recommendation.contentStructure).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">RECOMMENDED CONTENT STRUCTURE:</p>
                <div className="flex flex-wrap gap-3">
                  {recommendation.contentStructure.tables > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Table className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{recommendation.contentStructure.tables} comparison tables</span>
                    </div>
                  )}
                  {recommendation.contentStructure.lists > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <List className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{recommendation.contentStructure.lists} structured lists</span>
                    </div>
                  )}
                  {recommendation.contentStructure.steps > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-700">{recommendation.contentStructure.steps}-step guide</span>
                    </div>
                  )}
                  {recommendation.contentStructure.faqs > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Info className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">{recommendation.contentStructure.faqs} FAQs</span>
                    </div>
                  )}
                  {recommendation.contentStructure.examples > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <BarChart3 className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-700">{recommendation.contentStructure.examples} examples</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expandable Action Items */}
            {recommendation.actions && recommendation.actions.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-2"
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                  Action Items ({recommendation.actions.length})
                </button>
                
                {expanded && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3 animate-fade-in">
                    <ul className="space-y-2">
                      {recommendation.actions.map((action, aidx) => (
                        <li key={aidx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm leading-relaxed">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Funnel Insight */}
            {recommendation.funnelInsight && (
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-purple-50 rounded p-2 border border-purple-100">
                <Users className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span><strong>Funnel Context:</strong> {recommendation.funnelInsight}</span>
              </div>
            )}

            {/* Potential Impact */}
            {recommendation.potentialImpact && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-semibold">
                  Potential Impact: {recommendation.potentialImpact}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Content Structure Insights
function ContentStructureInsights({ patterns }) {
  if (!patterns.highPerforming || !patterns.lowPerforming) {
    return null;
  }

  return (
    <div className="border-t-2 border-gray-200 pt-6">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        Content Structure Analysis
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* High Performing */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            High-Performing Content
          </h5>
          <div className="space-y-2 text-sm">
            <StructureMetric label="Has Comparisons" value={patterns.highPerforming.comparisonRate} />
            <StructureMetric label="Has Lists" value={patterns.highPerforming.listRate} />
            <StructureMetric label="Has Steps" value={patterns.highPerforming.stepRate} />
            <StructureMetric label="Has Examples" value={patterns.highPerforming.exampleRate} />
          </div>
        </div>

        {/* Low Performing */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h5 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Low-Performing Content
          </h5>
          <div className="space-y-2 text-sm">
            <StructureMetric label="Has Comparisons" value={patterns.lowPerforming.comparisonRate} />
            <StructureMetric label="Has Lists" value={patterns.lowPerforming.listRate} />
            <StructureMetric label="Has Steps" value={patterns.lowPerforming.stepRate} />
            <StructureMetric label="Has Examples" value={patterns.lowPerforming.exampleRate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StructureMetric({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}:</span>
      <span className="font-bold text-gray-900">{value}%</span>
    </div>
  );
}

export default ContentOpportunities;

