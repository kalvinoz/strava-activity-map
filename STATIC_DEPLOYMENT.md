# Static Website Deployment Guide

This app now runs **100% client-side** with no backend required! Users provide their own Strava API credentials, which are stored only in their browser session.

## ✅ What Makes This Fully Static

- **No server-side code** - Everything runs in the browser
- **No database** - Activities cached in sessionStorage/localStorage
- **No API keys stored on server** - Users bring their own credentials
- **OAuth handled client-side** - Direct Strava API integration
- **GIF export in-browser** - Uses gif.js and html2canvas
- **Privacy-first** - All data cleared when browser closes

---

## 🚀 Deployment Options

### 1. **GitHub Pages** (Recommended - Free)

**Perfect for:** Personal use, completely free, no account limits

**Setup:**
```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run build
npm run deploy
```

**Configure GitHub Pages:**
1. Go to your repo settings > Pages
2. Source: `gh-pages` branch
3. Your site will be at: `https://yourusername.github.io/strava-activity-map`

**Important:** Update your Strava API app settings:
- Website: `https://yourusername.github.io`
- Authorization Callback Domain: `yourusername.github.io`

---

### 2. **Cloudflare Pages** (Best Performance)

**Perfect for:** Unlimited bandwidth, global CDN, custom domains

**Setup:**
1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Connect your GitHub repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy!

**Your site:** `https://strava-activity-map.pages.dev`

---

### 3. **Netlify** (Easy & Popular)

**Perfect for:** Simple deployment, great DX, form handling

**Setup:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify init
netlify deploy --prod
```

Or use drag-and-drop:
1. Run `npm run build`
2. Drag `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

**Your site:** `https://your-app.netlify.app`

---

### 4. **Vercel** (Modern Platform)

**Perfect for:** Preview deployments, analytics, edge functions (if needed later)

**Setup:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Your site:** `https://strava-activity-map.vercel.app`

---

## 📋 Strava API Setup (For End Users)

Your users will need to create their own Strava API application. Here's what they'll do:

### Step 1: Create Strava API App

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Scroll to "My API Application"
3. Fill in:
   - **Application Name:** "My Activity Map" (or any name)
   - **Category:** "Visualizer"
   - **Website:** Your deployed URL (e.g., `https://yourusername.github.io/strava-activity-map`)
   - **Authorization Callback Domain:** Your domain (e.g., `yourusername.github.io`)
4. Click "Create"
5. Copy **Client ID** and **Client Secret**

### Step 2: Use the App

1. Visit your deployed site
2. Click "Get Started"
3. Follow the onboarding wizard
4. Enter Client ID and Client Secret
5. Authorize with Strava
6. Fetch activities and create GIFs!

---

## 🔒 Privacy & Security

### What Gets Stored (All Client-Side)

**In sessionStorage (cleared when browser tab closes):**
- Strava Client ID & Client Secret
- OAuth access token & refresh token
- Fetched activities data
- Token expiry time

**Nothing stored on your server because there is no server!**

### User Data Flow

```
User's Browser → Strava API → User's Browser
     ↑                              ↓
     └──────── (No backend) ────────┘
```

1. User enters credentials → Stored in sessionStorage
2. OAuth redirect → Strava → Back to user's browser
3. Token exchange → Direct browser → Strava API
4. Activities fetch → Direct browser → Strava API
5. GIF export → Processed in browser (gif.js/html2canvas)
6. Close browser → All data automatically cleared

---

## 🎨 Customization

### Change the Site Title/Branding

Edit `index.html`:
```html
<title>Your Custom Title</title>
```

Edit `src/ui/OnboardingUI.js`:
```javascript
<h1>🗺️ Your Custom Title</h1>
```

### Customize Colors

Edit Strava orange (`#fc4c02`) in:
- `index.html` (CSS)
- `src/ui/OnboardingUI.js` (onboarding styles)
- `src/main.js` (activity colors)

### Add Analytics

Add Google Analytics, Plausible, or any client-side analytics to `index.html`.

---

## 🧪 Testing Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:5173
```

**Note:** OAuth callback will only work with your configured callback domain. For local testing:
1. Create a separate Strava API app with callback domain `localhost`
2. Use that Client ID/Secret for local development

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Output: dist/ directory

# Deploy to your chosen platform (see options above)
```

---

## 🐛 Troubleshooting

### "OAuth authorization failed"

- ✅ Check Client ID and Secret are correct
- ✅ Verify callback domain matches your deployed URL exactly
- ✅ Make sure you're using the URL you configured in Strava API settings

### "Failed to fetch activities"

- ✅ Check browser console for errors
- ✅ Verify OAuth authorization succeeded (check sessionStorage)
- ✅ Check Strava API rate limits (100 requests per 15 minutes, 1000 per day)

### "sessionStorage full" error

- ✅ App automatically falls back to localStorage
- ✅ If you have thousands of activities, browser may hit storage limits
- ✅ Consider filtering to fewer activities or shorter date range

### GIF export fails

- ✅ Reduce duration or frame rate
- ✅ Try smaller dimensions (e.g., 800x600 instead of 1200x800)
- ✅ Chrome/Edge work best (better Canvas support)

---

## 🔄 Updates & Maintenance

### To Update Your Deployment

1. Pull latest changes from Git
2. Run `npm run build`
3. Deploy updated `dist/` folder
4. Users' credentials and data stay in their browsers (no migration needed!)

### No Backend to Maintain!

Since there's no server:
- ✅ No database migrations
- ✅ No API key rotation
- ✅ No rate limit management
- ✅ No user accounts
- ✅ No GDPR data to manage

---

## 💡 Tips for Your Users

### Save Your Activities JSON

Users can download their activities as JSON from the app for backup or offline use.

### Clear Data Anytime

Users can click "Start Over" in the app to clear all credentials and cached data.

### Works Offline (After Initial Fetch)

Once activities are cached, users can view the map and export GIFs without internet!

---

## 🎯 Comparison with Backend Solutions

| Feature | This App (Static) | Backend App |
|---------|------------------|-------------|
| Hosting Cost | $0 (free tier) | $5-50/month |
| Setup Complexity | 5 minutes | Hours |
| Privacy | 100% user-controlled | Trust the server |
| Rate Limits | User's own quota | Shared quota |
| Maintenance | Zero | Ongoing |
| Scale | Infinite (CDN) | Server dependent |

---

## 📚 Architecture

```
strava-activity-map/
├── src/
│   ├── auth/
│   │   └── StravaAuth.js          # OAuth & credential management
│   ├── api/
│   │   └── StravaAPI.js           # Strava API client
│   ├── ui/
│   │   └── OnboardingUI.js        # Step-by-step setup wizard
│   ├── animation/
│   │   └── AnimationController.js # Map animation logic
│   ├── export/
│   │   └── GifExporter.js         # Client-side GIF generation
│   └── main.js                    # App initialization
├── index.html                     # Single page app
└── vite.config.js                 # Build configuration
```

All JavaScript is bundled by Vite into a single static site!

---

## 🌟 Features

✅ **Privacy-first** - No data leaves the browser
✅ **Zero backend costs** - Deploy to free CDN
✅ **No rate limit sharing** - Each user uses their own API quota
✅ **Offline-capable** - Works without internet after initial fetch
✅ **Self-service** - Users manage their own credentials
✅ **Auto-cleanup** - All data cleared on browser close
✅ **Mobile-friendly** - Responsive design
✅ **Fast** - Runs on global CDN

---

**Questions?** Open an issue on GitHub!
