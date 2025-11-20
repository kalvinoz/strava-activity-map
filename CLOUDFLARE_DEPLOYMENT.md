# Cloudflare Pages Deployment

The Strava Activity Map is deployed to Cloudflare Pages as a static website.

## 🌍 Live URL

**Production:** https://strava-gif.pages.dev

## 🚀 Deployment

### Quick Deploy

```bash
npm run deploy
```

This will:
1. Build the production bundle (`npm run build`)
2. Deploy to Cloudflare Pages using Wrangler
3. Output the preview and production URLs

### Manual Deploy

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=strava-gif
```

## 🔧 Configuration

### Project Settings

- **Project Name:** `strava-gif`
- **Production URL:** `https://strava-gif.pages.dev`
- **Build Command:** `npm run build`
- **Build Output Directory:** `dist`
- **Production Branch:** `main`

### Cloudflare Account

Uses the same Cloudflare account as `strava_results` (woodstock-results):

- **Account:** Pedroqueiroz@gmail.com's Account
- **Account ID:** `c36d1650c54a02a303e3a8d0c25745d8`

## 📋 Strava API Setup for Users

Users need to configure their Strava API app with:

- **Website:** `https://strava-gif.pages.dev`
- **Authorization Callback Domain:** `strava-gif.pages.dev`

The onboarding wizard automatically displays these values with copy buttons!

## 🔄 CI/CD Setup (Optional)

To enable automatic deployments on git push, you can:

### Option 1: Direct Git Integration (Recommended)

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Select `strava-gif` project
3. Click "Settings" → "Build & deployments"
4. Connect to GitHub repository
5. Configure:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

Every push to `main` will auto-deploy!

### Option 2: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: c36d1650c54a02a303e3a8d0c25745d8
          projectName: strava-gif
          directory: dist
```

Add `CLOUDFLARE_API_TOKEN` to GitHub repository secrets.

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to Cloudflare Pages project settings
2. Navigate to "Custom domains"
3. Add your domain (e.g., `map.yourdomain.com`)
4. Update DNS records as instructed
5. SSL certificate automatically provisioned

Then update Strava API settings to use the new domain.

## 📊 Analytics

Cloudflare Pages includes free analytics:

1. Go to project dashboard
2. Click "Analytics" tab
3. View:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Geographic distribution

## 🔍 Monitoring Deployments

### Via CLI

```bash
# List all deployments
npx wrangler pages deployment list --project-name=strava-gif

# View deployment details
npx wrangler pages deployment tail --project-name=strava-gif
```

### Via Dashboard

Go to: https://dash.cloudflare.com/pages → strava-gif → Deployments

View:
- Deployment history
- Build logs
- Preview URLs
- Rollback options

## 🛠️ Troubleshooting

### Deployment Fails

```bash
# Check Wrangler authentication
npx wrangler whoami

# Re-login if needed
npx wrangler login
```

### Build Issues

```bash
# Test build locally first
npm run build

# Check for errors
npm run preview
```

### OAuth Callback Issues

Users must configure their Strava API app with the exact domain:
- ✅ `strava-gif.pages.dev` (correct)
- ❌ `https://strava-gif.pages.dev` (wrong - no protocol)
- ❌ `strava-gif.pages.dev/` (wrong - no trailing slash)

## 📝 Environment Variables

This app has **no environment variables** because it's 100% client-side!

Users provide their own:
- Strava Client ID
- Strava Client Secret

These are stored in the user's browser session only.

## 🔄 Rollback

To rollback to a previous deployment:

1. Go to Cloudflare Pages dashboard
2. Select `strava-gif` project
3. Click "Deployments" tab
4. Find the working deployment
5. Click "..." → "Promote to production"

Or via CLI:

```bash
# List deployments
npx wrangler pages deployment list --project-name=strava-gif

# Rollback to specific deployment
npx wrangler pages deployment promote <deployment-id> --project-name=strava-gif
```

## 💰 Cost

**FREE!** Cloudflare Pages free tier includes:
- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ✅ 500 builds/month
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ DDoS protection

Perfect for this static site!

## 🎯 Best Practices

### Before Deploying

```bash
# 1. Test locally
npm run dev

# 2. Test production build
npm run build
npm run preview

# 3. Deploy
npm run deploy
```

### After Deploying

1. Visit https://strava-gif.pages.dev
2. Test the complete flow:
   - Create Strava API app
   - Enter credentials
   - Authorize
   - Fetch activities
   - Export GIF
3. Check browser console for errors
4. Test on mobile devices

## 📞 Support

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler
- **Cloudflare Community:** https://community.cloudflare.com

---

**Questions?** Check the main [README.md](README.md) or [STATIC_DEPLOYMENT.md](STATIC_DEPLOYMENT.md).
