import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import CitationPerformance from './pages/CitationPerformance'
import TrendsInsights from './pages/TrendsInsights'
import AIVisibility from './pages/AIVisibility'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ai-visibility" element={<AIVisibility />} />
              <Route path="/citation-performance" element={<CitationPerformance />} />
              <Route path="/trends-insights" element={<TrendsInsights />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App

