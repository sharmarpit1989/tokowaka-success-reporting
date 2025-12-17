import React, { useState, useMemo } from 'react'
import { BarChart3, ChevronUp, ChevronDown, Info, LineChart as LineChartIcon } from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'

/**
 * Visual Analytics Section Component
 * Displays weekly trends and platform performance charts
 */
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
      legend: { display: false },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''
            if (label) label += ': '
            // For horizontal bars (indexAxis: 'y'), value is in context.parsed.x
            if (context.parsed.x !== null) {
              label += context.parsed.x + '%'
            }
            return label
          }
        }
      }
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

export default VisualAnalyticsSection

