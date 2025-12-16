import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  FileSearch, TrendingUp, Target, Upload, Sparkles, Zap, 
  BarChart3, CheckCircle, AlertCircle, ArrowRight, Clock, 
  Activity, TrendingUp as TrendingUpIcon, Award, Lightbulb,
  Eye, Globe
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'

function Home() {
  const { 
    uploadedUrls, 
    allUrls, 
    hasAnalysisResults, 
    hasActiveProject,
    activeProject,
    citationData 
  } = useAppContext()

  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Calculate stats from actual data
  const totalUrls = allUrls.length
  const activeProjects = hasActiveProject ? 1 : 0
  
  // Calculate average citation rate if data exists
  const avgCitationRate = citationData?.citationRates 
    ? citationData.citationRates
        .filter(r => r.type === 'summary' || !r.type)
        .reduce((sum, r) => sum + (r.selectedUrlRate || 0), 0) / 
        citationData.citationRates.filter(r => r.type === 'summary' || !r.type).length
    : 0

  const hasData = totalUrls > 0 || hasAnalysisResults || hasActiveProject

  const features = [
    {
      title: 'AI Visibility Analysis',
      description: 'Unified analysis combining URLs, citation performance, and LLM presence scores. Get AI-powered recommendations.',
      icon: Zap,
      link: '/ai-visibility',
      color: 'from-purple-500 to-indigo-600',
      status: hasActiveProject ? 'active' : 'ready',
      badge: activeProjects > 0 ? `${activeProjects} active` : null
    },
    {
      title: 'Citation Performance',
      description: 'Track AI platform citations with week-by-week trends, platform analysis, and actionable insights.',
      icon: TrendingUp,
      link: '/citation-performance',
      color: 'from-green-500 to-emerald-600',
      status: citationData ? 'active' : 'ready',
      badge: citationData ? `${(avgCitationRate * 100).toFixed(1)}% avg` : null
    },
    {
      title: 'Trends & Insights',
      description: 'Discover content opportunities, analyze prompt patterns, and get AI-powered recommendations.',
      icon: Target,
      link: '/trends-insights',
      color: 'from-purple-500 to-indigo-600',
      status: 'ready',
      badge: null
    }
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section with Dynamic Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-8 shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-100 text-lg mb-2">{greeting}! 👋</p>
              <h1 className="text-4xl font-bold text-white mb-2">AI Visibility Dashboard</h1>
              <p className="text-xl text-primary-100 max-w-2xl">
                {hasData 
                  ? `Tracking ${totalUrls} URLs across AI platforms. ${hasAnalysisResults ? 'Analysis ready!' : 'Keep optimizing!'}`
                  : 'Your command center for AI platform visibility and citation tracking.'
                }
              </p>
            </div>
            
            {hasData && (
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Activity className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Active</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Link 
              to="/ai-visibility" 
              className="px-6 py-3 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {hasActiveProject ? 'Continue Analysis' : 'Start New Project'}
            </Link>
            <Link 
              to="/citation-performance" 
              className="px-6 py-3 bg-primary-500/80 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-primary-400 transition-all inline-flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Citation Performance
            </Link>
          </div>
        </div>
      </div>

      {/* Real-Time Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          value={activeProjects}
          label="Active Projects"
          color="text-green-600"
          bgColor="bg-green-50"
          trend={activeProjects > 0 ? '+1' : null}
        />
        <StatCard
          icon={Globe}
          value={totalUrls}
          label="URLs Tracked"
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend={totalUrls > 0 ? `${totalUrls} total` : null}
        />
        <StatCard
          icon={TrendingUpIcon}
          value={`${(avgCitationRate * 100).toFixed(1)}%`}
          label="Avg Citation Rate"
          color="text-purple-600"
          bgColor="bg-purple-50"
          trend={avgCitationRate > 0.05 ? 'Good' : avgCitationRate > 0 ? 'Fair' : null}
        />
        <StatCard
          icon={Eye}
          value={hasAnalysisResults ? '✓' : '—'}
          label="Analysis Status"
          color="text-orange-600"
          bgColor="bg-orange-50"
          trend={hasAnalysisResults ? 'Ready' : 'Pending'}
        />
      </div>

      {/* Feature Cards with Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Toolbox</h2>
          <div className="text-sm text-gray-500">Choose where to start</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link 
                key={feature.title} 
                to={feature.link}
                className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Status Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {feature.badge}
                  </div>
                )}
                
                {/* Icon with Gradient */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                {/* Status Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${feature.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-600 capitalize">{feature.status}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Conditional Content Based on Data */}
      {hasData ? (
        <RecentActivity 
          activeProject={activeProject}
          citationData={citationData}
          totalUrls={totalUrls}
          hasAnalysisResults={hasAnalysisResults}
        />
      ) : (
        <GettingStarted />
      )}

      {/* Quick Tips */}
      <QuickTips hasData={hasData} />
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, value, label, color, bgColor, trend }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

// Recent Activity Component
function RecentActivity({ activeProject, citationData, totalUrls, hasAnalysisResults }) {
  const activities = []
  
  if (activeProject) {
    activities.push({
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      title: 'Project Created',
      description: `Tracking ${totalUrls} URLs for ${activeProject.domain || 'your domain'}`,
      time: activeProject.createdAt ? new Date(activeProject.createdAt).toLocaleDateString() : 'Recently'
    })
  }
  
  if (citationData) {
    activities.push({
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      title: 'Citation Data Loaded',
      description: `${citationData.citationRates?.length || 0} data points across platforms`,
      time: 'Recently'
    })
  }
  
  if (hasAnalysisResults) {
    activities.push({
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      title: 'Analysis Complete',
      description: 'LLM presence scores and AI recommendations ready',
      time: 'Recently'
    })
  }

  if (activities.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities.map((activity, idx) => {
          const Icon = activity.icon
          return (
            <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`${activity.bgColor} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Getting Started Component
function GettingStarted() {
  const steps = [
    {
      number: 1,
      title: 'Create Project',
      description: 'Go to AI Visibility Analysis and upload URLs or parse sitemaps',
      icon: Upload,
      link: '/ai-visibility'
    },
    {
      number: 2,
      title: 'Upload Citation Data',
      description: 'Add brand presence data from AI platforms',
      icon: TrendingUp,
      link: '/ai-visibility'
    },
    {
      number: 3,
      title: 'View Insights',
      description: 'Get AI-powered recommendations and track performance',
      icon: Sparkles,
      link: '/citation-performance'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Get Started in 3 Steps</h3>
          <p className="text-gray-600">Set up your first project and start tracking</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Link
              key={step.number}
              to={step.link}
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <Icon className="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
              <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
                Start now
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Quick Tips Component
function QuickTips({ hasData }) {
  const tips = hasData ? [
    {
      icon: Award,
      title: 'Track Weekly Trends',
      description: 'Check Citation Performance weekly to spot patterns and improvements'
    },
    {
      icon: Lightbulb,
      title: 'Use AI Recommendations',
      description: 'Expand "Trends & Insights" sections for personalized optimization tips'
    },
    {
      icon: BarChart3,
      title: 'Compare Platforms',
      description: 'See which AI platforms cite you most frequently and optimize accordingly'
    }
  ] : [
    {
      icon: Upload,
      title: 'Start with URLs',
      description: 'Upload a CSV/Excel file or paste sitemap URLs to begin tracking'
    },
    {
      icon: Sparkles,
      title: 'Get AI Insights',
      description: 'Our AI analyzes your content and provides specific optimization tips'
    },
    {
      icon: TrendingUp,
      title: 'Track Citations',
      description: 'Upload brand presence data to see how AI platforms cite your content'
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Pro Tips</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, idx) => {
          const Icon = tip.icon
          return (
            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="bg-primary-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{tip.title}</p>
                <p className="text-xs text-gray-600">{tip.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Home

