const db = require("../models/database");
const NodeCache = require("node-cache");
const axios = require("axios");
const cache = new NodeCache({ stdTTL: 900 });

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;

exports.getMountains = async (req, res) => {
  try {
    // First, check if mountain records exist in DB
    const [rows] = await db.query("SELECT * FROM mountains");
    if (rows.length > 0) {
      return res.json(rows);
    }

    // If empty, fallback to Visual Crossing API
    const popularMountains = [
      { name: "Mammoth Mountain", latitude: 37.63, longitude: -118.875 },
      { name: "Big Bear Mountain", latitude: 34.2364, longitude: -116.8893 },
      { name: "Mt. Baldy", latitude: 34.2701, longitude: -117.6220 },
      { name: "Breckenridge", latitude: 39.4817, longitude: -106.0384 },
      { name: "Vail", latitude: 39.6403, longitude: -106.3742 },
      { name: "Aspen Snowmass", latitude: 39.2089, longitude: -106.9496 },
      { name: "Park City Mountain", latitude: 40.6514, longitude: -111.5070 },
      { name: "Deer Valley Resort", latitude: 40.6203, longitude: -111.4780 },
      { name: "Jackson Hole", latitude: 43.5873, longitude: -110.8270 },
      { name: "Killington", latitude: 43.6266, longitude: -72.7967 },
      { name: "Stowe Mountain Resort", latitude: 44.5336, longitude: -72.7815 },
      { name: "Whiteface Mountain", latitude: 44.365, longitude: -73.9021 },
      { name: "Mount Hood Meadows", latitude: 45.3313, longitude: -121.6623 },
      { name: "Steamboat Resort", latitude: 40.457, longitude: -106.8054 },
      { name: "Heavenly Mountain", latitude: 38.9351, longitude: -119.9398 }
    ];

    const result = [];

    for (const mountain of popularMountains) {
      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=current,days&key=${apiKey}&contentType=json`;

      try {
        const { data } = await axios.get(url);
        const today = data.days[0];
        const upcomingSnowDayIndex = data.days.findIndex((d, i) => i > 0 && d.snow > 0);
        const forecastDays = upcomingSnowDayIndex !== -1 ? upcomingSnowDayIndex : null;

        const weatherData = {
          temperature: today.temp || 32,
          snowfallCurrent: today.snowdepth || 0,
          forecastSnow: forecastDays !== null,
          forecastDays: forecastDays || 0,
          visibility: today.visibility || 10,
          rainLast24h: today.precip || 0,
          chainsRequired: today.snowdepth > 2 || today.visibility < 2,
          hasSnow: today.snowdepth > 0,
          weather: data.currentConditions?.conditions || "Clear"
        };

        await db.query(`
          INSERT INTO mountains (name, latitude, longitude, temperature, snowfallCurrent, forecastSnow, forecastDays, visibility, rainLast24h, chainsRequired, hasSnow, weather, lastUpdated)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          mountain.name, mountain.latitude, mountain.longitude,
          weatherData.temperature, weatherData.snowfallCurrent,
          weatherData.forecastSnow, weatherData.forecastDays,
          weatherData.visibility, weatherData.rainLast24h,
          weatherData.chainsRequired, weatherData.hasSnow,
          weatherData.weather
        ]);

        result.push({ ...mountain, ...weatherData });

      } catch (err) {
        console.error(`⚠️ Failed API fetch for ${mountain.name}:`, err.response?.status || err.message);
        result.push({ ...mountain, weather: "Unavailable" });
      }

      await delay(1500);
    }

    res.json(result);
  } catch (err) {
    console.error("❌ MountainController error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
