# GIF Size Estimation Experiment - Instructions

## Prerequisites

1. ✅ Dev server is running at http://localhost:5173
2. You need to have your Strava account authenticated
3. You should have at least 100 activities loaded for meaningful results

## Step-by-Step Instructions

### 1. Load Your Activities

1. Open http://localhost:5173 in your browser
2. Authenticate with Strava if not already authenticated
3. Click "Load Activities" and wait for all activities to load
4. Verify you have enough activities (check the stats display)

### 2. Load the Experiment Script

1. Open the browser Developer Console (F12 or Cmd+Option+J on Mac)
2. Copy the contents of `experiments/run-gif-size-experiment.js`
3. Paste into the console and press Enter
4. You should see: "GIF Size Experiment script loaded!"

### 3. Run the Main Experiment

In the browser console, run:

```javascript
await runExperiment()
```

This will:
- Run all tests in Sets 1-3 (dimensions, FPS, duration)
- Take approximately 15-20 minutes
- Show progress in the console
- Display results in markdown table format at the end

### 4. Run Complexity Tests

After the main experiment completes, run:

```javascript
await testComplexity()
```

This will test Set 4 (complexity impact).

### 5. View Results

To view the results again:

```javascript
printResults()
```

To get raw data:

```javascript
getExperimentResults()
```

### 6. Save Results

Results are automatically saved to localStorage. To retrieve them:

```javascript
JSON.parse(localStorage.getItem('gifSizeExperimentResults'))
```

Copy the markdown tables from the console output and paste them into `gif-size-estimation.md`.

## Test Configuration Summary

### Set 1: Dimension Impact (4 tests)
- Fixed: 10s duration, 15 FPS
- Varying: 800×600, 1200×800, 1600×1200, 1920×1080

### Set 2: FPS Impact (4 tests)
- Fixed: 1200×800, 10s duration
- Varying: 10, 15, 20, 30 FPS

### Set 3: Duration Impact (4 tests)
- Fixed: 1200×800, 15 FPS
- Varying: 5s, 10s, 15s, 20s duration

### Set 4: Complexity Impact (3 tests)
- Fixed: 1200×800, 15 FPS, 10s duration
- Varying: ~10, ~50, ~200 activities

## Expected Duration

- Set 1: ~5 minutes (4 tests × ~1 min each)
- Set 2: ~5 minutes (4 tests × ~1 min each)
- Set 3: ~5 minutes (4 tests × ~1 min each)
- Set 4: ~4 minutes (3 tests × ~1 min each)
- **Total: ~20 minutes**

## Troubleshooting

### "GIF exporter not found" error
- Make sure activities are loaded before running the experiment
- Check that `window.gifExporter` exists in the console

### "Need at least 100 activities" error
- Load more activities from your Strava account
- If you have fewer activities, reduce the targetCount in the script

### Export fails
- Check browser console for detailed error messages
- Ensure you have enough memory (GIF encoding is memory-intensive)
- Try closing other tabs to free up memory

### Script doesn't load
- Make sure you copied the entire script
- Check for JavaScript errors in the console
- Try refreshing the page and loading activities again

## Next Steps

After collecting results:
1. Copy the markdown tables from console output
2. Update `gif-size-estimation.md` with actual sizes
3. Run the analysis script to derive the formula
4. Implement the formula in GifExporter.js
