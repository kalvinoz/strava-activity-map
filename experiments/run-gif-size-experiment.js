/**
 * Automated GIF Size Estimation Experiment Runner
 *
 * Run this script in the browser console after loading activities.
 *
 * Usage:
 * 1. Load your Strava activities in the app
 * 2. Open browser console
 * 3. Copy and paste this entire script
 * 4. Call: await runExperiment()
 * 5. Results will be logged and can be copied to the markdown file
 */

// Test configurations based on experiment plan
const testSets = {
  set1_dimensions: {
    name: "Set 1: Dimension Impact",
    fixed: { duration: 10, fps: 15 },
    tests: [
      { width: 800, height: 600 },
      { width: 1200, height: 800 },
      { width: 1600, height: 1200 },
      { width: 1920, height: 1080 }
    ]
  },
  set2_fps: {
    name: "Set 2: FPS Impact",
    fixed: { width: 1200, height: 800, duration: 10 },
    tests: [
      { fps: 10 },
      { fps: 15 },
      { fps: 20 },
      { fps: 30 }
    ]
  },
  set3_duration: {
    name: "Set 3: Duration Impact",
    fixed: { width: 1200, height: 800, fps: 15 },
    tests: [
      { duration: 5 },
      { duration: 10 },
      { duration: 15 },
      { duration: 20 }
    ]
  }
};

// Test results storage
const results = {
  set1_dimensions: [],
  set2_fps: [],
  set3_duration: [],
  set4_complexity: []
};

/**
 * Get date range that contains approximately the target number of activities
 */
function getDateRangeForActivityCount(targetCount) {
  if (!window.activities || window.activities.length === 0) {
    throw new Error('No activities loaded. Make sure activities are loaded in the app first.');
  }

  console.log(`Total activities available: ${window.activities.length}`);

  // Sort activities by date
  const sorted = [...window.activities].sort((a, b) =>
    new Date(a.start_date) - new Date(b.start_date)
  );

  // Find a range with target count centered in the data
  const midIndex = Math.floor(sorted.length / 2);
  const startIndex = Math.max(0, midIndex - Math.floor(targetCount / 2));
  const endIndex = Math.min(sorted.length - 1, startIndex + targetCount - 1);

  const start = new Date(sorted[startIndex].start_date);
  const end = new Date(sorted[endIndex].start_date);
  const actualCount = endIndex - startIndex + 1;

  console.log(`Selected date range: ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${actualCount} activities)`);

  return { start, end, activityCount: actualCount };
}

/**
 * Run a single export test
 */
async function runTest(config, targetActivityCount = 50) {
  console.log('\n--- Running test with config:', config);

  // Check for gif exporter
  if (!window.gifExporter) {
    throw new Error('GIF exporter not found. Make sure activities are loaded in the app.');
  }

  // Get date range for specified activity count
  const dateRange = getDateRangeForActivityCount(targetActivityCount);

  const exportConfig = {
    startDate: dateRange.start,
    endDate: dateRange.end,
    width: config.width,
    height: config.height,
    fps: config.fps,
    duration: config.duration,
    quality: 10
  };

  console.log('Export config:', exportConfig);

  // Start timer
  const startTime = Date.now();

  // Export GIF
  console.log('Starting GIF export...');
  const blob = await window.gifExporter.export(exportConfig);

  // Calculate metrics
  const endTime = Date.now();
  const sizeBytes = blob.size;
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
  const timeSeconds = ((endTime - startTime) / 1000).toFixed(1);

  const result = {
    config: config,
    sizeBytes: sizeBytes,
    sizeMB: sizeMB,
    timeSeconds: timeSeconds,
    activityCount: dateRange.activityCount,
    megapixels: ((config.width * config.height) / 1000000).toFixed(2),
    totalFrames: config.fps * config.duration,
    pixelFrames: config.width * config.height * config.fps * config.duration
  };

  console.log('✅ Test result:', result);

  return result;
}

/**
 * Run all tests in a set
 */
async function runTestSet(setName, setConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${setConfig.name}`);
  console.log('='.repeat(60));

  const setResults = [];

  for (let i = 0; i < setConfig.tests.length; i++) {
    const testConfig = { ...setConfig.fixed, ...setConfig.tests[i] };
    console.log(`\nTest ${i + 1}/${setConfig.tests.length}:`);

    try {
      const result = await runTest(testConfig);
      setResults.push(result);

      // Wait a bit between tests
      console.log('Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Test failed:`, error);
      setResults.push({ config: testConfig, error: error.message });
    }
  }

  results[setName] = setResults;
  return setResults;
}

/**
 * Run the full experiment
 */
async function runExperiment() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 STARTING GIF SIZE ESTIMATION EXPERIMENT');
  console.log('='.repeat(60));
  console.log(`Total activities loaded: ${window.activities?.length || 0}`);

  if (!window.activities || window.activities.length < 100) {
    console.error('❌ Need at least 100 activities for meaningful results');
    console.error(`Currently have: ${window.activities?.length || 0} activities`);
    return;
  }

  const startTime = Date.now();

  try {
    // Run each test set
    await runTestSet('set1_dimensions', testSets.set1_dimensions);
    await runTestSet('set2_fps', testSets.set2_fps);
    await runTestSet('set3_duration', testSets.set3_duration);

    const endTime = Date.now();
    const totalMinutes = ((endTime - startTime) / 1000 / 60).toFixed(1);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ EXPERIMENT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`Total time: ${totalMinutes} minutes\n`);

    printResults();

    // Save results to localStorage for retrieval
    localStorage.setItem('gifSizeExperimentResults', JSON.stringify(results));
    console.log('\n💾 Results saved to localStorage');
    console.log('To retrieve: JSON.parse(localStorage.getItem("gifSizeExperimentResults"))');

    return results;
  } catch (error) {
    console.error('❌ Experiment failed:', error);
    throw error;
  }
}

/**
 * Print results in markdown table format
 */
function printResults() {
  console.log('\n📊 RESULTS IN MARKDOWN FORMAT');
  console.log('='.repeat(60));
  console.log('\nCopy the tables below into gif-size-estimation.md:\n');

  console.log('### Set 1: Dimension Impact\n');
  console.log('| Width | Height | Megapixels | Total Frames | Actual Size (MB) | Time (s) |');
  console.log('|-------|--------|------------|--------------|------------------|----------|');
  results.set1_dimensions.forEach(r => {
    if (!r.error) {
      console.log(`| ${r.config.width} | ${r.config.height} | ${r.megapixels} | ${r.totalFrames} | ${r.sizeMB} | ${r.timeSeconds} |`);
    }
  });

  console.log('\n### Set 2: FPS Impact\n');
  console.log('| FPS | Total Frames | Actual Size (MB) | Time (s) |');
  console.log('|-----|--------------|------------------|----------|');
  results.set2_fps.forEach(r => {
    if (!r.error) {
      console.log(`| ${r.config.fps} | ${r.totalFrames} | ${r.sizeMB} | ${r.timeSeconds} |`);
    }
  });

  console.log('\n### Set 3: Duration Impact\n');
  console.log('| Duration | Total Frames | Actual Size (MB) | Time (s) |');
  console.log('|----------|--------------|------------------|----------|');
  results.set3_duration.forEach(r => {
    if (!r.error) {
      console.log(`| ${r.config.duration} | ${r.totalFrames} | ${r.sizeMB} | ${r.timeSeconds} |`);
    }
  });

  console.log('\n');
}

/**
 * Test complexity impact with different date ranges
 */
async function testComplexity() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 SET 4: COMPLEXITY IMPACT');
  console.log('='.repeat(60));

  const complexityTests = [
    { name: 'Low', targetCount: 10 },
    { name: 'Medium', targetCount: 50 },
    { name: 'High', targetCount: 200 }
  ];

  const complexityResults = [];

  for (let i = 0; i < complexityTests.length; i++) {
    const test = complexityTests[i];
    console.log(`\nTest ${i + 1}/${complexityTests.length}: ${test.name} complexity (~${test.targetCount} activities)`);

    try {
      const config = {
        width: 1200,
        height: 800,
        fps: 15,
        duration: 10
      };

      const result = await runTest(config, test.targetCount);
      complexityResults.push(result);

      console.log('Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('❌ Test failed:', error);
      complexityResults.push({ error: error.message, targetCount: test.targetCount });
    }
  }

  results.set4_complexity = complexityResults;

  console.log('\n📊 COMPLEXITY RESULTS:\n');
  console.log('### Set 4: Complexity Impact\n');
  console.log('| Complexity | Activities | Actual Size (MB) | Time (s) |');
  console.log('|------------|-----------|------------------|----------|');
  complexityResults.forEach(r => {
    if (!r.error) {
      const complexity = r.activityCount < 20 ? 'Low' : r.activityCount < 100 ? 'Medium' : 'High';
      console.log(`| ${complexity} | ${r.activityCount} | ${r.sizeMB} | ${r.timeSeconds} |`);
    }
  });

  // Save updated results
  localStorage.setItem('gifSizeExperimentResults', JSON.stringify(results));
  console.log('\n💾 Results saved to localStorage');

  return complexityResults;
}

// Export functions to window for console access
window.runExperiment = runExperiment;
window.testComplexity = testComplexity;
window.getExperimentResults = () => results;
window.printResults = printResults;

console.log('\n' + '='.repeat(60));
console.log('🧪 GIF Size Experiment Script Loaded!');
console.log('='.repeat(60));
console.log('\n📋 Usage:');
console.log('  1. Make sure activities are loaded in the app');
console.log('  2. Run: await runExperiment()');
console.log('  3. Optionally run: await testComplexity()');
console.log('  4. View results again: printResults()');
console.log('\n⏱️  Expected duration: ~15-20 minutes total');
console.log('💡 The experiment will run automatically - just wait for completion!');
console.log('='.repeat(60) + '\n');
