const db = require('../models/database');
const axios = require('axios');

let visualCrossingErrorLogged = false;

const runOnce = async () => {
  try {
    const [mountains] = await db.query('SELECT id, name, latitude, longitude FROM mountains');
    const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;

    if (!apiKey) {
      console.error('❌ VISUAL_CROSSING_API_KEY is missing in .env');
      return;
    }

    for (const mountain of mountains) {
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=current,days&key=${apiKey}&contentType=json`;

      try {
        const { data } = await axios.get(url);
        const weather = data.days?.[0];
        const current = data.currentConditions;

        if (weather && current) {
          await db.query(`
            UPDATE mountains
            SET 
              temperature = ?, 
              snowfallCurrent = ?, 
              forecastSnow = ?, 
              forecastDays = ?, 
              visibility = ?, 
              rainLast24h = ?, 
              chainsRequired = ?, 
              hasSnow = ?, 
              weather = ?, 
              lastUpdated = NOW()
            WHERE id = ?
          `, [
            weather.temp || 32,
            weather.snowdepth || 0,
            weather.snow > 0 ? 1 : 0,
            weather.snow > 0 ? 1 : 0,
            weather.visibility || 10,
            weather.precip || 0,
            weather.snowdepth > 0 ? 1 : 0,
            weather.snowdepth > 0 ? 1 : 0,
            current.conditions || 'Clear',
            mountain.id
          ]);
        }
      } catch (error) {
        if (error.response?.status === 401 && !visualCrossingErrorLogged) {
          console.error('❌ Visual Crossing API Unauthorized (401) — check your API key.');
          visualCrossingErrorLogged = true;
        } else {
          console.error(`❌ Error fetching weather for ${mountain.name}:`, error.message);
        }
      }
    }

    console.log('✅ Mountain weather update cycle completed.');
  } catch (error) {
    console.error('❌ Global Weather Sync Failure:', error.message);
  }
};

// Auto-run every 5 min
runOnce();
setInterval(runOnce, 5 * 60 * 1000);

// Export for manual refresh via POST
module.exports = { runOnce };
