/**
 * GIF Size Estimation Experiment Runner
 * Can be triggered from the browser console or via a UI button
 */

export class ExperimentRunner {
  constructor(gifExporter, activities) {
    this.gifExporter = gifExporter;
    this.activities = activities;
    this.results = {
      set1_dimensions: [],
      set2_fps: [],
      set3_duration: [],
      set4_complexity: []
    };
  }

  /**
   * Test configurations based on experiment plan
   */
  getTestSets() {
    return {
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
  }

  /**
   * Get date range that contains approximately the target number of activities
   */
  getDateRangeForActivityCount(targetCount) {
    if (!this.activities || this.activities.length === 0) {
      throw new Error('No activities loaded');
    }

    // Sort activities by date
    const sorted = [...this.activities].sort((a, b) =>
      new Date(a.start_date) - new Date(b.start_date)
    );

    // Find a range with target count
    const midIndex = Math.floor(sorted.length / 2);
    const startIndex = Math.max(0, midIndex - Math.floor(targetCount / 2));
    const endIndex = Math.min(sorted.length - 1, startIndex + targetCount - 1);

    const start = new Date(sorted[startIndex].start_date);
    const end = new Date(sorted[endIndex].start_date);
    const actualCount = endIndex - startIndex + 1;

    return { start, end, activityCount: actualCount };
  }

  /**
   * Run a single export test
   */
  async runTest(config, targetActivityCount = 50) {
    console.log('Running test with config:', config);

    // Get date range for specified activity count
    const dateRange = this.getDateRangeForActivityCount(targetActivityCount);

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
    const blob = await this.gifExporter.export(exportConfig);

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

    console.log('Test result:', result);

    return result;
  }

  /**
   * Run all tests in a set
   */
  async runTestSet(setName, setConfig, onProgress = null) {
    console.log(`\n=== ${setConfig.name} ===\n`);

    const setResults = [];

    for (let i = 0; i < setConfig.tests.length; i++) {
      const testConfig = { ...setConfig.fixed, ...setConfig.tests[i] };
      console.log(`\nTest ${i + 1}/${setConfig.tests.length}:`);

      if (onProgress) {
        onProgress(setName, i + 1, setConfig.tests.length, testConfig);
      }

      try {
        const result = await this.runTest(testConfig);
        setResults.push(result);

        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Test failed:`, error);
        setResults.push({ config: testConfig, error: error.message });
      }
    }

    this.results[setName] = setResults;
    return setResults;
  }

  /**
   * Run the full experiment
   */
  async runAllTests(onProgress = null) {
    console.log('Starting GIF Size Estimation Experiment');
    console.log('Total activities loaded:', this.activities?.length || 0);

    if (!this.activities || this.activities.length < 100) {
      throw new Error('Need at least 100 activities for meaningful results');
    }

    const testSets = this.getTestSets();

    // Run each test set
    await this.runTestSet('set1_dimensions', testSets.set1_dimensions, onProgress);
    await this.runTestSet('set2_fps', testSets.set2_fps, onProgress);
    await this.runTestSet('set3_duration', testSets.set3_duration, onProgress);

    // Print summary
    console.log('\n=== EXPERIMENT COMPLETE ===\n');
    this.printResults();

    return this.results;
  }

  /**
   * Test complexity impact with different date ranges
   */
  async testComplexity(onProgress = null) {
    console.log('\n=== Set 4: Complexity Impact ===\n');

    const complexityTests = [
      { name: 'Low', targetCount: 10 },
      { name: 'Medium', targetCount: 50 },
      { name: 'High', targetCount: 200 }
    ];

    const complexityResults = [];

    for (let i = 0; i < complexityTests.length; i++) {
      const test = complexityTests[i];
      console.log(`\nTesting ${test.name} complexity (~${test.targetCount} activities):`);

      if (onProgress) {
        onProgress('set4_complexity', i + 1, complexityTests.length, { complexity: test.name });
      }

      try {
        const config = {
          width: 1200,
          height: 800,
          fps: 15,
          duration: 10
        };

        const result = await this.runTest(config, test.targetCount);
        complexityResults.push(result);

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Test failed:', error);
      }
    }

    this.results.set4_complexity = complexityResults;

    console.log('\n### Set 4: Complexity Impact\n');
    console.log('| Complexity | Activities | Actual Size (MB) | Time (s) |');
    console.log('|------------|-----------|------------------|----------|');
    complexityResults.forEach(r => {
      if (!r.error) {
        const complexity = r.activityCount < 20 ? 'Low' : r.activityCount < 100 ? 'Medium' : 'High';
        console.log(`| ${complexity} | ${r.activityCount} | ${r.sizeMB} | ${r.timeSeconds} |`);
      }
    });

    return complexityResults;
  }

  /**
   * Print results in markdown table format
   */
  printResults() {
    console.log('\n### Set 1: Dimension Impact\n');
    console.log('| Width | Height | Megapixels | Total Frames | Actual Size (MB) | Time (s) |');
    console.log('|-------|--------|------------|--------------|------------------|----------|');
    this.results.set1_dimensions.forEach(r => {
      if (!r.error) {
        console.log(`| ${r.config.width} | ${r.config.height} | ${r.megapixels} | ${r.totalFrames} | ${r.sizeMB} | ${r.timeSeconds} |`);
      }
    });

    console.log('\n### Set 2: FPS Impact\n');
    console.log('| FPS | Total Frames | Actual Size (MB) | Time (s) |');
    console.log('|-----|--------------|------------------|----------|');
    this.results.set2_fps.forEach(r => {
      if (!r.error) {
        console.log(`| ${r.config.fps} | ${r.totalFrames} | ${r.sizeMB} | ${r.timeSeconds} |`);
      }
    });

    console.log('\n### Set 3: Duration Impact\n');
    console.log('| Duration | Total Frames | Actual Size (MB) | Time (s) |');
    console.log('|----------|--------------|------------------|----------|');
    this.results.set3_duration.forEach(r => {
      if (!r.error) {
        console.log(`| ${r.config.duration} | ${r.totalFrames} | ${r.sizeMB} | ${r.timeSeconds} |`);
      }
    });
  }

  /**
   * Get results as JSON
   */
  getResults() {
    return this.results;
  }

  /**
   * Export results as downloadable JSON file
   */
  exportResults() {
    const dataStr = JSON.stringify(this.results, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gif-size-experiment-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
