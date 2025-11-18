#!/usr/bin/env node

/**
 * Strava OAuth Authentication Script
 *
 * This script starts a local server and opens a browser
 * to authenticate with Strava and obtain access tokens.
 */

import http from 'http';
import { exec } from 'child_process';
import { URL } from 'url';
import StravaClient from '../utils/strava.js';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const client = new StravaClient();

// Check if already authenticated
const hasToken = await client.loadTokens();
if (hasToken) {
  console.log('Already authenticated! Verifying token...');
  try {
    await client.ensureValidToken();
    const athlete = await client.getAthlete();
    console.log(`✓ Authenticated as ${athlete.firstname} ${athlete.lastname}`);
    process.exit(0);
  } catch (error) {
    console.log('Token invalid or expired. Re-authenticating...');
  }
}

// Start local server to handle OAuth callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body>
            <h1>Authentication Failed</h1>
            <p>Error: ${error}</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
      console.error('Authentication failed:', error);
      process.exit(1);
    }

    if (code) {
      try {
        console.log('Exchanging code for token...');
        const tokens = await client.exchangeToken(code);

        const athlete = await client.getAthlete();

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Authentication Successful</title></head>
            <body>
              <h1>Authentication Successful!</h1>
              <p>Welcome, ${athlete.firstname} ${athlete.lastname}!</p>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);

        console.log(`✓ Successfully authenticated as ${athlete.firstname} ${athlete.lastname}`);
        console.log('Tokens saved to data/tokens.json');

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);

      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Error</title></head>
            <body>
              <h1>Error</h1>
              <p>${error.message}</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        console.error('Error exchanging token:', error.message);
        process.exit(1);
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Local server started on http://localhost:${PORT}`);
  console.log('Opening browser for Strava authentication...');

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${client.clientId}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=activity:read_all`;

  console.log(`\nIf browser doesn't open, visit this URL:\n${authUrl}\n`);

  // Open browser
  const openCommand = process.platform === 'darwin' ? 'open' :
                     process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${openCommand} "${authUrl}"`);
});
