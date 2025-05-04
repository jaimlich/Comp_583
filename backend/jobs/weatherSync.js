const db = require('../models/database');
const axios = require('axios');

let visualCrossingErrorLogged = false;

const runOnce = async () => {
  try {
    const [mountains] = await db.query('SELECT id, name, latitude, longitude FROM mountains');
    const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;
    if (!apiKey) return console.error('Missing API key');

    for (const mountain of mountains) {
      await refreshSingleMountain(mountain.name);
    }
    console.log('✅ Mountain weather update cycle completed.');
  } catch (error) {
    console.error('❌ Global Weather Sync Failure:', error.message);
  }
};

async function refreshSingleMountain(name) {
  const [rows] = await db.query("SELECT * FROM mountains WHERE name = ?", [name]);
  const mountain = rows[0];
  if (!mountain) return false;

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=current,days&key=${process.env.VISUAL_CROSSING_WEATHER_API_KEY}&contentType=json`;

  try {
    const { data } = await axios.get(url);
    const day = data.days?.[0];
    const current = data.currentConditions;

    await db.query(`
      UPDATE mountains SET 
        temperature = ?, snowfallCurrent = ?, forecastSnow = ?, forecastDays = ?,
        visibility = ?, rainLast24h = ?, chainsRequired = ?, hasSnow = ?, 
        weather = ?, lastUpdated = NOW()
      WHERE id = ?`, [
      day.temp || 32,
      day.snowdepth || 0,
      day.snow > 0 ? 1 : 0,
      day.snow > 0 ? 1 : 0,
      day.visibility || 10,
      day.precip || 0,
      day.snowdepth > 0 ? 1 : 0,
      day.snowdepth > 0 ? 1 : 0,
      current?.conditions || "Clear",
      mountain.id
    ]);
    return true;
  } catch (err) {
    console.error(`❌ Error refreshing ${name}:`, err.message);
    return false;
  }
}

runOnce();
setInterval(runOnce, 5 * 60 * 1000);

module.exports = { runOnce, refreshSingleMountain };
