# Local Development Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Visit http://localhost:5173 (or 5174 if port is busy)

---

## 🔧 OAuth Configuration for Local Testing

The app **automatically detects** when you're running on localhost and adjusts the OAuth redirect URI.

### Automatic Redirect URI Detection

**When running locally:**
- Redirect URI: `http://localhost:5173` (or whatever port Vite uses)

**When deployed to production:**
- Redirect URI: `https://strava-gif.pages.dev`

This means you can use **different Strava API apps** for local development vs production!

---

## 📋 Setting Up Strava API for Local Development

### Option 1: Separate Dev API App (Recommended)

Create a separate Strava API app specifically for local development:

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Click "Create New Application"
3. Fill in:
   - **Application Name:** "Activity Map (Dev)"
   - **Category:** "Visualizer"
   - **Club:** Leave blank
   - **Website:** `http://localhost:5173`
   - **Authorization Callback Domain:** `localhost`
4. Save the Client ID & Secret for local development

### Option 2: Use Existing API App

If you already have a Strava API app for something else:

1. Go to your existing app in [Strava API Settings](https://www.strava.com/settings/api)
2. **Update the Authorization Callback Domain** to include `localhost`:
   - If single domain: Change to `localhost`
   - If you need both: Strava only allows one domain, so use Option 1 instead

**Note:** The app code automatically uses `http://localhost:[port]` as the redirect URI when running locally, so you don't need to configure multiple callback URLs.

---

## 🧪 Testing the Full Flow Locally

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the app:**
   Open http://localhost:5173

3. **Go through onboarding:**
   - Click "Get Started"
   - Notice the callback domain shows `localhost` (not `strava-gif.pages.dev`)
   - Enter your **dev** Strava app credentials
   - Authorize with Strava
   - OAuth will redirect back to `http://localhost:5173`

4. **Fetch & visualize:**
   - Click "Fetch Activities from Strava"
   - View the map animation
   - Export a GIF

---

## 🔍 How It Works

### Environment Detection

The app checks `window.location.hostname` to determine the environment:

```javascript
// src/auth/StravaAuth.js
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Local development
  redirectUri = `http://localhost:${window.location.port}`;
} else {
  // Production
  redirectUri = window.location.origin + window.location.pathname;
}
```

### Onboarding UI

The onboarding wizard automatically shows the correct callback domain:

```javascript
// src/ui/OnboardingUI.js
<code id="callback-domain">${window.location.hostname}</code>
```

When running locally, this displays `localhost`.
When deployed, this displays `strava-gif.pages.dev`.

---

## 💾 Session Storage

All data is stored in **sessionStorage** (cleared when browser tab closes):

- `strava_client_id` - Your Client ID
- `strava_client_secret` - Your Client Secret
- `strava_access_token` - OAuth access token
- `strava_refresh_token` - OAuth refresh token
- `strava_activities_cache` - Fetched activities

### Clearing Session Data

To start fresh:
1. Close the browser tab (auto-clears sessionStorage)
2. Or click "Start Over" in the app
3. Or manually clear in DevTools: Application → Storage → Session Storage

---

## 🐛 Debugging

### View OAuth Redirect URI

Check the browser console when clicking "Save & Authorize":

```
OAuth redirect URI: http://localhost:5173
```

### View Session Storage

In Chrome DevTools:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Session Storage**
4. Click on your localhost URL
5. See all stored keys/values

### Common Issues

**"OAuth authorization failed"**
- ✅ Check your dev Strava app has callback domain: `localhost`
- ✅ Verify Client ID & Secret are correct
- ✅ Make sure you're using credentials from the right app (dev vs prod)

**"Failed to fetch activities"**
- ✅ Check browser console for errors
- ✅ Verify OAuth succeeded (check sessionStorage)
- ✅ Test the access token in Strava's API playground

**Port changed (5173 → 5174)**
- ✅ Vite auto-increments port if 5173 is busy
- ✅ OAuth redirect URI automatically adjusts to new port
- ✅ Update your Strava app if you want to lock to a specific port

---

## 🔄 Hot Module Replacement

Vite provides instant hot reload:

- **JavaScript changes:** Page auto-reloads
- **CSS changes:** Styles update without page reload
- **State preserved:** sessionStorage survives reloads

You can keep the app open and make changes while developing!

---

## 📦 Building for Production

```bash
# Build
npm run build

# Preview production build locally
npm run preview
```

The preview server simulates production environment but still runs on `localhost`, so OAuth will use localhost callback.

---

## 🚀 Deploying to Production

```bash
# One command deploy
npm run deploy
```

This:
1. Builds the production bundle
2. Deploys to Cloudflare Pages
3. Uses production domain (`strava-gif.pages.dev`) for OAuth

---

## 🎯 Development Workflow

### Recommended Setup

1. **Create two Strava API apps:**
   - **Dev App:** Callback domain `localhost`
   - **Prod App:** Callback domain `strava-gif.pages.dev`

2. **Local development:**
   - Use dev app credentials
   - Run `npm run dev`
   - Test features locally

3. **Deploy to production:**
   - Run `npm run deploy`
   - Production users use prod app credentials
   - You can test with prod app too!

### Why Two Apps?

- **Isolation:** Dev testing doesn't affect production
- **Different domains:** localhost vs strava-gif.pages.dev
- **Easier debugging:** Separate OAuth logs in Strava
- **No conflicts:** Can develop without disturbing live users

But it's optional! You can use one app if you switch the callback domain.

---

## 💡 Tips

### Faster Development

```bash
# Skip build, just run dev server
npm run dev
```

### Test Production Build Locally

```bash
npm run build
npm run preview
```

### Auto-open Browser

Add to `package.json`:
```json
"dev": "vite --open"
```

### Use Different Port

```bash
vite --port 3000
```

Or set in `vite.config.js`:
```javascript
export default {
  server: {
    port: 3000
  }
}
```

---

## 📊 Performance in Development

Development mode includes:
- Source maps (larger bundle)
- Hot reload server
- Dev-only console logs

**Don't test performance in dev mode!** Use production build:

```bash
npm run build
npm run preview
```

---

## 🔒 Security Notes

### API Credentials in Development

- ✅ Stored in sessionStorage (not persisted to disk)
- ✅ Cleared when you close the browser
- ✅ Never committed to git
- ✅ Never sent to any server

### CORS in Development

Strava API allows CORS from any origin, so local development works without proxy.

---

## 📝 Environment Variables

This app has **no environment variables**! Everything is client-side.

Users provide their credentials in the UI.

---

## 🎉 Happy Developing!

Questions? Check:
- [README.md](README.md) - Main documentation
- [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) - Deployment guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Architecture details
