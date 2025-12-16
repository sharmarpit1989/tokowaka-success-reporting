# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## Step-by-Step Installation

### 1. Navigate to Project Directory

```bash
cd "Garage Week Project"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- Express (web framework)
- Puppeteer (headless browser)
- Cheerio (HTML parsing)
- xlsx (Excel file handling)
- And other required packages

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- React (UI framework)
- Vite (build tool)
- Tailwind CSS (styling)
- Chart.js (charts)
- React Router (routing)
- And other required packages

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cd ../backend
copy config\env.example.txt .env
```

Edit the `.env` file with your actual values:

```env
# Required
PORT=3000
SPACECAT_API_KEY=your-actual-spacecat-api-key

# Optional (for LLM comparisons)
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_ENDPOINT=your-azure-endpoint
```

**Where to get API keys:**
- **Spacecat API Key**: Contact your Spacecat administrator
- **Azure OpenAI Key**: Get from Azure Portal (optional feature)

### 5. Verify Installation

Check that everything is installed correctly:

```bash
# Check backend
cd backend
node --version  # Should show v18.x.x or higher
npm list express  # Should show express is installed

# Check frontend
cd ../frontend
npm list react  # Should show react is installed
```

## Running the Application

### Development Mode (Recommended for Testing)

You'll need TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running on: http://localhost:3000
API endpoints available at: http://localhost:3000/api
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and go to: **http://localhost:5173**

### Production Mode

Build the frontend first:

```bash
cd frontend
npm run build
```

Then start the backend (which will serve the built frontend):

```bash
cd ../backend
npm start
```

Access the application at: **http://localhost:3000**

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
1. Check what's using the port:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill the process or change the PORT in `.env`

#### Module Not Found Errors

**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
cd backend
rm -rf node_modules
npm install
```

#### Puppeteer Installation Issues

**Error:** Puppeteer fails to install or run

**Solution:**
1. Ensure you have Chrome/Chromium installed
2. Try installing Puppeteer separately:
   ```bash
   npm install puppeteer --force
   ```

#### Frontend Won't Start

**Error:** `Failed to load config from vite.config.js`

**Solution:**
```bash
cd frontend
rm -rf node_modules
npm install
```

#### CORS Errors

**Error:** `Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution:**
- Ensure backend `.env` has: `ALLOWED_ORIGINS=http://localhost:5173`
- Restart the backend server

### Still Having Issues?

1. Make sure all commands are run from the correct directory
2. Check Node.js version: `node --version` (must be 18+)
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and `package-lock.json`, then reinstall
5. Check firewall settings - ports 3000 and 5173 need to be accessible

## Next Steps

Once installation is complete:

1. Read [USAGE.md](./USAGE.md) for how to use the dashboard
2. Check [API.md](./API.md) for API documentation
3. See the main [README.md](../README.md) for feature overview

## Configuration Options

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | 3000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `SPACECAT_API_KEY` | Spacecat API authentication | Yes | - |
| `AZURE_OPENAI_KEY` | Azure OpenAI for LLM comparison | No | - |
| `DATA_DIR` | Data storage directory | No | ../data |
| `PUPPETEER_CONCURRENCY` | Parallel analysis jobs | No | 5 |

### Frontend Configuration

The frontend is configured via `vite.config.js`. Default settings:
- Dev server port: 5173
- API proxy: http://localhost:3000
- Build output: `dist/`

To change these, edit `frontend/vite.config.js`.

## Development Tips

### Hot Reload

Both frontend and backend support hot reload in development mode:
- **Frontend**: Vite automatically reloads when you edit files
- **Backend**: Uses `--watch` flag to restart on changes

### Debugging

**Backend:**
```bash
# Add debug logging
set DEBUG=express:*
npm run dev
```

**Frontend:**
- Open browser DevTools (F12)
- Check Console for errors
- Use React DevTools extension

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Updating Dependencies

To update all packages to their latest versions:

```bash
# Backend
cd backend
npm update

# Frontend
cd frontend
npm update
```

## Getting Help

If you encounter issues:
1. Check this SETUP guide first
2. Review error messages carefully
3. Check the [Troubleshooting](#troubleshooting) section
4. Contact the development team

---

**Happy Coding! 🚀**

