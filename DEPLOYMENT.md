# Deployment Options for Strava Activity Map

## Free Hosting Options (Small Audience)

### 1. **Vercel** (Recommended)
**Best for:** Modern web apps with serverless functions

**Pros:**
- Zero-config deployment
- Serverless functions for Strava API calls (no pre-fetching needed)
- Automatic HTTPS & CDN
- 100GB bandwidth/month free
- Environment variables for secure token storage
- Preview deployments for PRs

**Setup:**
```bash
npm install -g vercel
vercel login
vercel
# Set environment variable
vercel env add STRAVA_ACCESS_TOKEN
vercel --prod
```

**Files created:**
- `vercel.json` - Build configuration
- `api/activities.js` - Serverless function to fetch Strava activities

**Live URL:** `https://strava-activity-map.vercel.app`

---

### 2. **Netlify**
**Best for:** Jamstack sites

**Pros:**
- Free tier: 100GB bandwidth
- Netlify Functions (AWS Lambda backend)
- Form handling, split testing
- Continuous deployment from GitHub

**Setup:**
```bash
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

**Environment Variables:** Set in Netlify dashboard
- Site Settings > Environment Variables > `STRAVA_ACCESS_TOKEN`

---

### 3. **Cloudflare Pages**
**Best for:** Global performance

**Pros:**
- **Unlimited bandwidth** (biggest advantage!)
- Cloudflare Workers for API calls
- Fastest CDN globally
- Free custom domains

**Setup:**
- Connect GitHub repository in Cloudflare dashboard
- Auto-deploys on git push
- Add Workers for Strava API integration

---

### 4. **GitHub Pages**
**Best for:** Static sites only

**Pros:**
- Completely free
- Auto-deploy via GitHub Actions
- Custom domain support

**Cons:**
- No backend/API calls
- Must pre-fetch activities locally and commit JSON files

**Setup:**
```bash
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "npm run build && gh-pages -d dist"

npm run deploy
```

**Live URL:** `https://yourusername.github.io/strava-activity-map`

---

## Comparison Table

| Platform | Bandwidth | Backend | Setup Time | Best Feature |
|----------|-----------|---------|------------|--------------|
| Vercel | 100GB | ✅ Functions | ~2 min | Easiest deployment |
| Netlify | 100GB | ✅ Functions | ~3 min | Great DX |
| Cloudflare | Unlimited | ✅ Workers | ~5 min | Unlimited bandwidth |
| GitHub Pages | 100GB | ❌ Static | ~5 min | GitHub integration |

---

## Recommended: Vercel

### Why Vercel?
1. **Dynamic Strava data** via serverless functions
2. **Zero configuration** - just `vercel` and it works
3. **Secure token storage** via environment variables
4. **No pre-fetching** required - API calls happen server-side

### Deployment Steps:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (first time - will ask questions)
vercel

# 4. Add Strava token as environment variable
vercel env add STRAVA_ACCESS_TOKEN
# Paste your token when prompted
# Select: Production, Preview, Development (all)

# 5. Deploy to production
vercel --prod

# Done! Your site is live
```

### Post-Deployment
- Custom domain: `vercel domains add yourdomain.com`
- Analytics: `vercel analytics`
- Logs: `vercel logs`

---

## Alternative: Keep it Local

If you prefer to keep using local JSON files (current setup):

1. Run `npm run fetch` locally to update activities
2. Commit `data/activities/all_activities.json` to git
3. Deploy to any static host (GitHub Pages, Netlify, Vercel)
4. No API keys needed on server

**Pros:** Simpler, no backend needed
**Cons:** Manual update process, no real-time data

---

## Security Notes

### Environment Variables (Vercel/Netlify)
Never commit your Strava access token to git! Always use environment variables:

```bash
# Vercel
vercel env add STRAVA_ACCESS_TOKEN

# Netlify
netlify env:set STRAVA_ACCESS_TOKEN "your-token-here"
```

### Token Refresh
Strava access tokens expire. For production, implement OAuth refresh flow or manually update tokens periodically.

---

## Next Steps

1. Choose hosting platform (recommend: Vercel)
2. Test deployment with current local setup
3. (Optional) Add serverless function for dynamic data
4. (Optional) Set up custom domain
5. (Optional) Add token refresh logic
