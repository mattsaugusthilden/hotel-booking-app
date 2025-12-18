# Quick Deployment Checklist

## 🚀 Fast Track to Netlify

### Prerequisites
- GitHub account
- Netlify account (free at netlify.com)
- Railway account (free at railway.app) - for backend

---

## Step 1: Push to GitHub (if not already done)

```bash
cd /Users/mattshilden/hotel-booking-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hotel-booking-app.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway (5 minutes)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `hotel-booking-app` repository
4. Click **"Add Service"** → **"Empty Service"**
5. In the service settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Go to **Variables** tab and add:
   - `PORT` = `5000` (or leave empty, Railway auto-assigns)
   - `JWT_SECRET` = `your-super-secret-key-here`
7. Railway will give you a URL like: `https://your-app.railway.app`
8. **Copy this URL** - you'll need it for the frontend!

### Seed the Database
After deployment, visit: `https://your-app.railway.app/api/seed` (POST request)
Or use curl:
```bash
curl -X POST https://your-app.railway.app/api/seed
```

---

## Step 3: Deploy Frontend to Netlify (5 minutes)

### Option A: Using Netlify Dashboard (Easiest)

1. Go to [app.netlify.com](https://app.netlify.com) → Sign up/Login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to **GitHub** → Select your repository
4. Configure build settings:
   - **Base directory**: (leave empty)
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
5. Click **"Show advanced"** → **"New variable"**:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-app.railway.app/api` (use your Railway URL!)
6. Click **"Deploy site"**
7. Wait for build to complete (~2-3 minutes)
8. Your site will be live at: `https://random-name.netlify.app`

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd /Users/mattshilden/hotel-booking-app
netlify init
# Follow prompts:
# - Create new site
# - Build command: cd client && npm install && npm run build
# - Publish directory: client/build

# Set environment variable
netlify env:set REACT_APP_API_URL https://your-app.railway.app/api

# Deploy
netlify deploy --prod
```

---

## Step 4: Update Backend CORS (if needed)

If you get CORS errors, update `server/index.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-site.netlify.app'
  ],
  credentials: true
}));
```

Or keep `app.use(cors())` for development (allows all origins).

---

## ✅ Verify Deployment

1. **Frontend**: Visit your Netlify URL
2. **Backend**: Visit `https://your-app.railway.app/api/hotels`
3. **Test**: Try booking a room on the deployed site

---

## 🔧 Troubleshooting

### Images not showing?
- Check browser console for errors
- Verify image URLs are accessible
- Ensure HTTPS is used in production

### API calls failing?
- Check `REACT_APP_API_URL` is set correctly in Netlify
- Verify backend is running on Railway
- Check CORS configuration

### Database empty?
- Run the seed endpoint: `POST https://your-app.railway.app/api/seed`
- Check Railway logs for errors

---

## 🎉 You're Done!

Your app should now be live on Netlify!

**Next Steps:**
- Add a custom domain in Netlify
- Set up monitoring
- Consider upgrading to PostgreSQL for production database

