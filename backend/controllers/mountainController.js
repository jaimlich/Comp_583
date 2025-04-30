const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 900 }); // cache weather for 15 min

const popularMountains = [
  { name: "Mammoth Mountain", latitude: 37.6304, longitude: -118.8753, distance: 112 },     // CA
  { name: "Big Bear Mountain", latitude: 34.2364, longitude: -116.8893, distance: 99 },     // CA
  { name: "Mt. Baldy", latitude: 34.2701, longitude: -117.6220, distance: 43 },             // CA
  { name: "Breckenridge", latitude: 39.4817, longitude: -106.0384, distance: 80 },          // CO
  { name: "Vail", latitude: 39.6403, longitude: -106.3742, distance: 100 },                 // CO
  { name: "Aspen Snowmass", latitude: 39.2089, longitude: -106.9496, distance: 120 },       // CO
  { name: "Park City Mountain", latitude: 40.6514, longitude: -111.5070, distance: 33 },    // UT
  { name: "Deer Valley Resort", latitude: 40.6203, longitude: -111.4780, distance: 35 },    // UT
  { name: "Jackson Hole", latitude: 43.5873, longitude: -110.8270, distance: 10 },          // WY
  { name: "Killington", latitude: 43.6266, longitude: -72.7967, distance: 140 },            // VT
  { name: "Stowe Mountain Resort", latitude: 44.5336, longitude: -72.7815, distance: 130 }, // VT
  { name: "Whiteface Mountain", latitude: 44.3650, longitude: -73.9021, distance: 130 },    // NY
  { name: "Mount Hood Meadows", latitude: 45.3313, longitude: -121.6623, distance: 67 },    // OR
  { name: "Steamboat Resort", latitude: 40.4570, longitude: -106.8054, distance: 157 },     // CO
  { name: "Heavenly Mountain", latitude: 38.9351, longitude: -119.9398, distance: 190 },    // CA/NV
];

exports.getMountains = async (req, res) => {
  try {
    const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;

    const mountainWeatherPromises = popularMountains.map(async (mountain) => {
      const cacheKey = `weather_${mountain.latitude}_${mountain.longitude}`;
      const cached = cache.get(cacheKey);
      if (cached) return { ...mountain, ...cached };

      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=current,days&key=${apiKey}&contentType=json`;

      try {
        const { data } = await axios.get(url);
        const today = data.days[0];
        const upcomingSnowDayIndex = data.days.findIndex((d, i) => i > 0 && d.snow > 0);
        const forecastDays = upcomingSnowDayIndex !== -1 ? upcomingSnowDayIndex : null;

        const weatherData = {
          weather: data.currentConditions?.conditions || null,
          temperature: today.temp,
          feelsLike: today.feelslike,
          snowfallCurrent: today.snowdepth || 0,
          snowfallLast24h: today.snow || 0,
          rainLast24h: today.precip || 0,
          visibility: today.visibility || "N/A",
          windSpeed: today.windspeed || "N/A",
          chainsRequired: today.snowdepth > 2 || today.visibility < 2 || today.windspeed > 25,
          hasSnow: today.snowdepth > 0,
          forecastSnow: forecastDays !== null,
          forecastDays,
        };

        cache.set(cacheKey, weatherData);
        return { ...mountain, ...weatherData };

      } catch (err) {
        console.error(`⚠️ Error fetching weather for ${mountain.name}:`, err.response?.status || err.message);
        return { ...mountain, hasSnow: false, forecastSnow: false };
      }
    });

    const result = await Promise.all(mountainWeatherPromises);
    res.json(result);

  } catch (err) {
    console.error("Mountain fetch error:", err.message);
    res.status(500).json({ message: "Error retrieving mountain data" });
  }
};
