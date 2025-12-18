# Deployment Guide

This guide will help you deploy your hotel booking app to Netlify (frontend) and a backend hosting service.

## Architecture

- **Frontend**: React app → Deploy to Netlify
- **Backend**: Node.js/Express API → Deploy to Railway, Render, or Fly.io
- **Database**: SQLite (included with backend)

## Step 1: Deploy Backend First

### Option A: Railway (Recommended - Easiest)

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create new project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select your repository**: Choose your hotel-booking-app repo
4. **Configure**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**:
   - `PORT` = (Railway will auto-assign, but you can set it)
   - `JWT_SECRET` = (generate a random secret)
6. **Get your backend URL**: Railway will provide a URL like `https://your-app.railway.app`
7. **Seed the database**: After deployment, visit `https://your-app.railway.app/api/seed` (POST request)

### Option B: Render

1. Go to [render.com](https://render.com) and sign up
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables (same as Railway)
6. Get your backend URL

### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Sign up: `fly auth signup`
3. In your project root: `fly launch`
4. Follow the prompts
5. Deploy: `fly deploy`

## Step 2: Update Frontend API URL

1. Update `client/.env.production` with your backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```

2. Or set it in Netlify's environment variables (see Step 3)

## Step 3: Deploy Frontend to Netlify

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Navigate to project root**:
   ```bash
   cd /Users/mattshilden/hotel-booking-app
   ```

4. **Initialize Netlify**:
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Choose a site name
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`

5. **Set environment variable** (if not in .env.production):
   ```bash
   netlify env:set REACT_APP_API_URL https://your-backend-url.railway.app/api
   ```

6. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Method 2: Netlify Dashboard (GitHub Integration)

1. **Go to [app.netlify.com](https://app.netlify.com)**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - Base directory: (leave empty)
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
5. **Add environment variable**:
   - Go to Site settings → Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.railway.app/api`
6. **Deploy**: Click "Deploy site"

## Step 4: Update CORS on Backend

Make sure your backend allows requests from your Netlify domain:

In `server/index.js`, update CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-site.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

Or for development, you can use:
```javascript
app.use(cors()); // Allows all origins (for development)
```

## Step 5: Seed the Database

After deploying the backend, seed the database:

```bash
curl -X POST https://your-backend-url.railway.app/api/seed
```

Or use Postman/Insomnia to make a POST request to the `/api/seed` endpoint.

## Troubleshooting

### Frontend can't connect to backend
- Check that `REACT_APP_API_URL` is set correctly in Netlify
- Verify CORS is configured on backend
- Check backend logs for errors

### Images not loading
- Verify image URLs are accessible
- Check browser console for CORS errors
- Ensure image URLs use HTTPS in production

### Database not persisting (Railway/Render)
- SQLite files may reset on redeploy
- Consider using a persistent database service (PostgreSQL) for production
- Or set up a database initialization script

## Quick Deploy Commands

```bash
# Build and test locally first
cd client && npm run build

# Deploy to Netlify
netlify deploy --prod

# Or use the dashboard method above
```

## Next Steps

1. Set up a custom domain in Netlify
2. Enable HTTPS (automatic with Netlify)
3. Set up environment variables for production
4. Consider migrating to PostgreSQL for production database
5. Set up monitoring and error tracking

