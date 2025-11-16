import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const TOKEN_FILE = path.join(process.cwd(), 'data', 'tokens.json');

/**
 * Strava API Client
 */
class StravaClient {
  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID;
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET;
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = null;
  }

  /**
   * Load tokens from file
   */
  async loadTokens() {
    try {
      const data = await fs.readFile(TOKEN_FILE, 'utf-8');
      const tokens = JSON.parse(data);
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.expiresAt = tokens.expires_at;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save tokens to file
   */
  async saveTokens(tokens) {
    await fs.mkdir(path.dirname(TOKEN_FILE), { recursive: true });
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = tokens.expires_at;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeToken(code) {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code'
    });

    await this.saveTokens(response.data);
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: 'refresh_token'
    });

    await this.saveTokens(response.data);
    return response.data;
  }

  /**
   * Ensure we have a valid access token
   */
  async ensureValidToken() {
    await this.loadTokens();

    if (!this.accessToken) {
      throw new Error('No access token. Please run authentication first.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (this.expiresAt && this.expiresAt - now < 300) {
      console.log('Token expired or expiring soon, refreshing...');
      await this.refreshAccessToken();
    }
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, params = {}) {
    await this.ensureValidToken();

    const response = await axios.get(`${STRAVA_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      },
      params
    });

    return response.data;
  }

  /**
   * Get athlete's activities with pagination
   */
  async getActivities(page = 1, perPage = 200) {
    return this.request('/athlete/activities', {
      page,
      per_page: perPage
    });
  }

  /**
   * Get all activities (handles pagination)
   */
  async getAllActivities(onProgress = null) {
    const allActivities = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      console.log(`Fetching page ${page}...`);
      const activities = await this.getActivities(page, perPage);

      if (activities.length === 0) {
        break;
      }

      allActivities.push(...activities);

      if (onProgress) {
        onProgress(allActivities.length);
      }

      if (activities.length < perPage) {
        break; // Last page
      }

      page++;

      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return allActivities;
  }

  /**
   * Get detailed activity with streams
   */
  async getActivity(activityId) {
    return this.request(`/activities/${activityId}`);
  }

  /**
   * Get activity streams (polyline, time, distance, etc.)
   */
  async getActivityStreams(activityId, types = ['latlng', 'time', 'distance']) {
    return this.request(`/activities/${activityId}/streams`, {
      keys: types.join(','),
      key_by_type: true
    });
  }

  /**
   * Get athlete profile
   */
  async getAthlete() {
    return this.request('/athlete');
  }
}

export default StravaClient;
