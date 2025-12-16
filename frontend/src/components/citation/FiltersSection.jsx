import React from 'react'
import { Filter, ChevronUp, ChevronDown, Search, X } from 'lucide-react'

/**
 * Filters section for Citation Performance
 * Allows filtering by week, URL, and other criteria
 */
function FiltersSection({ 
  citationData, 
  selectedWeeks, 
  setSelectedWeeks, 
  selectedUrls, 
  setSelectedUrls, 
  urlSearchTerm, 
  setUrlSearchTerm, 
  showFilters, 
  setShowFilters 
}) {
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

export default FiltersSection

