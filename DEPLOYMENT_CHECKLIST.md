# Render Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [x] Code is reverted to commit `f21b8a5`
- [x] `render.yaml` configuration file created
- [x] Build scripts are working (`npm run build:render`)
- [x] Production start script exists (`npm run start:prod`)
- [x] Server files are compiled (`server/index.cjs` exists)

### 2. Environment Variables
Set these in Render dashboard:

#### Required:
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`

#### Optional (if you have them):
- [ ] `GEMINI_API_KEY=your_gemini_api_key`
- [ ] `DATABASE_URL=your_database_connection_string`

- [ ] `JWT_SECRET=your_jwt_secret`

### 3. Render Configuration
- [ ] Service Name: `persona-matcher-ai`
- [ ] Environment: `Node`
- [ ] Build Command: `npm run build:render`
- [ ] Start Command: `npm run start:prod`
- [ ] Health Check Path: `/api/status`

## 🚀 Deployment Steps

### Step 1: Push to Git
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Configure as per the checklist above
5. Click "Create Web Service"

### Step 3: Monitor Deployment
- Watch the build logs for any errors
- Verify the health check passes
- Test the application endpoints

## 🔍 Post-Deployment Verification

### Test These Endpoints:
- [ ] `/` - Main application
- [ ] `/api/status` - Health check
- [ ] `/api/debug` - Debug information
- [ ] `/api/test-llm` - LLM functionality

### Common Issues to Check:
- [ ] Environment variables are set correctly
- [ ] Database connection works (if using database)

- [ ] LLM API calls work (if using Gemini)

## 📊 Monitoring
- [ ] Set up Render monitoring
- [ ] Check application logs regularly
- [ ] Monitor performance metrics
- [ ] Set up alerts for downtime

## 🔧 Troubleshooting
If deployment fails:
1. Check build logs for errors
2. Verify all environment variables are set
3. Ensure all dependencies are in `package.json`
4. Check if the server starts locally with `npm run start:prod`
