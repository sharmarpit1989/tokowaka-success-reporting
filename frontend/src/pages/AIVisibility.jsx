import { useState, useEffect } from 'react'
import { 
  Upload, Globe, FileText, TrendingUp, ChevronDown, ChevronUp, 
  Info, Activity, Lightbulb, Target, Zap, Check, Loader, X, AlertCircle, CheckCircle, RotateCcw,
  Sparkles, RefreshCw
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import Tooltip from '../components/Tooltip'
import LLMScoreTooltip, { OverallLLMScoreTooltip } from '../components/LLMScoreTooltip'

function AIVisibility() {
  // Get context for data persistence
  const { 
    activeProject, 
    updateActiveProject, 
    citationData, 
    updateCitationData 
  } = useAppContext()

  // Initialize state from context if available
  const [step, setStep] = useState(() => {
    // Only go to step 3 if we have actual citation data
    const hasCitations = activeProject?.dashboard?.summary?.urlsWithCitations > 0 || 
                         activeProject?.citationUploaded
    if (activeProject?.dashboard && hasCitations) return 3
    // If project exists with URLs, show upload screen (step 2)
    if (activeProject?.projectId && activeProject?.urlCount > 0) return 2
    return 1
  })
  const [domain, setDomain] = useState(activeProject?.domain || '')
  const [domainError, setDomainError] = useState('')
  const [sitemapUrls, setSitemapUrls] = useState([''])
  const [projectId, setProjectId] = useState(activeProject?.projectId || null)
  const [project, setProject] = useState(activeProject || null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [dashboard, setDashboard] = useState(activeProject?.dashboard || null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [analyzingUrls, setAnalyzingUrls] = useState(new Set())
  const [analysisProgress, setAnalysisProgress] = useState(new Map()) // url -> {step, message, percentage}
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [sortBy, setSortBy] = useState('citationRate') // citationRate, llmScore, url
  const [toast, setToast] = useState(null) // { type: 'success' | 'error' | 'info', message: string }
  const [selectedUrls, setSelectedUrls] = useState(new Set()) // For multi-select (analysis & insights)
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false)
  const [batchDelay, setBatchDelay] = useState(5) // Delay in seconds between batch analyses
  const [showBatchSettings, setShowBatchSettings] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState(new Set()) // URLs currently generating insights
  const [citationsJustUploaded, setCitationsJustUploaded] = useState(false) // Track if user just uploaded citations

  // Restore project on mount if it exists
  useEffect(() => {
    if (activeProject && !dashboard && activeProject.projectId) {
      // Try to load dashboard if project exists
      loadDashboard()
    }
  }, [])

  // Adjust step when dashboard loads - but DON'T interfere after user uploads citations
  useEffect(() => {
    // Skip if user just uploaded citations - let the explicit setStep(3) work
    if (citationsJustUploaded) return
    
    if (dashboard && step === 3) {
      const hasCitations = dashboard.summary?.urlsWithCitations > 0
      if (!hasCitations && projectId) {
        // We have a project with URLs but no citations - go to step 2
        console.log('[Step Logic] No citations found, returning to step 2')
        setStep(2)
      }
    }
  }, [dashboard, step, citationsJustUploaded])

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Domain validation helper
  const validateDomain = (value) => {
    if (!value.trim()) {
      return 'Domain is required'
    }
    // Remove protocol and www if present
    const cleanDomain = value.trim().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}\.)*[a-zA-Z]{2,}$/
    if (!domainRegex.test(cleanDomain)) {
      return 'Please enter a valid domain (e.g., example.com)'
    }
    return ''
  }

  // Toast notification helper
  const showToast = (type, message) => {
    setToast({ type, message })
  }

  // Reset handler
  const handleReset = () => {
    if (confirm('Are you sure you want to start over? This will clear all current data.')) {
      setStep(1)
      setDomain('')
      setDomainError('')
      setSitemapUrls([''])
      setProjectId(null)
      setProject(null)
      setDashboard(null)
      setExpandedRows(new Set())
      setCurrentPage(1)
      updateActiveProject(null)
      updateCitationData(null)
      showToast('info', 'Workspace reset successfully')
    }
  }

  // Step 1A: Upload URL File
  const handleUrlFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate domain first
    const error = validateDomain(domain)
    if (error) {
      setDomainError(error)
      showToast('error', error)
      e.target.value = '' // Reset file input
      return
    }

    setDomainError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('domain', domain.trim())

    setIsProcessing(true)

    try {
      console.log('[URL Upload] Uploading file:', file.name)
      console.log('[URL Upload] Domain:', domain)

      const response = await fetch('/api/unified/create-from-file', {
        method: 'POST',
        body: formData
      })

      console.log('[URL Upload] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[URL Upload] Error response:', errorData)
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()
      console.log('[URL Upload] Success:', data)
      
      setProjectId(data.projectId)
      setProject(data)
      
      // Save to context for persistence
      updateActiveProject({
        projectId: data.projectId,
        domain: domain.trim(),
        urlCount: data.urlCount,
        urls: data.urls || [],
        source: 'file',
        createdAt: new Date().toISOString()
      })
      
      showToast('success', `Successfully loaded ${data.urlCount} URLs from ${file.name}`)
      
      // Auto-advance to step 2 after a brief delay
      setTimeout(() => setStep(2), 1500)
      
    } catch (error) {
      console.error('[URL Upload] Error:', error)
      showToast('error', 'Failed to upload file: ' + error.message)
    } finally {
      setIsProcessing(false)
      e.target.value = '' // Reset file input
    }
  }

  // Step 1B: Create Project from Sitemaps
  const handleCreateProject = async () => {
    // Validate domain
    const error = validateDomain(domain)
    if (error) {
      setDomainError(error)
      showToast('error', error)
      return
    }

    const validSitemaps = sitemapUrls.filter(u => u.trim())
    if (validSitemaps.length === 0) {
      showToast('error', 'Please enter at least one sitemap URL')
      return
    }

    setDomainError('')
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/unified/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          sitemapUrls: validSitemaps
        })
      })

      if (!response.ok) throw new Error('Failed to create project')

      const data = await response.json()
      setProjectId(data.projectId)
      setProject(data)
      
      // Save to context for persistence
      updateActiveProject({
        projectId: data.projectId,
        domain: domain.trim(),
        urlCount: data.urlCount,
        sitemapUrls: validSitemaps,
        source: 'sitemap',
        createdAt: new Date().toISOString()
      })
      
      showToast('success', `Successfully extracted ${data.urlCount} URLs from ${validSitemaps.length} sitemap(s)`)
      
      // Auto-advance to step 2 after a brief delay
      setTimeout(() => setStep(2), 1500)
      
    } catch (error) {
      showToast('error', 'Failed to create project: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 2: Upload Citations
  const handleCitationUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    console.log(`[Citation Upload] Uploading ${files.length} files to project ${projectId}`)

    setIsProcessing(true)
    showToast('info', `Processing ${files.length} file(s)... This may take a moment.`)

    try {
      const response = await fetch(`/api/unified/${projectId}/upload-citations`, {
        method: 'POST',
        body: formData
      })

      console.log(`[Citation Upload] Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[Citation Upload] Error response:', errorData)
        throw new Error(errorData.error || 'Failed to upload citations')
      }

      const data = await response.json()
      console.log('[Citation Upload] Success:', data)
      
      // Update active project metadata (actual citation data will be saved when dashboard loads)
      updateActiveProject({
        ...activeProject,
        citationUploaded: true,
        citationFiles: Array.from(files).map(f => f.name)
      })
      
      // Poll for completion (this will load dashboard and save citation data to context)
      await pollForDashboard()
      
    } catch (error) {
      console.error('[Citation Upload] Caught error:', error)
      showToast('error', 'Failed to upload citations: ' + error.message)
      setIsProcessing(false)
    }
    
    // Reset file input
    e.target.value = ''
  }

  // Poll for dashboard readiness
  const pollForDashboard = async () => {
    const maxAttempts = 30
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/unified/${projectId}/status`)
        const status = await response.json()

        if (status.citationStatus === 'completed') {
          setIsProcessing(false)
          setCitationsJustUploaded(true) // Prevent useEffect from interfering
          await loadDashboard()
          showToast('success', 'Dashboard ready! Citation data processed successfully.')
          setStep(3)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000)
        } else {
          setIsProcessing(false)
          showToast('error', 'Processing is taking longer than expected. Please refresh to check status.')
        }
      } catch (error) {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000)
        } else {
          setIsProcessing(false)
          showToast('error', 'Error checking status. Please try again.')
        }
      }
    }

    checkStatus()
  }

  // Generate AI insights for a single URL
  const generateInsights = async (url, regenerate = false) => {
    if (!projectId) {
      showToast('error', 'No project selected')
      return
    }

    console.log(`[Generate Insights] Starting for URL: ${url}`)
    
    // Add to generating set
    setGeneratingInsights(prev => new Set([...prev, url]))

    try {
      const response = await fetch(`/api/unified/${projectId}/generate-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, regenerate })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        showToast('success', regenerate ? 'Insights regenerated successfully!' : 'Insights generated successfully!')
        
        // Reload dashboard to get updated data
        await loadDashboard()
      } else {
        throw new Error(data.error || 'Failed to generate insights')
      }

    } catch (error) {
      console.error('[Generate Insights] Error:', error)
      showToast('error', error.message)
    } finally {
      // Remove from generating set
      setGeneratingInsights(prev => {
        const next = new Set(prev)
        next.delete(url)
        return next
      })
    }
  }

  // Batch generate insights for selected URLs (only those with analysis)
  const generateBatchInsights = async () => {
    if (selectedUrls.size === 0) {
      showToast('error', 'No URLs selected')
      return
    }

    // Filter to only include URLs that have analysis results
    const urlsWithAnalysis = Array.from(selectedUrls).filter(url => {
      const urlData = dashboard?.urls?.find(u => u.url === url)
      return urlData && urlData.hasContentAnalysis
    })

    if (urlsWithAnalysis.length === 0) {
      showToast('error', 'Selected URLs need to be analyzed first before generating insights')
      return
    }

    console.log(`[Batch Insights] Generating for ${urlsWithAnalysis.length} URLs`)

    // Add all to generating set
    setGeneratingInsights(prev => new Set([...prev, ...urlsWithAnalysis]))

    try {
      const response = await fetch(`/api/unified/${projectId}/generate-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsWithAnalysis, regenerate: false })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        const { summary } = data
        showToast('success', `Insights generated! ${summary.successful} successful, ${summary.failed} failed`)
        
        // Reload dashboard to get updated data
        await loadDashboard()
        
        // Clear selection
        setSelectedUrls(new Set())
      } else {
        throw new Error(data.error || 'Failed to generate insights')
      }

    } catch (error) {
      console.error('[Batch Insights] Error:', error)
      showToast('error', error.message)
    } finally {
      // Remove all from generating set
      setGeneratingInsights(prev => {
        const next = new Set(prev)
        urlsWithAnalysis.forEach(url => next.delete(url))
        return next
      })
    }
  }

  // Load Dashboard Data
  const loadDashboard = async () => {
    setIsLoadingDashboard(true)
    try {
      const id = projectId || activeProject?.projectId
      if (!id) {
        throw new Error('No project ID available')
      }
      
      const response = await fetch(`/api/unified/${id}/dashboard`)
      if (!response.ok) throw new Error('Failed to load dashboard')
      const data = await response.json()
      
      // Merge with existing dashboard to preserve any in-progress or completed analyses
      setDashboard(prevDashboard => {
        if (!prevDashboard || !prevDashboard.urls) return data;
        
        // Create a map of existing URLs that have content analysis
        const analyzedUrlsMap = new Map(
          prevDashboard.urls
            .filter(u => u.hasContentAnalysis)
            .map(u => [u.url, u])
        );
        
        // Merge: prefer new data if it has AI insights, otherwise keep existing analysis
        const mergedUrls = data.urls.map(newUrlData => {
          const existing = analyzedUrlsMap.get(newUrlData.url);
          if (existing && existing.hasContentAnalysis) {
            // If new data has AI insights, prefer it over existing
            const newHasInsights = newUrlData.contentAnalysis?.hasAIInsights;
            const existingHasInsights = existing.contentAnalysis?.hasAIInsights;
            
            if (newHasInsights && !existingHasInsights) {
              // New data has insights, existing doesn't - use new data
              return newUrlData;
            } else if (newHasInsights && existingHasInsights) {
              // Both have insights - use newer timestamp
              const newTimestamp = new Date(newUrlData.contentAnalysis?.aiInsightsGeneratedAt || 0);
              const existingTimestamp = new Date(existing.contentAnalysis?.aiInsightsGeneratedAt || 0);
              if (newTimestamp > existingTimestamp) {
                return newUrlData;
              }
            }
            
            // Keep the existing analysis, but update citation data
            return {
              ...existing,
              citationRate: newUrlData.citationRate,
              hasCitationData: newUrlData.hasCitationData
            };
          }
          return newUrlData;
        });
        
        return {
          ...data,
          urls: mergedUrls
        };
      })
      
      // ✅ Extract and save citation data to context for Citation Performance page
      if (data.citationRates && data.citationRates.length > 0) {
        console.log('[AIVisibility] Saving citation data to context:', {
          ratesCount: data.citationRates.length,
          targetUrlsCount: data.targetUrls?.length || 0
        })
        
        updateCitationData({
          citationRates: data.citationRates,
          targetUrls: data.targetUrls || [],
          domain: data.domain,
          loadedAt: new Date().toISOString()
        })
      }
      
      // Save dashboard to context
      updateActiveProject({
        ...activeProject,
        dashboard: data,
        lastLoadedAt: new Date().toISOString()
      })
    } catch (error) {
      showToast('error', 'Failed to load dashboard: ' + error.message)
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  // Update analysis progress
  const updateProgress = (url, step, message, percentage, completed = false) => {
    setAnalysisProgress(prev => {
      const next = new Map(prev)
      if (completed) {
        next.delete(url)
      } else {
        next.set(url, { step, message, percentage })
      }
      return next
    })
  }

  // Analyze Content for a URL
  const analyzeUrl = async (url) => {
    if (!projectId) {
      showToast('error', 'Project ID not found. Please reload the page.')
      return
    }

    // Mark URL as being analyzed
    setAnalyzingUrls(prev => new Set([...prev, url]))
    updateProgress(url, 1, 'Initializing analysis...', 5)
    showToast('info', 'Starting content analysis...')

    try {
      console.log('[Analyze URL] Starting analysis for:', url)
      console.log('[Analyze URL] Project ID:', projectId)
      
      updateProgress(url, 2, 'Sending request to server...', 10)
      
      const response = await fetch(`/api/unified/${projectId}/analyze-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [url] })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to start analysis: ${response.status}`)
      }

      const data = await response.json()
      console.log('[Analyze URL] Analysis started:', data)

      updateProgress(url, 3, 'Launching browser instance...', 15)
      
      // Give backend time to start
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateProgress(url, 4, 'Loading page content...', 25)

      // Poll for completion
      await pollForContentAnalysis(url)
      
    } catch (error) {
      console.error('[Analyze URL] Error:', error)
      showToast('error', 'Failed to start analysis: ' + error.message)
      // Remove from analyzing set and progress
      setAnalyzingUrls(prev => {
        const next = new Set(prev)
        next.delete(url)
        return next
      })
      updateProgress(url, 0, '', 0, true)
    }
  }

  // Poll for content analysis completion
  const pollForContentAnalysis = async (url) => {
    const maxAttempts = 30
    let attempts = 0
    let pollInterval = 8000 // ⚡ OPTIMIZATION: Start with 8 seconds (reduced API load)
    const maxInterval = 15000 // Max 15 seconds between polls

    const checkCompletion = async () => {
      try {
        attempts++
        console.log(`[Analyze URL] Polling attempt ${attempts}/${maxAttempts} for:`, url)
        
        // Update progress based on attempts (simulated progress)
        const progressStages = [
          { threshold: 0, step: 5, message: 'Analyzing page structure...', percentage: 35 },
          { threshold: 2, step: 6, message: 'Running JavaScript analysis...', percentage: 45 },
          { threshold: 4, step: 7, message: 'Calculating LLM presence scores...', percentage: 55 },
          { threshold: 6, step: 8, message: 'Generating AI recommendations...', percentage: 70 },
          { threshold: 10, step: 9, message: 'Almost complete! Finalizing results...', percentage: 85 },
        ]
        
        const stage = progressStages.reverse().find(s => attempts >= s.threshold) || progressStages[0]
        updateProgress(url, stage.step, stage.message, stage.percentage)
        
        // Check status endpoint first (lighter than full dashboard)
        const statusResponse = await fetch(`/api/unified/${projectId}/status`)
        if (statusResponse.ok) {
          const status = await statusResponse.json()
          console.log('[Analyze URL] Status check:', status)
        }
        
        // Reload dashboard to get actual data
        // ⚡ OPTIMIZATION: No cache busting during polling - let browser cache work
        const response = await fetch(`/api/unified/${projectId}/dashboard`)
        if (!response.ok) {
          console.error('[Analyze URL] Dashboard fetch failed:', response.status)
          throw new Error('Failed to load dashboard')
        }
        
        const data = await response.json()
        console.log('[Analyze URL] Dashboard data received, checking for URL:', url)
        
        const urlData = data.urls?.find(u => u.url === url)
        
        if (urlData && urlData.hasContentAnalysis) {
          console.log('[Analyze URL] ✅ Analysis complete for:', url)
          console.log('[Analyze URL] Analysis data:', urlData.contentAnalysis)
          
          updateProgress(url, 10, '✅ Analysis complete!', 100)
          showToast('success', 'Content analysis completed successfully!')
          
          // Give user a moment to see completion
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Merge new data with existing dashboard to preserve previous analyses
          setDashboard(prevDashboard => {
            if (!prevDashboard) return data;
            
            // Create a map of existing URLs for quick lookup
            const existingUrlsMap = new Map(
              prevDashboard.urls.map(u => [u.url, u])
            );
            
            // Update or add the analyzed URL data
            data.urls.forEach(newUrlData => {
              if (newUrlData.url === url || newUrlData.hasContentAnalysis) {
                existingUrlsMap.set(newUrlData.url, newUrlData);
              }
            });
            
            // Convert back to array
            const mergedUrls = Array.from(existingUrlsMap.values());
            
            return {
              ...data,
              urls: mergedUrls
            };
          })
          
          // Update context
          updateActiveProject({
            ...activeProject,
            dashboard: {
              ...dashboard,
              urls: dashboard?.urls?.map(u => 
                u.url === url && urlData ? urlData : u
              ) || []
            },
            lastAnalyzedAt: new Date().toISOString()
          })
          
          // Remove from analyzing set and progress
          setAnalyzingUrls(prev => {
            const next = new Set(prev)
            next.delete(url)
            return next
          })
          updateProgress(url, 0, '', 0, true)
          return
        }

        if (attempts < maxAttempts) {
          // Exponential backoff: gradually increase interval
          pollInterval = Math.min(pollInterval * 1.2, maxInterval)
          console.log(`[Analyze URL] No results yet. Waiting ${Math.round(pollInterval/1000)}s before next check...`)
          setTimeout(checkCompletion, pollInterval)
        } else {
          console.log('[Analyze URL] ⏱️ Polling timeout for:', url)
          // Remove from analyzing set and progress
          setAnalyzingUrls(prev => {
            const next = new Set(prev)
            next.delete(url)
            return next
          })
          updateProgress(url, 0, '', 0, true)
          showToast('error', 'Analysis is taking longer than expected. It may still be running. Try refreshing in a few minutes.')
        }
      } catch (error) {
        console.error('[Analyze URL] Polling error:', error)
        if (attempts < maxAttempts) {
          console.log('[Analyze URL] Retrying after error...')
          setTimeout(checkCompletion, pollInterval)
        } else {
          // Final failure - remove from analyzing set and progress
          setAnalyzingUrls(prev => {
            const next = new Set(prev)
            next.delete(url)
            return next
          })
          updateProgress(url, 0, '', 0, true)
          showToast('error', 'Error checking analysis status. Please check backend logs and refresh.')
        }
      }
    }

    checkCompletion()
  }

  // Toggle Row Expansion
  const toggleRow = (url) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(url)) {
      newExpanded.delete(url)
    } else {
      newExpanded.add(url)
    }
    setExpandedRows(newExpanded)
  }

  // Toggle URL selection
  const toggleUrlSelection = (url) => {
    const newSelected = new Set(selectedUrls)
    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }
    setSelectedUrls(newSelected)
  }

  // Select/Deselect all URLs on current page
  const toggleSelectAll = (urls) => {
    const newSelected = new Set(selectedUrls)
    const allSelected = urls.every(u => selectedUrls.has(u.url))
    
    if (allSelected) {
      // Deselect all on this page
      urls.forEach(u => newSelected.delete(u.url))
    } else {
      // Select all on this page
      urls.forEach(u => newSelected.add(u.url))
    }
    
    setSelectedUrls(newSelected)
  }

  // Batch analyze selected URLs
  const analyzeBatchUrls = async () => {
    if (selectedUrls.size === 0) {
      showToast('error', 'No URLs selected')
      return
    }

    const urlsToAnalyze = Array.from(selectedUrls)
    const delayMs = batchDelay * 1000
    
    setIsBatchAnalyzing(true)
    showToast('info', `Starting analysis for ${urlsToAnalyze.length} URLs with ${batchDelay}s delay between each...`)

    let successCount = 0
    let failCount = 0
    let currentIndex = 0

    for (const url of urlsToAnalyze) {
      currentIndex++
      
      try {
        console.log(`[Batch Analysis] Processing ${currentIndex}/${urlsToAnalyze.length}: ${url}`)
        await analyzeUrl(url)
        successCount++
        
        // Show progress
        if (currentIndex < urlsToAnalyze.length) {
          showToast('info', `Analyzed ${currentIndex}/${urlsToAnalyze.length}. Next URL in ${batchDelay}s...`)
          // Configurable delay between requests
          await new Promise(resolve => setTimeout(resolve, delayMs))
        }
      } catch (error) {
        console.error(`[Batch Analysis] Failed for ${url}:`, error)
        failCount++
        
        // If it's a rate limit error, pause longer
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          showToast('error', `Rate limit hit. Pausing for 30 seconds...`)
          await new Promise(resolve => setTimeout(resolve, 30000))
        }
      }
    }

    setIsBatchAnalyzing(false)
    setSelectedUrls(new Set()) // Clear selection

    if (successCount > 0) {
      showToast('success', `Completed! ${successCount} URLs analyzed successfully. ${failCount > 0 ? `${failCount} failed.` : ''}`)
    } else {
      showToast('error', 'Failed to start analysis for all selected URLs')
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg max-w-md ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
            <p className={`text-sm font-medium flex-1 ${
              toast.type === 'success' ? 'text-green-800' :
              toast.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Visibility Analysis</h1>
          <p className="text-gray-600">
            Unified analysis combining sitemap URLs, citation performance, and content insights
          </p>
        </div>
        {(step > 1 || project) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Start over with a new project"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="card">
        <div className="flex items-center justify-between">
          <StepIndicator num={1} label="Setup Domain" active={step === 1} completed={step > 1} />
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${step > 1 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          </div>
          <StepIndicator num={2} label="Upload Citations" active={step === 2} completed={step > 2} />
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${step > 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          </div>
          <StepIndicator num={3} label="Dashboard" active={step === 3} completed={false} />
        </div>
      </div>

      {/* Step 1: Setup */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Domain Input - Emphasized */}
          <div className="card bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary-600" />
              Step 1: Enter Your Domain
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Start by entering your website domain. We'll use this to analyze your URLs.
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2 absolute left-3" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value)
                      // Clear error as user types
                      if (domainError) setDomainError('')
                    }}
                    onBlur={(e) => {
                      // Validate on blur
                      const error = validateDomain(e.target.value)
                      setDomainError(error)
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const error = validateDomain(domain)
                        if (!error) {
                          // Focus on file upload or sitemap input
                          document.getElementById('url-file-input')?.focus()
                        }
                      }
                    }}
                    placeholder="example.com"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all ${
                      domainError 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : domain && !domainError
                        ? 'border-green-300 focus:border-green-500 bg-green-50'
                        : 'border-gray-300 focus:border-primary-500'
                    }`}
                  />
                  {domain && !domainError && (
                    <Check className="w-5 h-5 text-green-600 absolute right-3" />
                  )}
                </div>
                {domainError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {domainError}
                  </p>
                )}
                {domain && !domainError && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Domain looks good!
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Examples: adobe.com, example.org, my-website.co.uk
              </p>
            </div>
          </div>

          {/* Option A: Upload URL File - RECOMMENDED */}
          <div className="card border-2 border-primary-300 bg-white relative overflow-hidden">
            {/* Recommended Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md">
              ⚡ RECOMMENDED
            </div>
            
            <div className="pr-24">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-600" />
                Option A: Upload URL File
                <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Fast</span>
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a CSV or Excel file containing your URLs. Fastest way to get started!
              </p>

              {/* File Format Help */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">📄 Required Format:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• CSV or Excel (.csv, .xlsx, .xls)</li>
                  <li>• Must have a column named "url" or "URL"</li>
                  <li>• Each row should contain one URL</li>
                </ul>
              </div>

              <label 
                id="url-file-input"
                className={`btn-primary cursor-pointer inline-flex items-center justify-center w-full ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing File...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV/Excel with URLs
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleUrlFileUpload}
                  disabled={isProcessing}
                />
              </label>
            </div>

            {project && project.source === 'file' && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-900">
                      Successfully loaded {project.urlCount} URLs!
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Ready to proceed to citation upload
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Option B: Sitemap URLs */}
          <div className="card border-gray-300">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Option B: Parse Sitemaps
              <span className="text-xs font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Slower</span>
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter sitemap URLs to automatically extract all pages
            </p>

            {/* Sitemap Format Help */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-1">📋 Expected Format:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Full sitemap URL (e.g., https://example.com/sitemap.xml)</li>
                <li>• Supports sitemap index files</li>
                <li>• Can add multiple sitemaps</li>
              </ul>
            </div>

            <div className="space-y-2">
              {sitemapUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...sitemapUrls]
                      newUrls[idx] = e.target.value
                      setSitemapUrls(newUrls)
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && url.trim()) {
                        e.preventDefault()
                        // Add another sitemap field or submit if last one
                        if (idx === sitemapUrls.length - 1) {
                          handleCreateProject()
                        }
                      }
                    }}
                    placeholder="https://example.com/sitemap.xml"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {idx > 0 && (
                    <button
                      onClick={() => setSitemapUrls(sitemapUrls.filter((_, i) => i !== idx))}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove this sitemap"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setSitemapUrls([...sitemapUrls, ''])}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                + Add another sitemap
              </button>
            </div>

            <button
              onClick={handleCreateProject}
              disabled={isProcessing}
              className="btn-primary w-full mt-4"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Parsing Sitemaps...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Extract URLs from Sitemaps
                </>
              )}
            </button>

            {project && project.source === 'sitemap' && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-900">
                      Successfully extracted {project.urlCount} URLs!
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      From {sitemapUrls.filter(u => u.trim()).length} sitemap(s)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Upload Citations */}
      {step === 2 && project && (
        <div className="space-y-4 animate-fade-in">
          {/* Success Summary */}
          <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 text-lg">URLs Ready!</h3>
                <p className="text-sm text-green-700">
                  Successfully loaded {project.urlCount} URLs from {domain}
                </p>
              </div>
            </div>
          </div>

          {/* Citation Upload */}
          <div className="card border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary-600" />
              Step 2: Upload Brand Presence Data
            </h2>
            <p className="text-gray-600 mb-4">
              Upload Excel files containing AI platform citation data to analyze performance
            </p>

            {/* File Format Help */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">📄 Expected Format:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Excel files (.xlsx, .xls)</li>
                <li>• Format: brandpresence-platform-wXX-YYYY.xlsx</li>
                <li>• Can upload multiple files at once</li>
              </ul>
            </div>

            <label className={`btn-primary cursor-pointer inline-flex items-center justify-center w-full ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Processing Files...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Excel Files
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                multiple
                onChange={handleCitationUpload}
                disabled={isProcessing}
              />
            </label>

            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-blue-900 font-medium">Processing brand presence data...</p>
                    <p className="text-xs text-blue-700 mt-1">This may take a minute. Please wait.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Dashboard */}
      {step === 3 && dashboard && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-purple-50 border-purple-200">
              <div className="text-sm font-medium text-purple-900 mb-1">Total URLs</div>
              <div className="text-3xl font-bold text-purple-600">{dashboard.summary.totalUrls}</div>
            </div>
            <div className="card bg-blue-50 border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">URLs with Citations</div>
              <div className="text-3xl font-bold text-blue-600">{dashboard.summary.urlsWithCitations}</div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="text-sm font-medium text-green-900 mb-1">Avg Citation Rate</div>
              <div className="text-3xl font-bold text-green-600">
                {(dashboard.summary.avgCitationRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="card bg-orange-50 border-orange-200">
              <div className="text-sm font-medium text-orange-900 mb-1">Avg LLM Score</div>
              <div className="text-3xl font-bold text-orange-600">
                {(dashboard.summary.avgLLMScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* URL List with Accordions - Sticky Container */}
          <div className="card sticky top-4 z-10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">URLs & Citation Performance</h2>
              
              {/* Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Batch Settings Button */}
                {selectedUrls.size > 0 && (
                  <button
                    onClick={() => setShowBatchSettings(!showBatchSettings)}
                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all"
                    title="Adjust batch analysis settings"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {batchDelay}s delay
                  </button>
                )}
                
                {/* Batch Analyze Button */}
                {selectedUrls.size > 0 && (
                  <button
                    onClick={analyzeBatchUrls}
                    disabled={isBatchAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm transition-all"
                  >
                    {isBatchAnalyzing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        Analyze {selectedUrls.size} URL{selectedUrls.size > 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                )}
                
                {/* Batch Generate Insights Button (only show if selected URLs have analysis) */}
                {(() => {
                  const selectedWithAnalysis = Array.from(selectedUrls).filter(url => {
                    const urlData = dashboard?.urls?.find(u => u.url === url)
                    return urlData && urlData.hasContentAnalysis
                  })
                  
                  return selectedWithAnalysis.length > 0 && (
                    <button
                      onClick={generateBatchInsights}
                      disabled={generatingInsights.size > 0}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      {generatingInsights.size > 0 ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Insights ({selectedWithAnalysis.length})
                        </>
                      )}
                    </button>
                  )
                })()}
                
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setCurrentPage(1) // Reset to first page when sorting changes
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="citationRate">Citation Rate (High to Low)</option>
                    <option value="citationRateLow">Citation Rate (Low to High)</option>
                    <option value="llmScore">LLM Score (High to Low)</option>
                    <option value="llmScoreLow">LLM Score (Low to High)</option>
                    <option value="url">URL (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Batch Settings Panel */}
            {showBatchSettings && selectedUrls.size > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">⚙️ Batch Analysis Settings</h4>
                    <p className="text-xs text-gray-600">Configure delay to avoid rate limits</p>
                  </div>
                  <button
                    onClick={() => setShowBatchSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {/* Delay Slider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between URLs: <span className="text-blue-600 font-bold">{batchDelay}s</span>
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={batchDelay}
                      onChange={(e) => setBatchDelay(parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>2s (Faster)</span>
                      <span>30s (Safer)</span>
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="bg-white rounded p-3 border border-blue-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">💡 Recommendations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li><strong>2-5s:</strong> Fast, good for small batches (&lt;10 URLs)</li>
                      <li><strong>5-10s:</strong> ✅ Recommended for most cases (10-20 URLs)</li>
                      <li><strong>10-30s:</strong> Very safe, prevents rate limits (20+ URLs)</li>
                    </ul>
                  </div>
                  
                  {/* Estimated Time */}
                  <div className="text-xs text-gray-600">
                    <Info className="w-4 h-4 inline mr-1" />
                    Estimated time: <strong>{Math.ceil((selectedUrls.size * batchDelay) / 60)} minutes</strong> for {selectedUrls.size} URLs
                  </div>
                </div>
              </div>
            )}
            
            {/* Select All Checkbox */}
            {(() => {
              // Get current page URLs for select all
              const sortedUrls = [...dashboard.urls].sort((a, b) => {
                switch (sortBy) {
                  case 'citationRate':
                    return (b.citationRate || 0) - (a.citationRate || 0)
                  case 'citationRateLow':
                    return (a.citationRate || 0) - (b.citationRate || 0)
                  case 'llmScore':
                    const aScore = a.contentAnalysis?.llmPresence ? 
                      Object.values(a.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                    const bScore = b.contentAnalysis?.llmPresence ? 
                      Object.values(b.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                    return bScore - aScore
                  case 'llmScoreLow':
                    const aScoreLow = a.contentAnalysis?.llmPresence ? 
                      Object.values(a.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                    const bScoreLow = b.contentAnalysis?.llmPresence ? 
                      Object.values(b.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                    return aScoreLow - bScoreLow
                  case 'url':
                    return a.url.localeCompare(b.url)
                  default:
                    return 0
                }
              })
              const startIndex = (currentPage - 1) * itemsPerPage
              const endIndex = startIndex + itemsPerPage
              const paginatedUrls = sortedUrls.slice(startIndex, endIndex)
              const allSelected = paginatedUrls.every(u => selectedUrls.has(u.url))
              
              return (
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleSelectAll(paginatedUrls)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="font-medium">
                      Select All on This Page ({paginatedUrls.length} URLs)
                    </span>
                    {selectedUrls.size > 0 && (
                      <span className="text-blue-600 font-semibold">
                        • {selectedUrls.size} selected
                      </span>
                    )}
                  </label>
                </div>
              )
            })()}
            
            <div className="space-y-2">
              {(() => {
                // Sort URLs
                const sortedUrls = [...dashboard.urls].sort((a, b) => {
                  switch (sortBy) {
                    case 'citationRate':
                      return (b.citationRate || 0) - (a.citationRate || 0)
                    case 'citationRateLow':
                      return (a.citationRate || 0) - (b.citationRate || 0)
                    case 'llmScore':
                      const aScore = a.contentAnalysis?.llmPresence ? 
                        Object.values(a.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                      const bScore = b.contentAnalysis?.llmPresence ? 
                        Object.values(b.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                      return bScore - aScore
                    case 'llmScoreLow':
                      const aScoreLow = a.contentAnalysis?.llmPresence ? 
                        Object.values(a.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                      const bScoreLow = b.contentAnalysis?.llmPresence ? 
                        Object.values(b.contentAnalysis.llmPresence).reduce((sum, val) => sum + val, 0) / 6 : 0
                      return aScoreLow - bScoreLow
                    case 'url':
                      return a.url.localeCompare(b.url)
                    default:
                      return 0
                  }
                })
                
                // Paginate
                const startIndex = (currentPage - 1) * itemsPerPage
                const endIndex = startIndex + itemsPerPage
                const paginatedUrls = sortedUrls.slice(startIndex, endIndex)
                
                return paginatedUrls.map((urlData) => (
                  <URLRow
                    key={urlData.url}
                    urlData={urlData}
                    expanded={expandedRows.has(urlData.url)}
                    isAnalyzing={analyzingUrls.has(urlData.url)}
                    progress={analysisProgress.get(urlData.url)}
                    isSelected={selectedUrls.has(urlData.url)}
                    onToggle={() => toggleRow(urlData.url)}
                    onAnalyze={() => analyzeUrl(urlData.url)}
                    onSelect={() => toggleUrlSelection(urlData.url)}
                    onGenerateInsights={(url) => generateInsights(url, false)}
                    onRegenerateInsights={(url) => generateInsights(url, true)}
                    isGeneratingInsights={generatingInsights.has(urlData.url)}
                  />
                ))
              })()}
            </div>

            {/* Pagination Controls */}
            {dashboard.urls.length > itemsPerPage && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, dashboard.urls.length)} - {Math.min(currentPage * itemsPerPage, dashboard.urls.length)} of {dashboard.urls.length} URLs
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(dashboard.urls.length / itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and 1 page on each side of current
                        const totalPages = Math.ceil(dashboard.urls.length / itemsPerPage)
                        return page === 1 || 
                               page === totalPages || 
                               (page >= currentPage - 1 && page <= currentPage + 1)
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1
                        
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(dashboard.urls.length / itemsPerPage), prev + 1))}
                    disabled={currentPage >= Math.ceil(dashboard.urls.length / itemsPerPage)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Step Indicator Component
function StepIndicator({ num, label, active, completed }) {
  return (
    <div className="flex items-center">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-bold
        ${completed ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}
      `}>
        {completed ? <Check className="w-5 h-5" /> : num}
      </div>
      <span className={`ml-2 text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

// URL Row Component with Accordion
function URLRow({ urlData, expanded, isAnalyzing, progress, isSelected, onToggle, onAnalyze, onSelect, onGenerateInsights, onRegenerateInsights, isGeneratingInsights }) {
  const { url, citationRate, hasCitationData, hasContentAnalysis, contentAnalysis } = urlData

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
    }`}>
      {/* Row Header */}
      <div className="flex items-center p-4 hover:bg-gray-50">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3 flex-shrink-0"
          title="Select for batch analysis"
        />
        
        {/* Expand/Collapse Button */}
        <button 
          className="mr-3 text-gray-600"
          onClick={onToggle}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        <div className="flex-1 min-w-0" onClick={onToggle}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm truncate block cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
          {isAnalyzing && progress && (
            <div className="mt-1">
              <p className="text-xs text-blue-600 font-medium">{progress.message}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 ml-4" onClick={(e) => e.stopPropagation()}>
          {isAnalyzing && progress && (
            <div className="flex items-center text-blue-600">
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm font-medium">{progress.percentage}%</span>
            </div>
          )}
          {hasCitationData ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(citationRate * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Citation Rate</div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">No citation data</div>
          )}
        </div>
      </div>

      {/* Accordion Content */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          {isAnalyzing ? (
            <AnalysisProgressDisplay progress={progress} />
          ) : hasContentAnalysis && contentAnalysis ? (
            <ContentAnalysisSection 
              analysis={contentAnalysis} 
              url={url}
              onGenerateInsights={onGenerateInsights}
              onRegenerateInsights={onRegenerateInsights}
              isGeneratingInsights={isGeneratingInsights}
            />
          ) : (
            <div className="text-center py-8">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Content analysis not available yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Click the button below to analyze this URL's LLM discoverability
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAnalyze()
                }}
                className="btn-secondary inline-flex items-center"
              >
                <Activity className="w-4 h-4 mr-2" />
                Analyze This URL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Analysis Progress Display Component
function AnalysisProgressDisplay({ progress }) {
  if (!progress) {
    return (
      <div className="text-center py-8">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-700 font-medium">Analyzing content...</p>
        <p className="text-sm text-gray-600 mt-2">This may take 30-60 seconds. Results will appear automatically.</p>
      </div>
    )
  }

  const steps = [
    { id: 1, label: 'Initializing analysis', icon: '🚀' },
    { id: 2, label: 'Sending request to server', icon: '📡' },
    { id: 3, label: 'Launching browser instance', icon: '🌐' },
    { id: 4, label: 'Loading page content', icon: '📄' },
    { id: 5, label: 'Analyzing page structure', icon: '🔍' },
    { id: 6, label: 'Running JavaScript analysis', icon: '⚡' },
    { id: 7, label: 'Calculating LLM presence scores', icon: '🧮' },
    { id: 8, label: 'Generating AI recommendations', icon: '💡' },
    { id: 9, label: 'Almost complete! Finalizing results', icon: '⏱️' },
    { id: 10, label: 'Analysis complete!', icon: '✅' },
  ]

  const isAlmostComplete = progress.step >= 9
  
  return (
    <div className="py-4">
      {/* Compact Progress Header */}
      <div className="flex items-center justify-between mb-3 px-3">
        <div className="flex items-center gap-2">
          <Loader className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-gray-700">
            {progress.message}
          </span>
        </div>
        <span className="text-sm font-bold text-blue-600 tabular-nums">
          {progress.percentage}%
        </span>
      </div>

      {/* Thin Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isAlmostComplete 
              ? 'bg-gradient-to-r from-blue-500 to-green-500' 
              : 'bg-blue-600'
          }`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Compact Scrollable Log */}
      <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs max-h-64 overflow-y-auto custom-scrollbar">
        <div className="space-y-0.5">
          {steps.map((step) => {
            const isCompleted = step.id < progress.step
            const isCurrent = step.id === progress.step
            const isPending = step.id > progress.step
            
            if (isPending) return null // Don't show pending steps
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 py-1 ${
                  isCurrent ? 'text-blue-400' : 'text-green-400'
                } transition-all`}
              >
                <span className="flex-shrink-0">
                  {isCompleted ? '✓' : isCurrent ? '⟳' : '○'}
                </span>
                <span className="flex-shrink-0">{step.icon}</span>
                <span className="flex-1 truncate">{step.label}</span>
                {isCurrent && (
                  <span className="flex-shrink-0 animate-pulse">●</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Almost Complete Alert */}
      {isAlmostComplete && progress.step < 10 && (
        <div className="mt-3 px-3 py-2 bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600 animate-pulse flex-shrink-0" />
            <p className="text-xs font-semibold text-yellow-900">
              Almost there! Results will appear shortly...
            </p>
          </div>
        </div>
      )}

      {/* Compact Footer */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Analysis continues in background if you close this.
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  )
}

// Content Analysis Section
function ContentAnalysisSection({ analysis, url, onGenerateInsights, onRegenerateInsights, isGeneratingInsights }) {
  console.log('[ContentAnalysisSection] Rendering with analysis:', analysis)
  
  if (!analysis) {
    return (
      <div className="text-gray-600 text-sm">
        No analysis data available
      </div>
    )
  }

  if (analysis.error) {
    // Parse error type for better user guidance
    const errorMessage = analysis.error || 'Unknown error occurred';
    const isHTTP2Error = errorMessage.includes('ERR_HTTP2_PROTOCOL_ERROR');
    const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('Timeout');
    const isNetworkError = errorMessage.includes('net::') || errorMessage.includes('ERR_');
    const isAccessDenied = errorMessage.includes('403') || errorMessage.includes('blocked');
    
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-900 font-bold text-base mb-2">
              Analysis Error
            </h4>
            <p className="text-red-700 text-sm mb-4 font-medium">
              {errorMessage}
            </p>
            
            {/* Troubleshooting section based on error type */}
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <p className="text-xs font-semibold text-red-900 mb-2 uppercase tracking-wide">
                💡 Troubleshooting Tips:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {isHTTP2Error && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><strong>HTTP/2 Protocol Error:</strong> The website may be blocking automated browser access or having connection issues.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><strong>Retry:</strong> Try analyzing this URL again in a few minutes - temporary network issues often resolve themselves.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><strong>Alternative:</strong> Check if the URL is accessible in your regular browser. Some sites block automated tools.</span>
                    </li>
                  </>
                )}
                {isTimeoutError && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><strong>Timeout:</strong> The page took too long to load. Try a different URL or retry later.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Large pages or slow servers can cause timeouts. Consider analyzing lighter pages first.</span>
                    </li>
                  </>
                )}
                {isAccessDenied && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><strong>Access Denied:</strong> The website is blocking our analysis tool.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Some sites have strict bot detection. Try analyzing publicly accessible pages.</span>
                    </li>
                  </>
                )}
                {isNetworkError && !isHTTP2Error && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><strong>Network Error:</strong> Connection issue while accessing the page.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Check your internet connection and verify the URL is accessible.</span>
                    </li>
                  </>
                )}
                {!isHTTP2Error && !isTimeoutError && !isAccessDenied && !isNetworkError && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Try analyzing this URL again - it may have been a temporary issue.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Verify the URL is correct and publicly accessible.</span>
                    </li>
                  </>
                )}
                <li className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-200">
                  <span className="text-blue-500 mt-0.5">ℹ️</span>
                  <span className="text-xs text-gray-600">If the problem persists, check the backend logs for more details or try a different URL.</span>
                </li>
              </ul>
            </div>
            
            {/* Action button to retry */}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh Page to Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* LLM Presence Scores */}
      {analysis.llmPresence && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            LLM Presence Scores
            <OverallLLMScoreTooltip scores={analysis.llmPresence} />
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricCard
              label="Freshness"
              value={analysis.llmPresence.freshness}
              details={analysis.details?.freshness}
            />
            <MetricCard
              label="Answerability"
              value={analysis.llmPresence.answerability}
              details={analysis.details?.answerability}
            />
            <MetricCard
              label="Query Alignment"
              value={analysis.llmPresence.queryAlignment}
              details={analysis.details?.queryAlignment}
            />
            <MetricCard
              label="Authority"
              value={analysis.llmPresence.authority}
              details={analysis.details?.authority}
            />
            <MetricCard
              label="Structure"
              value={analysis.llmPresence.structure}
              details={analysis.details?.structure}
            />
            <MetricCard
              label="Snippet Quality"
              value={analysis.llmPresence.snippetQuality}
              details={analysis.details?.snippetQuality}
            />
          </div>
        </div>
      )}

      {/* AI-Powered Recommendations */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          AI-Powered Recommendations
          <Tooltip content="Context-aware improvements generated by Azure OpenAI based on actual page content" />
        </h3>
        
        {analysis.recommendations && analysis.recommendations.length > 0 ? (
          <div className="space-y-4">
            <AIRecommendationsDisplay recommendations={analysis.recommendations} />
            
            {/* Regenerate Button */}
            <div className="flex justify-end">
              <button
                onClick={() => onRegenerateInsights(url)}
                disabled={isGeneratingInsights}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isGeneratingInsights ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Regenerating Insights...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Regenerate Insights
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                ✨ Generate AI-Powered Insights
              </h4>
              
              <p className="text-gray-700 mb-2 max-w-md mx-auto">
                Get 3-5 specific, actionable recommendations powered by Azure OpenAI
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                Analyzes your content, scores, and page type to suggest targeted improvements
              </p>
              
              {/* Prominent Generate Button */}
              <button
                onClick={() => onGenerateInsights(url)}
                disabled={isGeneratingInsights}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isGeneratingInsights ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate AI Insights Now
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                ⚡ Fast generation (~20-30 seconds) • No re-scraping required
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content Summary */}
      {analysis.prompts?.summary && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Content Summary</h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 leading-relaxed">{analysis.prompts.summary}</p>
          </div>
        </div>
      )}

      {/* Generated Prompts */}
      {analysis.prompts && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Generated User Prompts</h3>
          <div className="space-y-3">
            {analysis.prompts.awareness?.length > 0 && (
              <PromptSection
                title="Awareness (Discovery)"
                icon={<Lightbulb className="w-4 h-4" />}
                color="blue"
                questions={analysis.prompts.awareness}
              />
            )}
            {analysis.prompts.consideration?.length > 0 && (
              <PromptSection
                title="Consideration (Comparison)"
                icon={<Target className="w-4 h-4" />}
                color="green"
                questions={analysis.prompts.consideration}
              />
            )}
            {analysis.prompts.conversion?.length > 0 && (
              <PromptSection
                title="Conversion (Action)"
                icon={<Zap className="w-4 h-4" />}
                color="orange"
                questions={analysis.prompts.conversion}
              />
            )}

            {/* Fallback message if all prompt arrays are empty */}
            {(!analysis.prompts.awareness || analysis.prompts.awareness.length === 0) &&
             (!analysis.prompts.consideration || analysis.prompts.consideration.length === 0) &&
             (!analysis.prompts.conversion || analysis.prompts.conversion.length === 0) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      No User Prompts Generated
                    </h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      {analysis.prompts.summary?.includes('not available') || analysis.prompts.summary?.includes('no Azure OpenAI key') ? (
                        <>
                          <p className="font-medium text-gray-700">⚙️ Azure OpenAI is not configured</p>
                          <p>
                            Prompt generation requires Azure OpenAI API access. 
                            Configure <code className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">AZURE_OPENAI_KEY</code> in your backend <code className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">.env</code> file to enable this feature.
                          </p>
                        </>
                      ) : analysis.prompts.summary?.includes('Error') ? (
                        <>
                          <p className="font-medium text-gray-700">⚠️ API Error</p>
                          <p>
                            There was an error generating prompts. Check the backend logs for details.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-gray-700">📄 Content doesn't match user intent patterns</p>
                          <p>
                            This page doesn't contain content that answers typical user questions in these categories:
                          </p>
                          <ul className="list-disc list-inside mt-2 ml-2 space-y-1 text-xs">
                            <li><strong>Awareness:</strong> "What are...?" "How does X work?"</li>
                            <li><strong>Consideration:</strong> "How do A and B compare?" "What are the pros/cons?"</li>
                            <li><strong>Conversion:</strong> "How much does X cost?" "How do I buy/implement X?"</li>
                          </ul>
                          <p className="mt-2">
                            <strong>Common for:</strong> Catalog landing pages, contact forms, about pages, login pages, or pages with minimal text content (&lt;100 words).
                          </p>
                          <p className="mt-2 text-gray-500">
                            💡 <strong>Tip:</strong> Try analyzing product pages, tutorials, blog posts, or FAQ pages for better results.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// AI Recommendations Display Component
// Expected format from backend:
// [
//   {
//     title: "Enhance Answerability with Clear Question Headings",
//     description: "Currently, there are questions on the page, but no question headings.",
//     actions: [
//       "Add H2: 'How Do I Choose the Right Sectional Cover?'",
//       "Add H2: 'What Are the Benefits of Modular Couch Covers?'"
//     ],
//     priority: "high" | "medium" | "low" (optional)
//   }
// ]
function AIRecommendationsDisplay({ recommendations }) {
  // Priority indicators
  const priorityConfig = {
    high: { icon: '🔴', color: 'border-red-300 bg-red-50', label: 'High Priority' },
    medium: { icon: '🟡', color: 'border-yellow-300 bg-yellow-50', label: 'Medium Priority' },
    low: { icon: '🟢', color: 'border-green-300 bg-green-50', label: 'Low Priority' }
  }

  // Ensure recommendations is an array
  const recs = Array.isArray(recommendations) ? recommendations : [recommendations]

  return (
    <div className="space-y-3">
      {recs.map((rec, idx) => {
        // Handle both structured objects and plain strings
        const isObject = typeof rec === 'object' && rec !== null
        const title = isObject ? rec.title : `Recommendation ${idx + 1}`
        const description = isObject ? rec.description : rec
        const actions = isObject && Array.isArray(rec.actions) ? rec.actions : []
        const priority = isObject ? rec.priority : undefined
        const priorityInfo = priority ? priorityConfig[priority] : null

        return (
          <div 
            key={idx} 
            className={`bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
              priorityInfo ? `border-l-4 ${priorityInfo.color}` : 'border-gray-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-sm flex items-center justify-center font-bold shadow">
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Title with optional priority */}
                  <div className="flex items-center gap-2 mb-2">
                    {priorityInfo && (
                      <span className="text-xl flex-shrink-0" title={priorityInfo.label}>
                        {priorityInfo.icon}
                      </span>
                    )}
                    <h4 className="font-bold text-gray-900 text-base">
                      {title}
                    </h4>
                  </div>

                  {/* Description */}
                  {description && (
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {typeof description === 'string' ? description : JSON.stringify(description)}
                    </p>
                  )}

                  {/* Action Items */}
                  {actions.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Action Items:
                      </p>
                      <ul className="space-y-2">
                        {actions.map((action, aidx) => (
                          <li key={aidx} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5 flex-shrink-0">▪</span>
                            <span className="text-gray-700 leading-relaxed text-sm">
                              {action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Metric Card with Enhanced Tooltip
function MetricCard({ label, value, tooltip, details }) {
  const percentage = (value * 100).toFixed(0)
  const colorClass = value >= 0.8 ? 'bg-green-50 border-green-200 text-green-600' :
                     value >= 0.6 ? 'bg-yellow-50 border-yellow-200 text-yellow-600' :
                     'bg-red-50 border-red-200 text-red-600'

  return (
    <div className={`${colorClass} rounded-lg p-3 border`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{label}</span>
        <LLMScoreTooltip metric={label} value={value} details={details} />
      </div>
      <div className="text-2xl font-bold">{percentage}%</div>
    </div>
  )
}

// Prompt Section
function PromptSection({ title, icon, color, questions }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800'
  }

  return (
    <div className={`${colors[color]} border rounded-lg p-3`}>
      <div className="flex items-center mb-2">
        <div className="mr-2">{icon}</div>
        <h4 className="font-bold text-sm">{title}</h4>
      </div>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={i} className="bg-white rounded p-2 text-sm">
            <p className="font-medium text-gray-900">"{q.question}"</p>
            {q.support && (
              <p className="text-xs text-gray-600 italic mt-1">Based on: {q.support}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AIVisibility

