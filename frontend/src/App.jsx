import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import CitationPerformance from './pages/CitationPerformance'
import TrendsInsights from './pages/TrendsInsights'
import Projects from './pages/Projects'
import AIVisibility from './pages/AIVisibility'

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-visibility" element={<AIVisibility />} />
            <Route path="/citation-performance" element={<CitationPerformance />} />
            <Route path="/trends-insights" element={<TrendsInsights />} />
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  )
}

export default App

