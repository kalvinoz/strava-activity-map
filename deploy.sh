#!/bin/bash

# Deploy strava-activity-map to Cloudflare Pages
# Project: strava-gif
# URL: https://strava-gif.pages.dev

set -e

echo "🏗️  Building strava-activity-map..."
npm run build

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=strava-gif --commit-dirty=true

echo ""
echo "✅ Deployment complete!"
echo "🌍 Production URL: https://strava-gif.pages.dev"
echo "📊 Preview URL: Check the deployment output above"
