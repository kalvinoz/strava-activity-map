#!/usr/bin/env node

/**
 * Fetch Activities from Strava API
 *
 * Downloads all activities and saves them to local cache.
 */

import fs from 'fs/promises';
import path from 'path';
import StravaClient from '../utils/strava.js';

const ACTIVITIES_FILE = path.join(process.cwd(), 'data', 'activities', 'all_activities.json');

async function main() {
  const client = new StravaClient();

  console.log('Strava Activity Fetcher\n');

  // Check authentication
  const hasToken = await client.loadTokens();
  if (!hasToken) {
    console.error('Not authenticated. Please run: npm run auth');
    process.exit(1);
  }

  try {
    await client.ensureValidToken();
    const athlete = await client.getAthlete();
    console.log(`Authenticated as: ${athlete.firstname} ${athlete.lastname}\n`);

    // Fetch all activities
    console.log('Fetching activities...');
    const activities = await client.getAllActivities((count) => {
      process.stdout.write(`\rActivities fetched: ${count}`);
    });

    console.log(`\n\nTotal activities: ${activities.length}`);

    // Save to file
    await fs.mkdir(path.dirname(ACTIVITIES_FILE), { recursive: true });
    await fs.writeFile(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));

    console.log(`✓ Saved to: ${ACTIVITIES_FILE}`);

    // Print summary statistics
    const stats = activities.reduce((acc, activity) => {
      acc.types[activity.type] = (acc.types[activity.type] || 0) + 1;
      acc.totalDistance += activity.distance || 0;
      acc.totalTime += activity.moving_time || 0;
      return acc;
    }, { types: {}, totalDistance: 0, totalTime: 0 });

    console.log('\nActivity Summary:');
    console.log('─'.repeat(40));
    Object.entries(stats.types)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type.padEnd(20)} ${count}`);
      });
    console.log('─'.repeat(40));
    console.log(`  Total Distance:      ${(stats.totalDistance / 1000).toFixed(2)} km`);
    console.log(`  Total Moving Time:   ${(stats.totalTime / 3600).toFixed(2)} hours`);

    // Check for activities with polylines
    const withPolylines = activities.filter(a => a.map?.summary_polyline).length;
    console.log(`\nActivities with polylines: ${withPolylines}/${activities.length}`);

    if (withPolylines < activities.length) {
      console.log('\nNote: Some activities may not have polylines (indoor activities, privacy zones, etc.)');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.status === 401) {
      console.error('\nAuthentication failed. Please run: npm run auth');
    }
    process.exit(1);
  }
}

main();
