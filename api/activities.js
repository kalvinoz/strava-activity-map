/**
 * Vercel Serverless Function
 * Fetches activities from Strava API
 */
import axios from 'axios';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const accessToken = process.env.STRAVA_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ error: 'Strava token not configured' });
    }

    // Fetch all activities (paginated)
    const allActivities = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          page,
          per_page: perPage
        }
      });

      if (response.data.length === 0) break;

      allActivities.push(...response.data);

      if (response.data.length < perPage) break;

      page++;
    }

    return res.status(200).json(allActivities);

  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({
      error: 'Failed to fetch activities',
      message: error.message
    });
  }
}
