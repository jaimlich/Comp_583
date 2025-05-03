const db = require("../models/database");
const axios = require("axios");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;

const runOnce = async () => {
  try {
    const [mountains] = await db.query("SELECT * FROM mountains");

    for (const mountain of mountains) {
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=current,days&key=${apiKey}&contentType=json`;

      try {
        const { data } = await axios.get(url);
        const today = data.days[0];
        const current = data.currentConditions;

        await db.query(`
          UPDATE mountains SET
            temperature = ?, snowfallCurrent = ?, forecastSnow = ?, forecastDays = ?,
            visibility = ?, rainLast24h = ?, chainsRequired = ?, hasSnow = ?, weather = ?, lastUpdated = NOW()
          WHERE id = ?
        `, [
          today.temp || 32,
          today.snowdepth || 0,
          today.snow > 0 ? 1 : 0,
          today.snow > 0 ? 1 : 0,
          today.visibility || 10,
          today.precip || 0,
          today.snowdepth > 0 ? 1 : 0,
          today.snowdepth > 0 ? 1 : 0,
          current?.conditions || "Clear",
          mountain.id
        ]);

      } catch (err) {
        console.error(`⚠️ Failed weather update for ${mountain.name}:`, err.message);
      }

      await delay(1000);
    }

    console.log("✅ Weather sync complete.");
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  }
};

runOnce();
setInterval(runOnce, 5 * 60 * 1000);

module.exports = { runOnce };
