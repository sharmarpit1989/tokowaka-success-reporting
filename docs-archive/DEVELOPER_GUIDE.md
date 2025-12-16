# Developer Guide - AI Visibility Dashboard

## Architecture Overview

This is a full-stack JavaScript application with:
- **Backend**: Node.js + Express + Puppeteer
- **Frontend**: React + Vite + Tailwind CSS
- **Data Storage**: JSON files (no database yet)
- **External Tools**: Bundled LLM presence tracker + reporting automation

## Tech Stack

### Backend
- **Node.js 18+** - Runtime
- **Express** - Web framework
- **Puppeteer** - Headless Chrome for content analysis
- **Winston** - Structured logging
- **Helmet** - Security headers
- **node-cache** - In-memory caching
- **Cheerio** - HTML parsing
- **xlsx** - Excel file processing
- **Multer** - File upload handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (fast!)
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons

---

## Project Structure

```
AIVisibilityDashboard/
├── backend/
│   ├── server.js                 # Express server entry point
│   ├── routes/                   # API route handlers
│   │   ├── analysis.js           # Content analysis endpoints
│   │   ├── citations.js          # Citation tracking endpoints
│   │   ├── projects.js           # Project management
│   │   ├── spacecat.js           # Spacecat API integration
│   │   └── unified.js            # Unified dashboard
│   ├── services/                 # Business logic layer
│   │   ├── contentAnalyzer.js    # Puppeteer wrapper
│   │   ├── citationProcessor.js  # Citation calculations
│   │   ├── fileParser.js         # CSV/Excel parsing
│   │   ├── hybridContentAnalyzer.js  # Main analyzer
│   │   └── unifiedAnalyzer.js    # Combined analysis
│   ├── utils/                    # Utility modules
│   │   ├── browserPool.js        # Puppeteer browser pooling
│   │   ├── cache.js              # Caching utilities
│   │   ├── config.js             # Configuration management
│   │   ├── errors.js             # Custom error classes
│   │   ├── logger.js             # Winston logging
│   │   └── validation.js         # Input validation
│   ├── config/                   # Configuration files
│   │   └── env.example.txt       # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Root component
│   │   ├── main.jsx              # Entry point
│   │   ├── components/           # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── URLUpload.jsx
│   │   │   ├── AnalysisResults.jsx
│   │   │   └── Charts/
│   │   ├── pages/                # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── ContentAnalysis.jsx
│   │   │   ├── CitationPerformance.jsx
│   │   │   ├── Opportunities.jsx
│   │   │   ├── UnifiedDashboard.jsx
│   │   │   └── Projects.jsx
│   │   ├── services/             # API client layer
│   │   │   ├── api.js            # Base axios instance
│   │   │   ├── analysisService.js
│   │   │   ├── citationService.js
│   │   │   ├── projectService.js
│   │   │   └── unifiedService.js
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useApi.js
│   │   │   ├── useFileUpload.js
│   │   │   ├── usePolling.js
│   │   │   └── useDebounce.js
│   │   ├── contexts/             # React contexts
│   │   ├── utils/                # Frontend utilities
│   │   └── styles/               # Global styles
│   ├── public/                   # Static assets
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind configuration
│   └── package.json
│
├── data/                         # Runtime data storage
│   ├── projects/                 # Saved projects (JSON)
│   ├── results/                  # Analysis results (JSON)
│   └── uploads/                  # Temporary file uploads
│
├── logs/                         # Application logs
│   ├── combined.log              # All logs
│   └── error.log                 # Errors only
│
└── docs-archive/                 # Detailed documentation archive
    └── [40+ detailed guides]
```

---

## Key Patterns & Conventions

### Backend Patterns

#### 1. Service Layer Pattern

All business logic lives in `services/`, not in routes.

**Good:**
```javascript
// routes/analysis.js
router.post('/run', async (req, res, next) => {
  try {
    const results = await contentAnalyzer.analyze(req.body.urls);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

// services/contentAnalyzer.js
async function analyze(urls) {
  // Business logic here
  const browser = await browserPool.acquire();
  // ... do analysis
  await browserPool.release(browser);
  return results;
}
```

#### 2. Logging Pattern

Use service-specific loggers, not `console.log`.

**Good:**
```javascript
const { createServiceLogger } = require('./utils/logger');
const logger = createServiceLogger('content-analyzer');

logger.info('Starting analysis', { urlCount: urls.length });
logger.error('Analysis failed', { error: error.message, url });
```

#### 3. Error Handling Pattern

Use custom error classes for different error types.

```javascript
const { ValidationError, NotFoundError } = require('./utils/errors');

// Throw specific errors
if (!projectId) {
  throw new ValidationError('Project ID is required');
}

if (!project) {
  throw new NotFoundError(`Project ${projectId} not found`);
}

// Global error handler catches them
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  // ... handle other error types
});
```

#### 4. Browser Pooling Pattern

Always use the browser pool, never create browsers directly.

**Good:**
```javascript
const browser = await browserPool.acquire();
try {
  const page = await browser.newPage();
  // ... use page
  await page.close();
} finally {
  await browserPool.release(browser);
}
```

**Bad:**
```javascript
const browser = await puppeteer.launch(); // DON'T DO THIS
```

### Frontend Patterns

#### 1. Custom Hooks Pattern

Extract reusable logic into custom hooks.

**Good:**
```javascript
// hooks/useApi.js
export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    setLoading(true);
    try {
      const result = await apiFunction(...args);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// Usage in component
const { data, loading, execute } = useApi(analysisService.runAnalysis);
```

#### 2. Service Layer Pattern

API calls go through service layer, not direct axios calls in components.

**Good:**
```javascript
// services/analysisService.js
import api from './api';

export const runAnalysis = async (urls) => {
  const response = await api.post('/analysis/run', { urls });
  return response.data;
};

// In component
import { runAnalysis } from '@/services/analysisService';
const result = await runAnalysis(urls);
```

**Bad:**
```javascript
// In component
import axios from 'axios';
const result = await axios.post('/api/analysis/run', { urls });
```

#### 3. Component Composition

Break large components into smaller, reusable pieces.

```jsx
// ContentAnalysis.jsx
export function ContentAnalysis() {
  return (
    <Layout>
      <URLUpload onUpload={handleUpload} />
      <FilterPanel filters={filters} onChange={handleFilterChange} />
      <AnalysisResults data={results} loading={loading} />
    </Layout>
  );
}
```

---

## API Endpoints Reference

### Health & Monitoring

```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T...",
  "uptime": 3600,
  "browserPool": {
    "available": 2,
    "inUse": 0,
    "total": 2
  },
  "cache": {
    "api": { "hits": 45, "misses": 12 },
    "analysis": { "hits": 8, "misses": 3 }
  },
  "integrations": {
    "spacecat": true,
    "azureOpenAI": true
  }
}
```

### Content Analysis

```http
POST /api/analysis/run
Content-Type: application/json

{
  "urls": ["https://example.com"],
  "options": {
    "timeout": 30000,
    "waitForJS": true
  }
}
```

```http
GET /api/analysis/status/:jobId
```

```http
GET /api/analysis/results/:jobId
```

### Citations

```http
POST /api/citations/upload
Content-Type: multipart/form-data

files: [Excel files]
```

```http
GET /api/citations/rates?platform=chatgpt&week=2024-W01
```

### Projects

```http
POST /api/projects
Content-Type: application/json

{
  "name": "Q1 Campaign",
  "domain": "example.com",
  "urls": [...]
}
```

```http
GET /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
```

### Unified Dashboard

```http
POST /api/unified/create-from-file
Content-Type: multipart/form-data

file: CSV/Excel
domain: example.com
```

```http
GET /api/unified/:projectId/dashboard
```

---

## Configuration

### Environment Variables

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Azure OpenAI (for AI recommendations)
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4

# Spacecat API (optional)
SPACECAT_API_BASE_URL=https://spacecat.experiencecloud.live/api/v1
SPACECAT_API_KEY=your-key

# Performance
PUPPETEER_POOL_SIZE=2
PUPPETEER_CONCURRENCY=3
CACHE_TTL=300
LOG_LEVEL=info

# Security
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
ALLOWED_ORIGINS=http://localhost:5173

# Data Storage
DATA_DIR=../data
```

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for all options.

---

## Development Workflow

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev    # Starts with nodemon (auto-reload)

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev    # Starts Vite dev server
```

### Making Changes

1. **Backend changes**: nodemon auto-restarts server
2. **Frontend changes**: Vite hot-reloads (preserves state)
3. **Config changes**: Requires manual restart

### Debugging

**Backend:**
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Check logs
tail -f logs/combined.log

# VS Code debugging
# Use "Attach to Backend" launch configuration
```

**Frontend:**
```javascript
// React DevTools in browser
// Console logs visible in browser console
console.log('Debug:', data);
```

### Testing

```bash
# Backend tests (when added)
cd backend
npm test

# Frontend tests (when added)
cd frontend
npm test
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route handler** in `backend/routes/`:

```javascript
// routes/myFeature.js
const express = require('express');
const router = express.Router();
const myService = require('../services/myService');

router.post('/action', async (req, res, next) => {
  try {
    const result = await myService.doSomething(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

2. **Create service** in `backend/services/`:

```javascript
// services/myService.js
const { createServiceLogger } = require('../utils/logger');
const logger = createServiceLogger('my-service');

async function doSomething(data) {
  logger.info('Doing something', { data });
  // Business logic here
  return result;
}

module.exports = { doSomething };
```

3. **Register route** in `backend/server.js`:

```javascript
const myFeatureRoutes = require('./routes/myFeature');
app.use('/api/my-feature', myFeatureRoutes);
```

4. **Create frontend service** in `frontend/src/services/`:

```javascript
// services/myFeatureService.js
import api from './api';

export const doSomething = async (data) => {
  const response = await api.post('/my-feature/action', data);
  return response.data;
};
```

### Adding a New Page

1. **Create page component** in `frontend/src/pages/`:

```jsx
// pages/MyPage.jsx
export function MyPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Page</h1>
      {/* Content here */}
    </div>
  );
}
```

2. **Add route** in `frontend/src/App.jsx`:

```jsx
import { MyPage } from './pages/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

3. **Add navigation** in `frontend/src/components/Layout.jsx`:

```jsx
<Link to="/my-page">My Page</Link>
```

### Adding Browser-Based Analysis

Use the browser pool:

```javascript
const browserPool = require('../utils/browserPool');

async function analyzeWithBrowser(url) {
  const browser = await browserPool.acquire();
  
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const content = await page.evaluate(() => document.body.innerText);
    
    await page.close();
    return content;
    
  } finally {
    await browserPool.release(browser);
  }
}
```

---

## Performance Optimization

### Backend Optimizations

1. **Use browser pooling** (already implemented)
2. **Cache expensive operations**:

```javascript
const cache = require('../utils/cache');

async function expensiveOperation(key) {
  const cached = cache.get('api', key);
  if (cached) return cached;
  
  const result = await doExpensiveThing();
  cache.set('api', key, result, 300); // 5 min TTL
  return result;
}
```

3. **Use compression** (already enabled)
4. **Batch database/API operations**

### Frontend Optimizations

1. **Code splitting** (already configured in Vite)
2. **Lazy load pages**:

```jsx
import { lazy, Suspense } from 'react';

const HeavyPage = lazy(() => import('./pages/HeavyPage'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyPage />
</Suspense>
```

3. **Debounce user input**:

```javascript
import { useDebounce } from '@/hooks/useDebounce';

const debouncedSearch = useDebounce(searchTerm, 300);
```

4. **Memoize expensive components**:

```jsx
import { memo } from 'react';

export const ExpensiveComponent = memo(({ data }) => {
  // Component logic
});
```

---

## Security Best Practices

### Input Validation

Always validate and sanitize user input:

```javascript
const { validateUrl, sanitizeInput } = require('../utils/validation');

router.post('/analyze', (req, res) => {
  const { url } = req.body;
  
  if (!validateUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  const sanitized = sanitizeInput(url);
  // Use sanitized value
});
```

### Rate Limiting

Already configured, but adjust if needed:

```javascript
// server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

### CORS

Configure allowed origins for production:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Deployment

### Building for Production

```bash
# Build frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend serves built frontend automatically
cd backend
NODE_ENV=production npm start
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production origins in CORS
3. Set secure API keys
4. Enable rate limiting
5. Configure logging level

### Deployment Checklist

- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Frontend built
- [ ] Logs directory writable
- [ ] Data directory writable
- [ ] Ports configured (default 3000, 5173)
- [ ] CORS origins set for production
- [ ] Rate limiting enabled
- [ ] SSL/HTTPS configured
- [ ] Monitoring enabled

---

## Troubleshooting

### Common Issues

**"Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Browser pool exhausted"**
```env
PUPPETEER_POOL_SIZE=4  # Increase pool size
```

**"Memory issues"**
```env
PUPPETEER_POOL_SIZE=1  # Reduce pool
PUPPETEER_CONCURRENCY=1  # Reduce concurrency
```

**"CORS errors"**
```env
ALLOWED_ORIGINS=http://localhost:5173  # Check origins
```

---

## Code Style

### JavaScript/Node.js

- Use `async/await` over callbacks
- Use `const` by default, `let` when needed
- Prefer arrow functions
- Use template literals for strings
- 2-space indentation

### React/JSX

- Functional components only (no classes)
- Use hooks for state and effects
- PropTypes or TypeScript for type checking
- Descriptive component names (PascalCase)
- Extract reusable logic into hooks

---

## Resources

- **Detailed topics**: [docs-archive/](docs-archive/)
- **Performance guide**: [docs-archive/OPTIMIZATION_SUMMARY.md](docs-archive/OPTIMIZATION_SUMMARY.md)
- **Browser pool**: [docs-archive/BROWSER_POOL_GUIDE.md](docs-archive/BROWSER_POOL_GUIDE.md)
- **Data persistence**: [docs-archive/DATA_PERSISTENCE_GUIDE.md](docs-archive/DATA_PERSISTENCE_GUIDE.md)

---

**Happy coding! 🚀**

