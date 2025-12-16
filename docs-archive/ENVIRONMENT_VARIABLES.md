# Environment Variables Configuration

This document describes all environment variables used by the AI Visibility Dashboard.

## Required Variables

### Azure OpenAI Configuration

```env
AZURE_OPENAI_KEY=your-azure-openai-api-key-here
```

**Required for:** AI-powered recommendations and content analysis  
**Get your key from:** [Azure Portal](https://portal.azure.com) → Azure OpenAI Service → Keys and Endpoint

---

## Optional Variables

### Server Configuration

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### External Tool Paths

By default, the application uses the bundled LLM Presence Tracker in the `external-tools/` folder. Override this only if you want to use a custom installation:

```env
# Path to LLM Presence Tracker (used for AI content analysis)
# Default: <project-root>/external-tools/llm-presence-tracker
LLM_TRACKER_PATH=/path/to/your/llm-presence-tracker

# Path to Tokowaka Utilities (legacy, not actively used)
# Default: <project-root>/external-tools/tokowaka-utilities
TOKOWAKA_PATH=/path/to/your/tokowaka-utilities
```

**Note:** Citation tracking uses JavaScript implementation in the backend. For standalone Python CLI tools for citation analysis, see [Tokowaka Measurement Automation](https://github.com/sharmarpit1989/tokowaka-measurement-automation).

### Spacecat API (Optional)

```env
SPACECAT_API_KEY=your-spacecat-api-key-here
```

**Note:** Spacecat integration is optional and not required for core functionality.

---

## Setup Instructions

### 1. Create `.env` file

```bash
cd backend
cp .env.example .env
```

Or on Windows PowerShell:
```powershell
cd backend
Copy-Item .env.example .env
```

### 2. Edit `.env` file

Open `backend/.env` and replace placeholder values with your actual credentials:

```env
AZURE_OPENAI_KEY=a32a817592b34f5198295e80367efdd3
```

### 3. Verify Setup

Start the backend server and check for:
```
✅ Azure OpenAI (optional)
```

If you see `⚠️` instead, the key is not being loaded correctly.

---

## Troubleshooting

### Azure Key Not Loading

If environment variables aren't loading:

1. **Check file encoding**: The `.env` file must be ASCII or UTF-8 (without BOM)
2. **Check file location**: Must be in `backend/` directory
3. **Restart server**: Changes to `.env` require server restart
4. **Test loading**:
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('Key:', process.env.AZURE_OPENAI_KEY ? 'SET' : 'NOT SET')"
   ```

### Custom Tool Paths Not Working

If using custom paths:

1. **Use absolute paths**: Relative paths may not resolve correctly
2. **Check permissions**: Ensure the application can read the directories
3. **Verify structure**: Tools must have the expected file structure (e.g., `main.js`)

---

## Security Notes

⚠️ **Never commit `.env` file to Git!**

- `.env` is already in `.gitignore`
- Share `.env.example` instead (with placeholders)
- Store production keys in secure key management systems

