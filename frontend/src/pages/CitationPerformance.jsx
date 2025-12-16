import React, { useState, useEffect, useMemo } from 'react'
import { Upload, TrendingUp, Target, Sparkles, BarChart3, CheckCircle2, Search, X, RefreshCw, ChevronDown, ChevronUp, Info, Download, Filter, AlertCircle, LineChart as LineChartIcon } from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function CitationPerformance() {
  // Get global context data
  const { uploadedUrls, activeProject, citationData: contextCitationData, updateCitationData } = useAppContext()
  
  const [localCitationData, setLocalCitationData] = useState(null)
  const [targetUrls, setTargetUrls] = useState([])
  const [selectedWeeks, setSelectedWeeks] = useState([])
  const [selectedUrls, setSelectedUrls] = useState([])
  const [urlSearchTerm, setUrlSearchTerm] = useState('')
  const [dataSource, setDataSource] = useState(null)
  
  // UI State
  const [showFilters, setShowFilters] = useState(true)

  // Initialize from context on mount and when context updates
  useEffect(() => {
    let urlsToLoad = []
    
    // Priority 1: Load URLs from active project's dashboard
    if (activeProject?.dashboard?.urls && activeProject.dashboard.urls.length > 0) {
      urlsToLoad = activeProject.dashboard.urls.map(u => u.url)
      console.log('[Citation Performance] Loading URLs from activeProject dashboard:', urlsToLoad.length)
    }
    // Priority 2: Load URLs from active project metadata
    else if (activeProject?.urls && activeProject.urls.length > 0) {
      urlsToLoad = activeProject.urls
      console.log('[Citation Performance] Loading URLs from activeProject:', urlsToLoad.length)
    }
    // Priority 3: Load URLs from sitemaps
    else if (activeProject && activeProject.sitemapUrls && activeProject.sitemapUrls.length > 0) {
      urlsToLoad = activeProject.sitemapUrls
      console.log('[Citation Performance] Loading URLs from activeProject sitemapUrls:', urlsToLoad.length)
    }
    // Fallback: Load from uploadedUrls
    else if (uploadedUrls && uploadedUrls.length > 0) {
      urlsToLoad = uploadedUrls.flatMap(upload => upload.urls || [])
      console.log('[Citation Performance] Loading URLs from uploadedUrls:', urlsToLoad.length)
    }
    
    if (urlsToLoad.length > 0) {
      setTargetUrls(urlsToLoad)
      setDataSource('context')
    }
    
    // ✅ Auto-load citation data from context when available
    if (contextCitationData && contextCitationData.citationRates) {
      console.log('[Citation Performance] Auto-loading citation data from context:', {
        ratesCount: contextCitationData.citationRates.length,
        targetUrlsCount: contextCitationData.targetUrls?.length || 0,
        domain: contextCitationData.domain
      })
      setLocalCitationData(contextCitationData)
      setDataSource('context-auto')
    }
    // Also check if dashboard has citation data
    else if (activeProject?.dashboard?.citationRates && activeProject.dashboard.citationRates.length > 0) {
      console.log('[Citation Performance] Auto-loading citation data from activeProject dashboard:', {
        ratesCount: activeProject.dashboard.citationRates.length,
        targetUrlsCount: activeProject.dashboard.targetUrls?.length || 0
      })
      const citationDataFromDashboard = {
        citationRates: activeProject.dashboard.citationRates,
        targetUrls: activeProject.dashboard.targetUrls || [],
        domain: activeProject.dashboard.domain || activeProject.domain,
        loadedAt: new Date().toISOString()
      }
      setLocalCitationData(citationDataFromDashboard)
      updateCitationData(citationDataFromDashboard) // Also save to context
      setDataSource('dashboard-auto')
    }
  }, [uploadedUrls, activeProject, contextCitationData])

  const citationData = localCitationData || contextCitationData

  const loadRecentCitationJob = async () => {
    try {
      const response = await fetch('/api/citations/history')
      if (!response.ok) {
        throw new Error('Failed to fetch citation jobs')
      }
      
      const data = await response.json()
      if (!data.history || data.history.length === 0) {
        alert('No citation jobs found')
        return
      }
      
      const mostRecentJob = data.history[0]
      
      // Fetch results for the most recent job
      const resultsResponse = await fetch(`/api/citations/results/${mostRecentJob.jobId}`)
      const resultsData = await resultsResponse.json()
      setLocalCitationData(resultsData)
      updateCitationData(resultsData)
      setDataSource('recent-job')
      
      if (resultsData.targetUrls && resultsData.targetUrls.length > 0) {
        setTargetUrls(resultsData.targetUrls)
      }
    } catch (error) {
      alert('Error loading recent citation job: ' + error.message)
    }
  }

  // Memoized calculations for performance
  const summaryStats = useMemo(() => {
    if (!citationData || !citationData.citationRates) return null
    
    const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type)
    if (summaryRates.length === 0) return null

    const avgUrlRate = summaryRates.reduce((sum, r) => sum + (r.selectedUrlRate || 0), 0) / summaryRates.length
    const avgDomainRate = summaryRates.reduce((sum, r) => sum + (r.anyDomainRate || 0), 0) / summaryRates.length
    const totalCitations = summaryRates.reduce((sum, r) => sum + (r.selectedUrlCitations || 0), 0)
    const totalPrompts = summaryRates.reduce((sum, r) => sum + (r.totalPrompts || 0), 0)

    return {
      avgUrlRate,
      avgDomainRate,
      totalCitations,
      totalPrompts,
      weekCount: new Set(summaryRates.map(r => r.week)).size,
      platformCount: new Set(summaryRates.map(r => r.platform)).size
    }
  }, [citationData])

  // Export to CSV
  const exportToCSV = () => {
    if (!citationData || !citationData.citationRates) return

    const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type)
    const csv = [
      ['Week', 'Platform', 'Total Prompts', 'URL Citations', 'URL Rate %', 'Domain Citations', 'Domain Rate %'].join(','),
      ...summaryRates.map(r => [
        r.week,
        r.platform,
        r.totalPrompts,
        r.selectedUrlCitations,
        (r.selectedUrlRate * 100).toFixed(2),
        r.anyDomainCitations,
        (r.anyDomainRate * 100).toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citation-performance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Enhanced Header with Quick Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              Citation Performance
              {citationData && <span className="text-sm font-normal text-gray-600 bg-white px-3 py-1 rounded-full">
                {summaryStats?.totalCitations.toLocaleString()} citations tracked
              </span>}
            </h1>
            <p className="text-gray-600 mb-3">
              Track how often AI platforms cite your URLs and analyze citation trends
            </p>
            {summaryStats && (
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">{summaryStats.weekCount} weeks analyzed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-gray-700">{summaryStats.platformCount} platforms</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">{targetUrls.length} URLs tracked</span>
                </div>
              </div>
            )}
          </div>
          {citationData && (
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Load Recent Data Notice - Only show if NO data at all */}
      {(!citationData || targetUrls.length === 0 || (citationData && (!citationData.citationRates || citationData.citationRates.length === 0))) && dataSource !== 'context-auto' && dataSource !== 'dashboard-auto' && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm animate-fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start flex-1">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1">
                  {!citationData ? 'No Data Loaded' : targetUrls.length === 0 ? 'No Target URLs Loaded' : 'No Citation Data Available'}
                </h3>
                <p className="text-sm text-blue-800">
                  {targetUrls.length === 0 
                    ? 'You need target URLs to track citations. Upload your data in AI Visibility Analysis first, or click below to load from a previous upload.'
                    : 'Citation data should load automatically from AI Visibility Analysis. If you don\'t see data, click below to load manually.'}
                </p>
              </div>
            </div>
            <button
              onClick={loadRecentCitationJob}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              Load Recent Data
            </button>
          </div>
        </div>
      )}

      {/* Success Notice - Data Auto-Loaded */}
      {citationData && citationData.citationRates && citationData.citationRates.length > 0 && (dataSource === 'context-auto' || dataSource === 'dashboard-auto') && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-green-900 mb-1">
                ✅ Citation Data Loaded Automatically
              </h3>
              <p className="text-sm text-green-800">
                Showing {citationData.citationRates.filter(r => r.type === 'summary' || !r.type).length} citation entries across {new Set(citationData.citationRates.map(r => r.week)).size} weeks and {new Set(citationData.citationRates.map(r => r.platform)).size} platforms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section - Only show when we have data */}
      {citationData && citationData.citationRates && citationData.citationRates.length > 0 ? (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Avg URL Citation Rate"
              value={`${(summaryStats.avgUrlRate * 100).toFixed(1)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              subtitle={`${summaryStats.totalCitations} citations`}
            />
            <MetricCard
              title="Avg Domain Rate"
              value={`${(summaryStats.avgDomainRate * 100).toFixed(1)}%`}
              icon={<Target className="w-5 h-5" />}
              color="green"
              subtitle={citationData.domain || 'your domain'}
            />
            <MetricCard
              title="Total Prompts"
              value={summaryStats.totalPrompts.toLocaleString()}
              icon={<Sparkles className="w-5 h-5" />}
              color="purple"
              subtitle={`across ${summaryStats.weekCount} weeks`}
            />
            <MetricCard
              title="Platforms"
              value={summaryStats.platformCount}
              icon={<BarChart3 className="w-5 h-5" />}
              color="orange"
              subtitle="being tracked"
            />
          </div>

          {/* Filters Section - Collapsible */}
          <FiltersSection
            citationData={citationData}
            selectedWeeks={selectedWeeks}
            setSelectedWeeks={setSelectedWeeks}
            selectedUrls={selectedUrls}
            setSelectedUrls={setSelectedUrls}
            urlSearchTerm={urlSearchTerm}
            setUrlSearchTerm={setUrlSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          {/* Visual Analytics Section */}
          <VisualAnalyticsSection
            citationData={citationData}
            selectedWeeks={selectedWeeks}
            selectedUrls={selectedUrls}
          />

          {/* Platform Performance Overview */}
          <PlatformPerformanceSection
            citationData={citationData}
            selectedWeeks={selectedWeeks}
            selectedUrls={selectedUrls}
          />

        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

// Metric Card Component
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

// Visual Analytics Section Component
function VisualAnalyticsSection({ citationData, selectedWeeks, selectedUrls }) {
  const [showCharts, setShowCharts] = useState(true)
  
  // Filter data based on selections
  const filteredRates = useMemo(() => {
    let rates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type)
    
    if (selectedWeeks.length > 0) {
      rates = rates.filter(r => selectedWeeks.includes(r.week))
    }
    if (selectedUrls.length > 0) {
      rates = rates.filter(r => selectedUrls.some(url => r.url === url || r.citedUrls?.includes(url)))
    }
    
    return rates
  }, [citationData, selectedWeeks, selectedUrls])

  // Prepare data for Weekly Trend Chart
  const weeklyTrendData = useMemo(() => {
    const weeklyAvg = {}
    const weekCounts = {}
    
    filteredRates.forEach(rate => {
      if (!rate.week) return
      if (!weeklyAvg[rate.week]) {
        weeklyAvg[rate.week] = 0
        weekCounts[rate.week] = 0
      }
      weeklyAvg[rate.week] += (rate.selectedUrlRate || 0)
      weekCounts[rate.week]++
    })
    
    const weeks = Object.keys(weeklyAvg).sort()
    const avgRates = weeks.map(w => ((weeklyAvg[w] / weekCounts[w]) * 100).toFixed(1))
    
    return {
      labels: weeks,
      datasets: [{
        label: 'Average Citation Rate (%)',
        data: avgRates,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    }
  }, [filteredRates])


  // Prepare data for Platform Performance Chart
  const platformData = useMemo(() => {
    const platformStats = {}
    
    filteredRates.forEach(rate => {
      if (!rate.platform) return
      if (!platformStats[rate.platform]) {
        platformStats[rate.platform] = { total: 0, count: 0 }
      }
      platformStats[rate.platform].total += (rate.selectedUrlRate || 0)
      platformStats[rate.platform].count++
    })
    
    const platforms = Object.keys(platformStats)
    const avgRates = platforms.map(p => 
      ((platformStats[p].total / platformStats[p].count) * 100).toFixed(1)
    )
    
    return {
      labels: platforms,
      datasets: [{
        label: 'Average Citation Rate (%)',
        data: avgRates,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2
      }]
    }
  }, [filteredRates])


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) label += ': '
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%'
            }
            return label
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y',
    plugins: {
      ...chartOptions.plugins,
      legend: { display: false }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  }


  if (filteredRates.length === 0) return null

  return (
    <div className="card border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <button
        onClick={() => setShowCharts(!showCharts)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Visual Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              Weekly citation trends and platform performance comparison
            </p>
          </div>
        </div>
        {showCharts ? (
          <ChevronUp className="w-6 h-6 text-gray-400" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-400" />
        )}
      </button>

      {showCharts && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-200 pt-6">
          {/* Weekly Trend */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LineChartIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-gray-900">Weekly Citation Trend</h4>
              <span className="text-xs text-gray-500 ml-auto">
                {selectedWeeks.length > 0 ? `${selectedWeeks.length} weeks selected` : 'All weeks'}
              </span>
            </div>
            <div style={{ height: '250px' }}>
              <Line data={weeklyTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-900">Platform Performance</h4>
            </div>
            <div style={{ height: '320px' }}>
              {platformData && platformData.labels.length > 0 ? (
                <Bar data={platformData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No platform data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Helpful Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">💡 Chart Tips:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li>Use filters above to focus on specific weeks or platforms</li>
                  <li>Hover over chart elements for detailed values</li>
                  <li>Charts update automatically when you change filters</li>
                  <li>Weekly trend shows average citation rates across all platforms</li>
                  <li>Platform performance compares citation rates by AI platform</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Filters Section Component
function FiltersSection({ citationData, selectedWeeks, setSelectedWeeks, selectedUrls, setSelectedUrls, urlSearchTerm, setUrlSearchTerm, showFilters, setShowFilters }) {
  const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type)
  const weeks = [...new Set(summaryRates.map(r => r.week).filter(Boolean))].sort()
  
  // Use targetUrls from citation data (all URLs), not just citedUrls
  const allTargetUrls = citationData.targetUrls || []
  
  // Also collect cited URLs for reference
  const allCitedUrls = new Set()
  summaryRates.forEach(rate => {
    if (rate.citedUrls && Array.isArray(rate.citedUrls)) {
      rate.citedUrls.forEach(url => allCitedUrls.add(url))
    }
  })
  
  // Show ALL target URLs, not just the ones that were cited
  const allUrlsList = allTargetUrls.sort()
  const filteredUrlsList = allUrlsList.filter(url => url.toLowerCase().includes(urlSearchTerm.toLowerCase()))

  const activeFiltersCount = selectedWeeks.length + selectedUrls.length

  return (
    <div className="card">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-sm font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </h2>
        </div>
        {showFilters ? (
          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </button>

      {showFilters && (
        <div className="mt-6 space-y-6 animate-slide-down">
          {/* Week Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Weeks ({selectedWeeks.length > 0 ? `${selectedWeeks.length} selected` : 'all'})
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              {selectedWeeks.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-200">
                  {selectedWeeks.map(week => (
                    <span
                      key={week}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      {week}
                      <button
                        onClick={() => setSelectedWeeks(selectedWeeks.filter(w => w !== week))}
                        className="hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {weeks.filter(w => !selectedWeeks.includes(w)).map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeeks([...selectedWeeks, week])}
                    className="px-3 py-1.5 text-sm border border-gray-300 bg-white rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {week}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* URL Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <span>Filter by URL ({selectedUrls.length > 0 ? `${selectedUrls.length} selected` : 'all'})</span>
              <span className="text-xs font-normal text-gray-500">
                {allUrlsList.length} total URLs • {allCitedUrls.size} with citations
              </span>
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search URLs..."
                  value={urlSearchTerm}
                  onChange={(e) => setUrlSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {selectedUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-gray-200 max-h-32 overflow-y-auto">
                  {selectedUrls.map(url => (
                    <span
                      key={url}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium max-w-xs shadow-sm hover:bg-green-700 transition-colors"
                      title={url}
                    >
                      <span className="truncate">{url.length > 35 ? url.substring(0, 35) + '...' : url}</span>
                      <button
                        onClick={() => setSelectedUrls(selectedUrls.filter(u => u !== url))}
                        className="hover:bg-green-800 rounded-full p-0.5 flex-shrink-0 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {filteredUrlsList.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredUrlsList.filter(url => !selectedUrls.includes(url)).slice(0, 15).map(url => {
                    const isCited = allCitedUrls.has(url)
                    return (
                      <button
                        key={url}
                        onClick={() => setSelectedUrls([...selectedUrls, url])}
                        className={`w-full text-left px-3 py-2 text-sm border rounded hover:bg-green-50 hover:border-green-300 transition-colors truncate flex items-center justify-between group ${
                          isCited ? 'border-gray-200 bg-white' : 'border-orange-200 bg-orange-50'
                        }`}
                        title={url}
                      >
                        <span className="truncate flex-1">{url}</span>
                        {!isCited && (
                          <span className="text-xs text-orange-600 font-medium ml-2 flex-shrink-0 opacity-75 group-hover:opacity-100">
                            0% cited
                          </span>
                        )}
                      </button>
                    )
                  })}
                  {filteredUrlsList.filter(url => !selectedUrls.includes(url)).length > 15 && (
                    <p className="text-xs text-gray-500 px-3 py-2">
                      ... and {filteredUrlsList.filter(url => !selectedUrls.includes(url)).length - 15} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedWeeks([])
                  setSelectedUrls([])
                  setUrlSearchTerm('')
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Platform Performance Section Component
function PlatformPerformanceSection({ citationData, selectedWeeks, selectedUrls }) {
  const [expandedPlatform, setExpandedPlatform] = useState(null)
  const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type)
  
  const filteredData = summaryRates.filter(rate => {
    const weekMatch = selectedWeeks.length === 0 || selectedWeeks.includes(rate.week)
    let urlMatch = true
    if (selectedUrls.length > 0 && rate.citedUrls) {
      urlMatch = rate.citedUrls.some(url => selectedUrls.includes(url))
    }
    return weekMatch && urlMatch
  })
  
  // Build enhanced platform stats with weekly breakdown
  const platformStats = {}
  const urlCitationCounts = {} // Track which URLs are cited how many times per platform
  
  filteredData.forEach(rate => {
    if (!platformStats[rate.platform]) {
      platformStats[rate.platform] = {
        totalPrompts: 0,
        selectedUrlCitations: 0,
        anyDomainCitations: 0,
        citedUrls: new Set(),
        weeks: new Set(),
        urlCounts: {},
        weeklyData: {} // Store weekly breakdown for trend calculation
      }
    }
    platformStats[rate.platform].totalPrompts += rate.totalPrompts || 0
    platformStats[rate.platform].selectedUrlCitations += rate.selectedUrlCitations || 0
    platformStats[rate.platform].anyDomainCitations += rate.anyDomainCitations || 0
    platformStats[rate.platform].weeks.add(rate.week)
    
    // Track weekly data for week-over-week comparison
    if (!platformStats[rate.platform].weeklyData[rate.week]) {
      platformStats[rate.platform].weeklyData[rate.week] = {
        prompts: 0,
        citations: 0
      }
    }
    platformStats[rate.platform].weeklyData[rate.week].prompts += rate.totalPrompts || 0
    platformStats[rate.platform].weeklyData[rate.week].citations += rate.selectedUrlCitations || 0
    
    if (rate.citedUrls) {
      rate.citedUrls.forEach(url => {
        platformStats[rate.platform].citedUrls.add(url)
        platformStats[rate.platform].urlCounts[url] = (platformStats[rate.platform].urlCounts[url] || 0) + 1
      })
    }
  })
  
  const platformList = Object.keys(platformStats).map(platform => {
    const stats = platformStats[platform]
    const selectedUrlRate = stats.totalPrompts > 0 ? (stats.selectedUrlCitations / stats.totalPrompts) : 0
    const domainRate = stats.totalPrompts > 0 ? (stats.anyDomainCitations / stats.totalPrompts) : 0
    
    // Get top 3 cited URLs
    const topUrls = Object.entries(stats.urlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([url, count]) => ({ url, count }))
    
    // Calculate week-over-week change
    const weeks = Object.keys(stats.weeklyData).sort()
    let weeklyTrend = null
    if (weeks.length >= 2) {
      const currentWeek = weeks[weeks.length - 1]
      const previousWeek = weeks[weeks.length - 2]
      
      const currentRate = stats.weeklyData[currentWeek].prompts > 0 
        ? stats.weeklyData[currentWeek].citations / stats.weeklyData[currentWeek].prompts 
        : 0
      const previousRate = stats.weeklyData[previousWeek].prompts > 0 
        ? stats.weeklyData[previousWeek].citations / stats.weeklyData[previousWeek].prompts 
        : 0
      
      if (previousRate > 0) {
        const change = ((currentRate - previousRate) / previousRate) * 100
        weeklyTrend = { change, currentWeek, previousWeek }
      }
    }
    
    return {
      platform,
      totalPrompts: stats.totalPrompts,
      selectedUrlCitations: stats.selectedUrlCitations,
      anyDomainCitations: stats.anyDomainCitations,
      selectedUrlRate,
      domainRate,
      citedUrls: Array.from(stats.citedUrls),
      weekCount: stats.weeks.size,
      topUrls,
      weeklyTrend
    }
  }).sort((a, b) => b.selectedUrlRate - a.selectedUrlRate)

  // Calculate average for display
  const avgUrlRate = platformList.length > 0 
    ? platformList.reduce((sum, p) => sum + p.selectedUrlRate, 0) / platformList.length 
    : 0

  const getComparisonIndicator = (weeklyTrend) => {
    if (!weeklyTrend || weeklyTrend.change === null || weeklyTrend.change === undefined) {
      return { text: 'No prior week', color: 'text-gray-500', icon: '-' }
    }
    
    const change = weeklyTrend.change
    if (Math.abs(change) < 1) {
      return { text: 'No change', color: 'text-gray-600', icon: '=' }
    }
    if (change > 0) {
      return { 
        text: `+${change.toFixed(1)}% vs prev week`, 
        color: 'text-green-600', 
        icon: '↑' 
      }
    }
    return { 
      text: `${change.toFixed(1)}% vs prev week`, 
      color: 'text-red-600', 
      icon: '↓' 
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Platform Performance</h2>
        </div>
        <span className="text-sm text-gray-600">
          {platformList.length} platforms • Avg rate: {(avgUrlRate * 100).toFixed(1)}%
        </span>
      </div>
      
      {platformList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Info className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <p>No data available for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Platform</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Target URL Citation Rate</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Domain Rate</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-700">Prompts</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-700">Weeks</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Top URLs</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {platformList.map((platform, idx) => {
                const comparison = getComparisonIndicator(platform.weeklyTrend)
                const isExpanded = expandedPlatform === platform.platform
                
                return (
                  <React.Fragment key={platform.platform}>
                    <tr 
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors animate-fade-in cursor-pointer"
                      style={{ animationDelay: `${idx * 30}ms` }}
                      onClick={() => setExpandedPlatform(isExpanded ? null : platform.platform)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">{platform.platform}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div>
                          <div className="font-bold text-blue-600 text-base">
                            {(platform.selectedUrlRate * 100).toFixed(1)}%
                          </div>
                          <div className={`text-xs ${comparison.color}`}>
                            {comparison.icon} {comparison.text}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-green-600">
                          {(platform.domainRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {platform.anyDomainCitations} cites
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-700 font-medium">
                        {platform.totalPrompts.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {platform.weekCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600 max-w-xs">
                          {platform.topUrls.length > 0 ? (
                            <div className="space-y-0.5">
                              {platform.topUrls.map((item, i) => (
                                <div key={i} className="truncate" title={item.url}>
                                  <span className="font-medium text-blue-600">{item.count}×</span> {item.url.substring(0, 35)}...
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded details */}
                    {isExpanded && (
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <td colSpan="7" className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" /> Citation Details
                              </h4>
                              <dl className="space-y-1">
                                <div className="flex justify-between">
                                  <dt className="text-gray-600">URL Citations:</dt>
                                  <dd className="font-medium">{platform.selectedUrlCitations}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-600">Domain Citations:</dt>
                                  <dd className="font-medium">{platform.anyDomainCitations}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-600">Total Prompts:</dt>
                                  <dd className="font-medium">{platform.totalPrompts}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-600">Unique URLs:</dt>
                                  <dd className="font-medium">{platform.citedUrls.length}</dd>
                                </div>
                              </dl>
                            </div>
                            
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> All Cited URLs ({platform.citedUrls.length})
                              </h4>
                              <div className="max-h-32 overflow-y-auto bg-white rounded p-2 border border-gray-200">
                                <ul className="space-y-1 text-xs">
                                  {platform.citedUrls.map((url, i) => (
                                    <li key={i} className="truncate text-blue-600" title={url}>
                                      • {url}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Trends & Insights Section Component
function TrendsInsightsSection({ citationData, selectedWeeks, selectedUrls }) {
  const [showInsights, setShowInsights] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState(null)
  const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type)
  
  // Apply filters
  const filteredData = summaryRates.filter(rate => {
    const weekMatch = selectedWeeks.length === 0 || selectedWeeks.includes(rate.week)
    let urlMatch = true
    if (selectedUrls.length > 0 && rate.citedUrls) {
      urlMatch = rate.citedUrls.some(url => selectedUrls.includes(url))
    }
    return weekMatch && urlMatch
  })

  // Calculate trends
  const weeklyData = {}
  filteredData.forEach(rate => {
    if (!weeklyData[rate.week]) {
      weeklyData[rate.week] = {
        week: rate.week,
        totalPrompts: 0,
        totalCitations: 0,
        platforms: new Set()
      }
    }
    weeklyData[rate.week].totalPrompts += rate.totalPrompts || 0
    weeklyData[rate.week].totalCitations += rate.selectedUrlCitations || 0
    weeklyData[rate.week].platforms.add(rate.platform)
  })

  const weeklyTrends = Object.values(weeklyData)
    .map(w => ({
      ...w,
      rate: w.totalPrompts > 0 ? w.totalCitations / w.totalPrompts : 0,
      platformCount: w.platforms.size
    }))
    .sort((a, b) => a.week.localeCompare(b.week))

  // Calculate trend direction
  const getTrend = () => {
    if (weeklyTrends.length < 2) return { direction: 'stable', change: 0 }
    const recent = weeklyTrends.slice(-3)
    const older = weeklyTrends.slice(0, -3)
    if (older.length === 0) return { direction: 'stable', change: 0 }
    
    const recentAvg = recent.reduce((sum, w) => sum + w.rate, 0) / recent.length
    const olderAvg = older.reduce((sum, w) => sum + w.rate, 0) / older.length
    const change = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (change > 10) return { direction: 'improving', change }
    if (change < -10) return { direction: 'declining', change }
    return { direction: 'stable', change }
  }

  const trend = getTrend()
  const bestWeek = weeklyTrends.length > 0 
    ? weeklyTrends.reduce((best, current) => current.rate > best.rate ? current : best)
    : null
  const worstWeek = weeklyTrends.length > 0
    ? weeklyTrends.reduce((worst, current) => current.rate < worst.rate ? current : worst)
    : null

  // Platform consistency
  const platformConsistency = {}
  filteredData.forEach(rate => {
    if (!platformConsistency[rate.platform]) {
      platformConsistency[rate.platform] = []
    }
    platformConsistency[rate.platform].push(rate.selectedUrlRate || 0)
  })

  const consistencyScores = Object.entries(platformConsistency).map(([platform, rates]) => {
    const avg = rates.reduce((sum, r) => sum + r, 0) / rates.length
    const variance = rates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / rates.length
    const stdDev = Math.sqrt(variance)
    const consistency = 1 - Math.min(stdDev / avg, 1) // 0-1 score, higher is more consistent
    return { platform, consistency, avg }
  }).sort((a, b) => b.consistency - a.consistency)

  const mostConsistent = consistencyScores[0]
  const leastConsistent = consistencyScores[consistencyScores.length - 1]

  // Generate AI recommendations
  const generateAIRecommendations = async () => {
    setLoadingRecommendations(true)
    setRecommendationsError(null)
    
    try {
      const response = await fetch('/api/citations/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citationData,
          selectedWeeks,
          selectedUrls
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate recommendations: ${response.status}`)
      }

      const data = await response.json()
      setAiRecommendations(data)
    } catch (error) {
      console.error('[AI Recommendations] Error:', error)
      setRecommendationsError(error.message)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  // Auto-generate when section is expanded
  useEffect(() => {
    if (showInsights && !aiRecommendations && !loadingRecommendations) {
      generateAIRecommendations()
    }
  }, [showInsights])

  return (
    <div className="card">
      <button
        onClick={() => setShowInsights(!showInsights)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Trends & Insights</h2>
            <p className="text-sm text-gray-600 mt-0.5">Discover patterns and actionable recommendations</p>
          </div>
        </div>
        {showInsights ? (
          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </button>

      {showInsights && weeklyTrends.length > 0 && (
        <div className="mt-6 animate-slide-down space-y-6">
          {/* Overall Trend */}
          <div className={`p-4 rounded-lg border-2 ${
            trend.direction === 'improving' ? 'bg-green-50 border-green-200' :
            trend.direction === 'declining' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              {trend.direction === 'improving' && <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0" />}
              {trend.direction === 'declining' && <TrendingUp className="w-6 h-6 text-red-600 flex-shrink-0 rotate-180" />}
              {trend.direction === 'stable' && <Target className="w-6 h-6 text-blue-600 flex-shrink-0" />}
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-1 ${
                  trend.direction === 'improving' ? 'text-green-900' :
                  trend.direction === 'declining' ? 'text-red-900' :
                  'text-blue-900'
                }`}>
                  {trend.direction === 'improving' && '📈 Citation Performance is Improving'}
                  {trend.direction === 'declining' && '📉 Citation Performance is Declining'}
                  {trend.direction === 'stable' && '➡️ Citation Performance is Stable'}
                </h3>
                <p className={`text-sm ${
                  trend.direction === 'improving' ? 'text-green-800' :
                  trend.direction === 'declining' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {trend.direction === 'improving' && `Your citation rate has increased by ${Math.abs(trend.change).toFixed(1)}% in recent weeks. Keep up the good work!`}
                  {trend.direction === 'declining' && `Your citation rate has decreased by ${Math.abs(trend.change).toFixed(1)}% in recent weeks. Consider refreshing your content strategy.`}
                  {trend.direction === 'stable' && `Your citation rate has remained consistent. Consider experimenting with new content to boost performance.`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Best Week */}
            {bestWeek && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Best Performing Week</h4>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">{bestWeek.week}</div>
                <div className="text-sm text-green-800">
                  <div>{(bestWeek.rate * 100).toFixed(1)}% citation rate</div>
                  <div className="text-xs mt-1">{bestWeek.totalCitations} citations from {bestWeek.totalPrompts.toLocaleString()} prompts</div>
                </div>
              </div>
            )}

            {/* Worst Week */}
            {worstWeek && bestWeek && worstWeek.week !== bestWeek.week && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">Needs Attention</h4>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">{worstWeek.week}</div>
                <div className="text-sm text-orange-800">
                  <div>{(worstWeek.rate * 100).toFixed(1)}% citation rate</div>
                  <div className="text-xs mt-1">Consider analyzing what worked differently this week</div>
                </div>
              </div>
            )}

            {/* Most Consistent Platform */}
            {mostConsistent && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Most Consistent Platform</h4>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{mostConsistent.platform}</div>
                <div className="text-sm text-blue-800">
                  <div>{(mostConsistent.consistency * 100).toFixed(0)}% consistency score</div>
                  <div className="text-xs mt-1">Reliable performance across weeks</div>
                </div>
              </div>
            )}

            {/* Variable Platform */}
            {leastConsistent && mostConsistent && leastConsistent.platform !== mostConsistent.platform && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Most Variable Platform</h4>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">{leastConsistent.platform}</div>
                <div className="text-sm text-purple-800">
                  <div>{(leastConsistent.consistency * 100).toFixed(0)}% consistency score</div>
                  <div className="text-xs mt-1">Performance varies week-to-week</div>
                </div>
              </div>
            )}
          </div>

          {/* Week-by-Week Timeline */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Week-by-Week Performance
            </h4>
            <div className="space-y-2">
              {weeklyTrends.map((week, idx) => {
                const prevWeek = idx > 0 ? weeklyTrends[idx - 1] : null
                const change = prevWeek ? ((week.rate - prevWeek.rate) / prevWeek.rate) * 100 : 0
                
                return (
                  <div key={week.week} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-20 font-semibold text-gray-700">{week.week}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(week.rate * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-right font-bold text-blue-600">
                          {(week.rate * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{week.totalCitations} cites</span>
                        <span>{week.platformCount} platforms</span>
                        {prevWeek && change !== 0 && (
                          <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI-Generated Recommendations */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                AI-Powered Recommendations
                {aiRecommendations?.isAIGenerated && (
                  <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    ✨ AI Generated
                  </span>
                )}
              </h4>
              {aiRecommendations && !loadingRecommendations && (
                <button
                  onClick={generateAIRecommendations}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              )}
            </div>

            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Analyzing your citation data with AI...</p>
                  <p className="text-xs text-gray-500 mt-1">This may take 10-20 seconds</p>
                </div>
              </div>
            ) : recommendationsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Unable to Generate AI Recommendations</p>
                    <p className="text-sm text-red-700 mt-1">{recommendationsError}</p>
                    <button
                      onClick={generateAIRecommendations}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            ) : aiRecommendations && aiRecommendations.recommendations ? (
              <div className="space-y-3">
                {aiRecommendations.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{rec}</p>
                    </div>
                  </div>
                ))}
                
                {aiRecommendations.isAIGenerated && (
                  <p className="text-xs text-gray-500 italic mt-4">
                    💡 These recommendations were generated by AI based on your actual citation performance data. 
                    They are specific to your domain, platforms, and current trends.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <button
                  onClick={generateAIRecommendations}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate AI Recommendations
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Get personalized, actionable insights powered by AI
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showInsights && weeklyTrends.length === 0 && (
        <div className="mt-6 text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Not enough data to generate insights. Upload more citation data to see trends.</p>
        </div>
      )}
    </div>
  )
}

// Empty State Component
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

export default CitationPerformance

