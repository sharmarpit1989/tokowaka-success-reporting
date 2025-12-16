# ⚡ QA Quick Action Checklist
## Immediate Actions for AI Visibility Dashboard

**Status:** 🔴 High Priority - Act Within 48 Hours

---

## 🚨 DO THIS FIRST (Today)

### Critical Security Actions

- [ ] **Change all default API keys** if any exist in codebase
  - Search for: `your-api-key-here`, `your-key`, `test-key`
  - Action: Rotate immediately if found in committed code

- [ ] **Check Git history for secrets**
  ```bash
  git log -p | grep -i "api.key\|password\|secret"
  ```
  - If found: Rotate keys, use git-filter-branch to remove

- [ ] **Add .env to .gitignore** (verify it's there)
  ```bash
  echo ".env" >> .gitignore
  git rm --cached backend/.env  # if accidentally committed
  ```

- [ ] **Review current access logs**
  - Location: `logs/combined.log`
  - Look for: Unusual IPs, high error rates, suspicious patterns

---

## ⚡ THIS WEEK (Days 1-5)

### Day 1: Quick Wins

- [ ] **Set up automated backups** (30 minutes)
  ```bash
  # Windows Task Scheduler or cron job
  robocopy C:\AIVisibilityDashboard\data C:\Backups\ai-dashboard-data /MIR /LOG:backup.log
  ```

- [ ] **Add health check monitoring** (15 minutes)
  - Use: UptimeRobot (free tier) or Pingdom
  - Monitor: `http://localhost:3000/api/health`
  - Alert: Email on 3 consecutive failures

- [ ] **Document current users** (10 minutes)
  - Who has access?
  - What data have they uploaded?
  - Contact info for incident response?

### Day 2: Basic Protection

- [ ] **Add simple API key authentication** (2-3 hours)
  ```javascript
  // Temporary middleware until OAuth implemented
  const simpleAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.TEMP_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
  
  app.use('/api/', simpleAuth);
  ```

- [ ] **Add request logging** (30 minutes)
  ```javascript
  // Log all requests with IP
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { 
      ip: req.ip, 
      userAgent: req.headers['user-agent'] 
    });
    next();
  });
  ```

### Day 3: Input Validation

- [ ] **Sanitize file uploads** (1 hour)
  ```javascript
  const sanitizeFilename = (filename) => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 255);
  };
  ```

- [ ] **Add domain validation** (30 minutes)
  ```javascript
  const isValidDomain = (domain) => {
    const regex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return regex.test(domain);
  };
  ```

### Day 4: Testing Setup

- [ ] **Install testing framework** (1 hour)
  ```bash
  cd backend
  npm install --save-dev jest supertest @jest/globals
  npm install --save-dev @types/jest
  ```

- [ ] **Write 3 critical tests** (2 hours)
  1. Health check returns 200
  2. File upload rejects invalid files
  3. URL parsing extracts correctly

  ```javascript
  // backend/routes/unified.test.js
  const request = require('supertest');
  const app = require('../server');
  
  describe('Unified API', () => {
    test('POST /api/unified/create-from-file rejects without file', async () => {
      const response = await request(app)
        .post('/api/unified/create-from-file')
        .field('domain', 'example.com')
        .expect(400);
      
      expect(response.body.error).toMatch(/file/i);
    });
  });
  ```

### Day 5: Monitoring

- [ ] **Set up basic Prometheus metrics** (2 hours)
  ```bash
  npm install prom-client
  ```
  
  ```javascript
  const promClient = require('prom-client');
  const register = new promClient.Registry();
  
  const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  });
  register.registerMetric(httpRequestDuration);
  
  app.get('/metrics', (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
  });
  ```

---

## 📅 THIS MONTH (Weeks 1-4)

### Week 1: Security Hardening

- [ ] **Implement rate limiting per IP** (2 hours)
- [ ] **Add CORS whitelist validation** (1 hour)
- [ ] **Encrypt sensitive data in logs** (2 hours)
- [ ] **Add helmet security headers** (already done ✅, verify config)

### Week 2: Database Migration Prep

- [ ] **Design PostgreSQL schema** (4 hours)
  - Tables: projects, jobs, analysis_results, citations
  - Indexes: project_id, job_id, url (hashed)
  - Relationships: foreign keys

- [ ] **Set up local PostgreSQL** (2 hours)
  ```bash
  docker run --name ai-dashboard-db -e POSTGRES_PASSWORD=changeme -p 5432:5432 -d postgres:15
  ```

- [ ] **Create migration scripts** (4 hours)
  - Export JSON to SQL
  - Validate data integrity
  - Rollback plan

### Week 3: Testing Coverage

- [ ] **Achieve 30% test coverage** (16 hours)
  - Focus: Critical paths (file upload → analysis → results)
  - Tools: Jest for unit, Supertest for integration

- [ ] **Add E2E smoke test** (4 hours)
  ```javascript
  // test/e2e/smoke.test.js
  test('Complete workflow: upload → analyze → view results', async () => {
    // 1. Upload file
    const upload = await uploadFile('test-urls.csv', 'example.com');
    expect(upload.projectId).toBeDefined();
    
    // 2. Run analysis
    const analysis = await runAnalysis(upload.projectId);
    expect(analysis.jobId).toBeDefined();
    
    // 3. Wait for completion
    await waitForJob(analysis.jobId, 60000);
    
    // 4. Check results
    const results = await getResults(upload.projectId);
    expect(results.urls).toHaveLength(upload.urlCount);
  });
  ```

### Week 4: Monitoring & Alerting

- [ ] **Set up Grafana dashboards** (4 hours)
  - Request rates by endpoint
  - Error rates by type
  - Browser pool utilization
  - Cache hit rates

- [ ] **Configure alerts** (2 hours)
  - Error rate >5% for 5 minutes
  - Response time >5s for 2 minutes
  - Browser pool exhausted
  - Disk space <10%

---

## 🔥 STOP DOING (Immediately)

### ❌ Bad Practices to Eliminate

- [ ] **STOP committing secrets** to Git
  - Use environment variables only
  - Never hardcode API keys

- [ ] **STOP using console.log** for logging
  - Migrate to Winston logger
  - Replace: `console.log('[Unified API]', ...)` → `logger.info('Unified API', ...)`

- [ ] **STOP ignoring errors silently**
  ```javascript
  // BAD
  try {
    citationData = await fs.readJson(citationPath);
  } catch {
    citationData = null;  // Silent failure!
  }
  
  // GOOD
  try {
    citationData = await fs.readJson(citationPath);
  } catch (error) {
    logger.error('Failed to read citation data', { path: citationPath, error });
    // Notify user or set error flag
    return res.status(500).json({ 
      error: 'Citation data corrupted', 
      partialResults: true 
    });
  }
  ```

- [ ] **STOP deploying without testing**
  - Minimum: Run `npm test` before deploy
  - Better: CI/CD pipeline with automated tests

---

## 🎯 Success Metrics (30 Days)

After 30 days, you should have:

- [x] ✅ **Zero secrets in Git history**
- [x] ✅ **Automated daily backups** running
- [x] ✅ **Basic authentication** protecting APIs
- [x] ✅ **30%+ test coverage** on critical paths
- [x] ✅ **Health monitoring** with alerts
- [x] ✅ **PostgreSQL migration** complete or in progress
- [x] ✅ **Security scan** passed (npm audit fix)
- [x] ✅ **Incident response plan** documented

---

## 📊 Track Your Progress

### Week 1 Scorecard
- [ ] Security quick wins (5/5 completed)
- [ ] Backup system running
- [ ] Tests installed & 3 tests passing
- [ ] Monitoring set up

### Week 2 Scorecard
- [ ] Database design approved
- [ ] Migration scripts ready
- [ ] Test coverage >10%

### Week 3 Scorecard
- [ ] Test coverage >30%
- [ ] E2E test passing
- [ ] CI/CD pipeline started

### Week 4 Scorecard
- [ ] Grafana dashboards live
- [ ] Alerts configured
- [ ] Incident response plan documented

---

## 🆘 When to Ask for Help

### Get External Help If:

1. **Security concerns:** You're not confident in auth implementation
   - **Action:** Hire security consultant for 1-week review (~$5K-10K)

2. **Database migration:** Team lacks PostgreSQL experience
   - **Action:** Hire database expert for 2-week engagement (~$8K-15K)

3. **Testing expertise:** Team struggles with test writing
   - **Action:** Hire QA engineer for 1 month (~$15K-20K)

4. **Timeline pressure:** Management needs faster results
   - **Action:** Augment team with 1-2 contractors

---

## 📞 Emergency Contacts

### If Something Goes Wrong:

**Data Loss:**
1. Stop all services immediately
2. Preserve current state (copy `data/` folder)
3. Review backup logs
4. Contact: [DevOps Lead]

**Security Breach:**
1. Disable external access (firewall/nginx)
2. Review access logs: `logs/combined.log`
3. Rotate all API keys
4. Contact: [Security Team]

**System Down:**
1. Check health endpoint: `/api/health`
2. Review error logs: `logs/error.log`
3. Restart services: `RESTART_SERVERS.bat`
4. Contact: [On-Call Engineer]

---

## 🎓 Learning Resources

### For the Team:

**Testing:**
- Jest Docs: https://jestjs.io/
- Testing Best Practices: https://testingjavascript.com/

**Security:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Checklist: https://blog.risingstack.com/node-js-security-checklist/

**PostgreSQL:**
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
- Prisma ORM (recommended): https://www.prisma.io/

**Monitoring:**
- Prometheus Guide: https://prometheus.io/docs/introduction/overview/
- Grafana Tutorials: https://grafana.com/tutorials/

---

## ✅ Daily Standup Questions

Ask these every day for next 30 days:

1. **What security risks did we reduce yesterday?**
2. **How many tests did we add?**
3. **Are backups still running?**
4. **Any new errors in logs?**
5. **Is someone working on database migration?**

---

**Remember:** Quality is not a feature request, it's a requirement. Every hour spent on quality now saves 4 hours of firefighting later.

---

**Created:** December 8, 2025  
**Owner:** Engineering Lead  
**Review Frequency:** Weekly for first month, then monthly

