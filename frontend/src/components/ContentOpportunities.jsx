import { useState, useEffect } from 'react';
import {
  Lightbulb, TrendingUp, Target, Sparkles,
  RefreshCw, Info, AlertCircle, Zap, ChevronRight, ExternalLink
} from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

/**
 * Content Opportunities Component
 * Displays prompt analysis, theme insights, and AI-generated content recommendations
 */
function ContentOpportunities({ projectId }) {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showThemes, setShowThemes] = useState(false); // Collapsed by default

  // Auto-load content opportunities on mount when projectId is available
  useEffect(() => {
    if (projectId && !data && !loading) {
      loadOpportunities();
    }
  }, [projectId]); // Auto-loads when component mounts with a valid projectId

  const loadOpportunities = async (regenerate = false) => {
    setLoading(true);
    setError(null);
    setLoadingStage('Loading citation data...');

    try {
      // Simulate progress stages for better UX
      setTimeout(() => setLoadingStage('Analyzing prompt patterns...'), 500);
      setTimeout(() => setLoadingStage('Identifying content gaps...'), 2000);
      setTimeout(() => setLoadingStage('Generating AI recommendations...'), 5000);
      setTimeout(() => setLoadingStage('Validating against your website...'), 10000);

      const response = await fetch(`/api/unified/${projectId}/content-opportunities?regenerate=${regenerate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load opportunities: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setLoadingStage('Complete!');
      
      console.log('[Content Opportunities] Data loaded:', {
        cached: result.cached,
        generatedAt: result.generatedAt,
        themesCount: result.promptAnalysis?.themes?.length || 0,
        recommendationsCount: result.aiRecommendations?.length || 0,
        analyzedUrls: result.validation?.analyzedUrls || 0
      });
    } catch (err) {
      console.error('[Content Opportunities] Error:', err);
      setError(err.message);
      setLoadingStage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Minimal Context Banner - Only show when actionable */}
      {data && data.validation && data.validation.analyzedUrls < 5 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-blue-900">
                {data.validation.analyzedUrls === 0 ? (
                  <><strong>Tip:</strong> Analyze URLs to get page-specific recommendations</>
                ) : (
                  <><strong>{data.validation.analyzedUrls} URLs analyzed</strong> – Analyze 10+ for better insights</>
                )}
              </span>
            </div>
            <a
              href="#"
              className="text-sm text-blue-700 hover:text-blue-800 font-medium underline flex items-center gap-1"
              onClick={(e) => { e.preventDefault(); window.location.href = '#/insights'; }}
            >
              Analyze URLs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      <div className="card bg-white shadow-sm">
        {/* Simplified Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Content Opportunities</h3>
            {data && !loading && (
              <button
                onClick={() => loadOpportunities(true)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1.5"
                title="Refresh with latest data"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <LoadingState stage={loadingStage} />
          ) : error ? (
            <ErrorState error={error} onRetry={loadOpportunities} />
          ) : data ? (
            <>
              {/* Summary Stats */}
              <SummaryStats data={data} />

              {/* AI Recommendations - Primary Focus */}
              {data.aiRecommendations && data.aiRecommendations.length > 0 && (
              <AIRecommendationsSection 
                recommendations={data.aiRecommendations}
                isAIGenerated={data.isAIGenerated}
                validation={data.validation}
                onRegenerate={loadOpportunities}
                showAll={showAllRecommendations}
                onToggleShowAll={() => setShowAllRecommendations(!showAllRecommendations)}
              />
              )}

              {/* Theme Analysis - Collapsible Secondary Info */}
              {data.promptAnalysis?.themes && data.promptAnalysis.themes.length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={() => setShowThemes(!showThemes)}
                    className="w-full flex items-center justify-between text-left mb-4 text-gray-700 hover:text-gray-900"
                  >
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Detailed Theme Analysis
                      <span className="text-xs text-gray-500 font-normal">
                        ({data.promptAnalysis.themes.length} themes)
                      </span>
                    </h4>
                    <ChevronRight className={`w-5 h-5 transition-transform ${showThemes ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showThemes && (
                    <ThemeAnalysisSection 
                      themes={data.promptAnalysis.themes}
                      selectedTheme={selectedTheme}
                      onSelectTheme={setSelectedTheme}
                    />
                  )}
                </div>
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

// Loading State with Progress Stages and Skeleton Preview
function LoadingState({ stage }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Loading Header */}
      <div className="flex items-center justify-center py-8">
        <div className="text-center max-w-md">
          {/* Animated Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
            <Sparkles className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          
          {/* Stage Text */}
          <p className="text-base text-gray-800 font-semibold mb-2 animate-pulse-soft">{stage || 'Loading...'}</p>
          <p className="text-sm text-gray-500">This may take 15-30 seconds</p>
          
          {/* Progress Indicators */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
      
      {/* Skeleton Preview - Shows what's loading */}
      <div className="space-y-6 opacity-60">
        <div className="text-sm text-gray-500 text-center mb-4">Preparing your insights...</div>
        <SkeletonLoader type="statCard" count={3} className="grid grid-cols-1 md:grid-cols-3 gap-4" />
        <SkeletonLoader type="card" count={2} />
      </div>
      
      {/* Tip */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 animate-slide-in-right">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Analyzing more URLs from your site provides better validation and more specific recommendations
        </p>
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

// Minimal Summary Stats
function SummaryStats({ data }) {
  const { promptAnalysis } = data;

  return (
    <div className="flex items-center gap-6 text-sm text-gray-600 pb-4 border-b border-gray-100">
      <div>
        <span className="font-semibold text-gray-900">{promptAnalysis?.totalUniquePrompts || 0}</span> prompts analyzed
      </div>
      <div className="text-gray-300">•</div>
      <div>
        <span className="font-semibold text-gray-900">{promptAnalysis?.themes?.length || 0}</span> themes
      </div>
      <div className="text-gray-300">•</div>
      <div>
        <span className="font-semibold text-gray-900">{data.aiRecommendations?.length || 0}</span> recommendations
      </div>
      {data.validation?.analyzedUrls > 0 && (
        <>
          <div className="text-gray-300">•</div>
          <div>
            <span className="font-semibold text-green-700">{data.validation.analyzedUrls}</span> URLs validated
          </div>
        </>
      )}
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
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]">
      <button
        onClick={onClick}
        className="w-full p-4 text-left hover:bg-gray-50 transition-all duration-200"
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
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3 animate-slide-down">
          {/* Sample Prompts */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">SAMPLE PROMPTS:</p>
            <div className="space-y-2">
              {theme.prompts.slice(0, 3).map((p, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded p-2 text-sm border border-gray-200 stagger-item hover:border-gray-300 transition-colors"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
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
  
  const toggleExpanded = () => {
    console.log('Toggle clicked, current expanded:', expanded);
    setExpanded(!expanded);
  };

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
    <div 
      className={`
        border-l-4 ${config.color} rounded-lg overflow-hidden bg-white 
        shadow-sm hover:shadow-lg transition-all duration-300 ease-out
        hover:translate-y-[-2px] stagger-item
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="p-6">
        {/* Clean Title with Priority */}
        <div className="flex items-start gap-4 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded font-bold flex-shrink-0 ${config.badge}`}>
            {priority === 'high' ? 'HIGH' : priority === 'medium' ? 'MED' : 'LOW'}
          </span>
          <div className="flex-1">
            <h5 className="text-xl font-bold text-gray-900 mb-1.5">
              {recommendation.title}
            </h5>
            {/* Minimal metadata in one line */}
            <div className="text-xs text-gray-500">
              {recommendation.theme}
              {recommendation.metricFocus && recommendation.metricFocus !== 'general' && (
                <> · Improves {recommendation.metricFocus}</>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-4 text-base">
          {recommendation.description}
        </p>

            {/* Target URLs (compact) */}
            {recommendation.targetUrls && recommendation.targetUrls.length > 0 && (
              <div className="mb-3 p-2.5 rounded bg-amber-50 border-l-2 border-amber-400">
                <p className="text-xs font-medium text-amber-900 mb-1.5">Target pages:</p>
                <div className="space-y-0.5">
                  {recommendation.targetUrls.slice(0, 2).map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:text-blue-800 truncate"
                    >
                      {url}
                    </a>
                  ))}
                  {recommendation.targetUrls.length > 2 && (
                    <p className="text-xs text-amber-700">+{recommendation.targetUrls.length - 2} more</p>
                  )}
                </div>
              </div>
            )}

            {/* Validation (minimal) */}
            {validation && validation.status && (
              <div className={`mb-3 px-2.5 py-2 rounded text-xs ${
                validation.status === 'exists' ? 'bg-green-50 text-green-800' :
                validation.status === 'partial' ? 'bg-yellow-50 text-yellow-800' :
                'bg-red-50 text-red-800'
              }`}>
                {validation.status === 'exists' && '✓ Content exists - focus on optimization'}
                {validation.status === 'partial' && '⚠ Partial content found - expand or enhance'}
                {validation.status === 'missing' && '✗ Content gap - create new content'}
              </div>
            )}

        {/* Action Items - Expandable */}
        {recommendation.actions && recommendation.actions.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 mb-2 transition-colors"
            >
              <span className="flex items-center gap-1.5 pointer-events-none">
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
                {recommendation.actions.length} Action Steps
              </span>
            </button>
            
            {expanded && (
              <div className="space-y-1.5 pl-5 animate-fade-in">
                {recommendation.actions.map((action, aidx) => (
                  <div 
                    key={aidx} 
                    className="flex items-start gap-2 text-sm text-gray-600 stagger-item"
                    style={{ animationDelay: `${aidx * 0.05}s` }}
                  >
                    <span className="text-gray-400 flex-shrink-0">{aidx + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentOpportunities;

