# AI Visibility Dashboard

> **Unified platform for analyzing content optimization and tracking AI platform citations**

## What This Tool Does

Combines two powerful capabilities:
1. **Content Analysis** - See how much content AI agents can discover (with/without JavaScript)
2. **Citation Tracking** - Monitor how often AI platforms cite your URLs

## Quick Start

### 1. Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure

```bash
copy backend\config\env.example.txt backend\.env
notepad backend\.env  # Add your Azure OpenAI key
```

### 3. Run

```bash
start.bat  # Windows
# Or start backend and frontend in separate terminals
```

### 4. Use

Open http://localhost:5173 and start analyzing!

---

## Documentation (Simple!)

We've consolidated everything into 6 essential documents:

### 📖 New to This Tool?

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** - Setup guide (5 minutes)
2. **[USER_GUIDE.md](USER_GUIDE.md)** - How to use all features

### 🔧 Having Issues?

3. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common problems & solutions

### 👩‍💻 Developer?

4. **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Architecture, APIs, how to extend

### 📚 Want the Full Story?

5. **[PROJECT_HISTORY.md](PROJECT_HISTORY.md)** - How we built this, what worked, what didn't, and why

### 🗂️ Need Deep Technical Details?

6. **[docs-archive/](docs-archive/)** - 40+ detailed guides on specific topics

---

## Key Features

- 📊 **Unified Dashboard** - Content gain + citation rates in one view
- 🔍 **Smart Filtering** - By domain, traffic, content gain, platform, date
- 📈 **Visual Analytics** - Charts showing trends and comparisons
- 🎯 **Opportunity Detection** - Auto-identifies optimization opportunities
- 📁 **Project Management** - Save and manage URL collections
- ⚡ **High Performance** - 40-50% faster analysis with browser pooling

## Technology Stack

- **Backend**: Node.js + Express + Puppeteer
- **Frontend**: React + Vite + Tailwind CSS
- **Performance**: Browser pooling, caching, compression
- **Security**: Helmet, rate limiting, input validation

## Current Status

**Version**: 2.0  
**Status**: ✅ Pilot-ready (10-50 users)  
**Performance**: 
- Analysis: 3-4 seconds per URL
- Dashboard: 200ms load time
- Cache hit rate: 90%+

**Known gaps** (from QA audit):
- 0% test coverage (adding tests is priority)
- No authentication yet (planned)
- JSON file storage (will migrate to DB)

See [PROJECT_HISTORY.md](PROJECT_HISTORY.md) for complete context.

## Quick Reference

| Command | Description |
|---------|-------------|
| `start.bat` | Start both backend and frontend |
| `npm run dev` | Start with hot-reload (in each folder) |
| `npm run build` | Build for production (frontend) |
| http://localhost:5173 | Dashboard URL |
| http://localhost:3000/api/health | Backend health check |

## Configuration

Essential environment variables in `backend/.env`:

```env
# Required
AZURE_OPENAI_KEY=your-key
AZURE_OPENAI_ENDPOINT=your-endpoint

# Optional but recommended
SPACECAT_API_KEY=your-key
PUPPETEER_POOL_SIZE=2
CACHE_TTL=300
LOG_LEVEL=info
```

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for all options.

## Getting Help

- **Setup issues?** → [GETTING_STARTED.md](GETTING_STARTED.md)
- **How do I...?** → [USER_GUIDE.md](USER_GUIDE.md)
- **Something broke!** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Want to develop?** → [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Specific technical topic?** → [docs-archive/](docs-archive/)

## Project Structure

```
AIVisibilityDashboard/
├── backend/              # Node.js + Express API
├── frontend/             # React + Vite app
├── external-tools/       # LLM Presence Tracker (content analysis)
├── data/                 # Data storage (auto-created)
├── logs/                 # Application logs
└── docs-archive/         # Detailed technical docs
```

## Roadmap

**Current (v2.0)**: Pilot-ready
- ✅ Core functionality
- ✅ Performance optimized
- ✅ Security hardened

**Next (v2.5)**: Production-ready (8-12 weeks)
- Add authentication
- Migrate to PostgreSQL
- 80% test coverage
- CI/CD pipeline
- Monitoring & alerting

**Future (v3.0)**: Enterprise-ready
- Multi-tenancy
- Advanced analytics
- API rate limiting per user
- Admin dashboard

See [PROJECT_HISTORY.md](PROJECT_HISTORY.md) for detailed roadmap and rationale.

## Contributing

1. Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for architecture
2. Check existing issues
3. Follow code style (see Developer Guide)
4. Write tests (we need them!)
5. Submit PR with clear description

## License

Internal tool for Adobe Customer Engineering team.

## Credits

Built during Garage Week by the Customer Engineering Automations Team.

**Integrates with:**
- LLM Presence Tracker (content analysis)
- [Tokowaka Measurement Automation](https://github.com/sharmarpit1989/tokowaka-measurement-automation) (standalone CLI for citation tracking)

---

## The TL;DR

**Problem**: Two separate CLI tools for content analysis + citation tracking  
**Solution**: One unified web dashboard  
**Status**: Working well, pilot-ready, documented  
**Next steps**: Add tests, auth, database for production scale

**Start here**: [GETTING_STARTED.md](GETTING_STARTED.md)

---

**Questions?** Check the appropriate guide above, or explore [docs-archive/](docs-archive/) for specific topics.

**Happy analyzing! 📊🚀**
