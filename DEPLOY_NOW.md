# 🚀 Deploy to Netlify RIGHT NOW (5 minutes)

Since you already have a Netlify login, let's use the web dashboard - it's the easiest way!

---

## Step 1: Push to GitHub (Required for Netlify)

### A. Create a GitHub Repository

1. Go to [github.com](https://github.com) and login
2. Click the **"+"** icon → **"New repository"**
3. Name it: `hotel-booking-app`
4. Make it **Public** (or Private if you have GitHub Pro)
5. **DON'T** initialize with README
6. Click **"Create repository"**

### B. Push Your Code

Run these commands in your terminal:

```bash
cd /Users/mattshilden/hotel-booking-app

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/hotel-booking-app.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You'll need to enter your GitHub username and password (or use a Personal Access Token)

---

## Step 2: Deploy to Netlify (3 minutes)

### A. Go to Netlify

1. Open [app.netlify.com](https://app.netlify.com) in your browser
2. **Login** with your Netlify account

### B. Import Your Project

1. Click **"Add new site"** button (top right)
2. Click **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. **Authorize Netlify** if prompted (click "Authorize netlify")
5. **Select your repository**: `hotel-booking-app`

### C. Configure Build Settings

Netlify will show build settings. Configure them like this:

- **Base directory**: (leave empty - blank)
- **Build command**: `cd client && npm install && npm run build`
- **Publish directory**: `client/build`

### D. Add Environment Variable

1. Click **"Show advanced"** (below build settings)
2. Click **"New variable"** button
3. Add this variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `http://localhost:5001/api` (we'll update this later)

### E. Deploy!

1. Click **"Deploy site"** button
2. **Wait 2-3 minutes** for the build to complete
3. You'll see a green checkmark when it's done!

---

## Step 3: Your Site is Live! 🎉

Your site will be at: `https://random-name-12345.netlify.app`

You can:
- Click the URL to visit your site
- Click **"Site settings"** → **"Change site name"** to customize the URL

---

## ⚠️ Important: Update Backend URL Later

Right now your frontend is pointing to `localhost` which won't work in production.

**After you deploy your backend** (Railway, Render, etc.):

1. Go to Netlify Dashboard → Your site
2. Click **"Site settings"** → **"Environment variables"**
3. Click **"Edit variables"**
4. Update `REACT_APP_API_URL` to your backend URL:
   - Example: `https://your-app.railway.app/api`
5. Go to **"Deploys"** tab → Click **"Trigger deploy"** → **"Deploy site"**

---

## 🆘 Troubleshooting

### Build fails?
- Check the build logs in Netlify dashboard
- Make sure build command is: `cd client && npm install && npm run build`
- Make sure publish directory is: `client/build`

### Can't connect to GitHub?
- Make sure you authorized Netlify to access your repositories
- Try disconnecting and reconnecting GitHub

### Site loads but API doesn't work?
- This is normal! You need to deploy the backend first
- The frontend will work, but booking features won't until backend is deployed

---

## ✅ You're Done!

Your frontend is now live on Netlify! 

**Next step:** Deploy your backend to Railway or Render, then update the `REACT_APP_API_URL` environment variable.

