# Step-by-Step Netlify Deployment Guide

## ✅ Your project is ready! Here's how to deploy:

---

## Option 1: Using Netlify CLI (Fastest - Recommended)

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
cd /Users/mattshilden/hotel-booking-app
netlify login
```
This will open your browser - click "Authorize" to connect.

### Step 3: Initialize and Deploy
```bash
netlify init
```
When prompted:
- **Create & configure a new site** → Yes
- **Team** → Select your team (or personal)
- **Site name** → Choose a name (or press Enter for random)
- **Build command** → `cd client && npm install && npm run build`
- **Directory to deploy** → `client/build`

### Step 4: Set Environment Variable
```bash
netlify env:set REACT_APP_API_URL http://localhost:5001/api
```
(You'll update this later when you deploy your backend)

### Step 5: Deploy!
```bash
netlify deploy --prod
```

🎉 **Done!** Your site will be live at: `https://your-site-name.netlify.app`

---

## Option 2: Using Netlify Dashboard (Web Interface)

### Step 1: Push to GitHub (if not already)
```bash
# Create a new repository on GitHub first, then:
cd /Users/mattshilden/hotel-booking-app
git remote add origin https://github.com/YOUR_USERNAME/hotel-booking-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy via Netlify Dashboard

1. **Go to [app.netlify.com](https://app.netlify.com)** and login

2. **Click "Add new site"** → **"Import an existing project"**

3. **Connect to Git provider** → Choose GitHub

4. **Authorize Netlify** to access your GitHub repositories

5. **Select your repository** → `hotel-booking-app`

6. **Configure build settings**:
   - **Base directory**: (leave empty)
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`

7. **Click "Show advanced"** → **"New variable"**:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `http://localhost:5001/api` (update this later with your backend URL)

8. **Click "Deploy site"**

9. **Wait 2-3 minutes** for the build to complete

🎉 **Done!** Your site will be live!

---

## ⚠️ Important: Backend URL

Right now, the frontend is configured to use `http://localhost:5001/api` for development.

**After you deploy your backend** (Railway, Render, etc.), you need to:

1. Go to Netlify Dashboard → Your site → **Site settings** → **Environment variables**
2. Update `REACT_APP_API_URL` to your backend URL:
   - Example: `https://your-app.railway.app/api`
3. **Trigger a new deploy** (Deploys → Trigger deploy)

---

## 🧪 Test Your Deployment

1. Visit your Netlify URL
2. Check the browser console (F12) for any errors
3. Try navigating the site

---

## 📝 Quick Commands Reference

```bash
# Deploy to production
netlify deploy --prod

# Deploy a draft (for testing)
netlify deploy

# View site info
netlify status

# Open site in browser
netlify open:site

# View logs
netlify logs
```

---

## 🆘 Need Help?

- Check Netlify build logs in the dashboard
- Verify environment variables are set correctly
- Make sure your backend is deployed and accessible
- Check browser console for API connection errors

