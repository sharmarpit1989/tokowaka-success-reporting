# Documentation Index

Complete guide to all documentation in the LLM Presence Tracker project.

---

## 🚀 Getting Started

**New to the project? Start here:**

1. **[Quick Start Guide](guides/QUICKSTART.md)** - Get up and running in 10 minutes
2. **[System Overview](architecture/SYSTEM_OVERVIEW.md)** - Understand what the tool does
3. **[Sample Files Guide](guides/SAMPLE_FILES.md)** - Learn about input formats

---

## 📚 User Guides

Step-by-step guides for common tasks:

- **[Quick Start Guide](guides/QUICKSTART.md)** - Installation and first run
- **[GSC & Ahrefs Integration](guides/GSC_AHREFS_INTEGRATION_GUIDE.md)** - Export and use search query data
- **[Auto-Generate Queries](guides/AUTO_QUERY_GENERATION.md)** - Automatically populate search queries with PAA
- **[Data-Driven Recommendations](guides/DATA_DRIVEN_RECOMMENDATIONS.md)** - Use real search data for better insights
- **[Sample Files Guide](guides/SAMPLE_FILES.md)** - Understand input CSV formats

---

## 🏗️ Architecture & Design

Understand how the system works:

- **[System Overview](architecture/SYSTEM_OVERVIEW.md)** ⭐ **Start here!** - One-page visual summary
- **[Quick Reference Flow](architecture/QUICK_REFERENCE_FLOW.md)** - Simplified workflows & pro tips
- **[Detailed Flow Diagram](architecture/FLOW_DIAGRAM.md)** - Complete technical architecture
- **[Architecture Document](architecture/ARCHITECTURE.md)** - Design decisions and code reuse

---

## ✨ Features

Deep-dives into specific features:

### Core Features
- **[Page Type Classification](features/PAGE_TYPE_CLASSIFICATION.md)** - How pages are classified (20+ types)
- **[Page Type-Specific Scoring](features/PAGE_TYPE_SCORING.md)** - Dynamic weights by page type
- **[Multilingual Support](features/MULTILINGUAL_SUPPORT.md)** - 7 languages supported
- **[Learning System](features/LEARNING_SYSTEM.md)** - Self-improving AI recommendations

### Technical Features
- **[Feature: Page Classification](features/FEATURE_PAGE_CLASSIFICATION.md)** - Classification implementation
- **[Feature: Intelligent Scoring](features/FEATURE_INTELLIGENT_SCORING.md)** - Scoring system details
- **[Structure Count Fix](features/LIST_COUNT_FIX.md)** - How heading/list counting was fixed

---

## 🔧 Troubleshooting

Fix common issues:

- **[Learning System Fixes](troubleshooting/LEARNING_FIXES.md)** - Solved quality degradation issues

**Need more help?** Check the main [README.md](../README.md) or open an issue.

---

## 📖 Project Story & Meta

Learn about the project's evolution:

- **[Full Blog Post](meta/BLOG.md)** - Complete development story (20-25 min read)
- **[Blog Preview](meta/BLOG_PREVIEW.md)** - Executive summary
- **[Project Summary](meta/SUMMARY.md)** - High-level overview
- **[Setup Complete](meta/SETUP_COMPLETE.md)** - Initial setup documentation
- **[Preview](meta/preview.md)** - Early preview document

---

## 📑 Documentation by Audience

### For Content Creators
1. [Quick Start Guide](guides/QUICKSTART.md)
2. [GSC & Ahrefs Integration](guides/GSC_AHREFS_INTEGRATION_GUIDE.md)
3. [Sample Files Guide](guides/SAMPLE_FILES.md)

### For Marketers
1. [System Overview](architecture/SYSTEM_OVERVIEW.md)
2. [Data-Driven Recommendations](guides/DATA_DRIVEN_RECOMMENDATIONS.md)
3. [Page Type Scoring](features/PAGE_TYPE_SCORING.md)

### For Developers
1. [Architecture](architecture/ARCHITECTURE.md)
2. [Flow Diagram](architecture/FLOW_DIAGRAM.md)
3. [Feature Documentation](features/)

### For Executives
1. [Blog Post](meta/BLOG.md)
2. [System Overview](architecture/SYSTEM_OVERVIEW.md)
3. [Project Summary](meta/SUMMARY.md)

---

## 🗂️ Documentation Structure

```
docs/
├── README.md (this file)          ← Documentation index
│
├── guides/                         ← User guides
│   ├── QUICKSTART.md
│   ├── GSC_AHREFS_INTEGRATION_GUIDE.md
│   ├── AUTO_QUERY_GENERATION.md
│   ├── DATA_DRIVEN_RECOMMENDATIONS.md
│   └── SAMPLE_FILES.md
│
├── architecture/                   ← Technical docs
│   ├── SYSTEM_OVERVIEW.md
│   ├── QUICK_REFERENCE_FLOW.md
│   ├── FLOW_DIAGRAM.md
│   └── ARCHITECTURE.md
│
├── features/                       ← Feature docs
│   ├── PAGE_TYPE_CLASSIFICATION.md
│   ├── PAGE_TYPE_SCORING.md
│   ├── MULTILINGUAL_SUPPORT.md
│   ├── LEARNING_SYSTEM.md
│   ├── FEATURE_PAGE_CLASSIFICATION.md
│   ├── FEATURE_INTELLIGENT_SCORING.md
│   └── LIST_COUNT_FIX.md
│
├── troubleshooting/                ← Fix guides
│   └── LEARNING_FIXES.md
│
└── meta/                           ← Project docs
    ├── BLOG.md
    ├── BLOG_PREVIEW.md
    ├── SUMMARY.md
    ├── SETUP_COMPLETE.md
    └── preview.md
```

---

## 📊 Quick Stats

- **Total Documentation Files:** 25+
- **Guides:** 5
- **Architecture Docs:** 4
- **Feature Docs:** 7
- **Project Meta:** 5
- **Total Words:** ~50,000+
- **Estimated Reading Time:** ~4-5 hours (complete)

---

## 🔄 Keep Documentation Updated

When adding new features:
1. Create feature doc in `features/`
2. Add quick start steps to `guides/QUICKSTART.md`
3. Update this index
4. Update main `README.md`

---

**Last Updated:** November 2025  
**Version:** 1.0  
**Maintainer:** Tokowaka Utilities Team

