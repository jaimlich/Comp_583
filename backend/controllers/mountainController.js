const axios = require("axios");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 }); // Cache weather data for 5 minutes

// List of popular mountains
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

    // Fetch weather data for each mountain
    const mountainWeatherPromises = popularMountains.map(async (mountain) => {
      const cacheKey = `weather_${mountain.latitude}_${mountain.longitude}`;
      const cachedWeather = cache.get(cacheKey);

      if (cachedWeather) {
        return { ...mountain, ...cachedWeather };
      }

      const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=days&key=${apiKey}&contentType=json`;

      try {
        const response = await axios.get(url);
        const days = response.data.days;
        const currentWeather = days[0]; // Today's weather
        const upcomingSnowDayIndex = days.findIndex((day, index) => index > 0 && day.snow > 0); // Future snow days
        const forecastDays = upcomingSnowDayIndex !== -1 ? upcomingSnowDayIndex : null;

        // Get snowfall & rainfall depths
        const snowfallLast24h = days[0].snow || 0;
        const snowfallCurrent = days[0].snowdepth || 0;
        const rainLast24h = days[0].precip || 0;

        // Extract wind speed & road impact factors
        const windSpeed = currentWeather.windspeed || "N/A";
        const visibility = currentWeather.visibility || "N/A";
        const temperature = currentWeather.temp || "N/A";
        const feelsLike = currentWeather.feelslike || "N/A";

        // Determine if chains might be required based on weather conditions
        const chainsRequired = snowfallCurrent > 2 || visibility < 2 || windSpeed > 25;

        const weatherData = {
          weather: currentWeather.conditions || "Unknown",
          temperature,
          feelsLike,
          hasSnow: snowfallCurrent > 0,
          forecastSnow: forecastDays !== null,
          forecastDays,
          snowfallCurrent, // Snow currently on the ground (in inches)
          snowfallLast24h, // Snowfall in the last 24 hours (in inches)
          rainLast24h, // Rainfall in the last 24 hours (in inches)
          windSpeed, // Wind speed in mph
          visibility, // Visibility in miles
          chainsRequired, // Boolean: Are chains likely needed?
        };

        // Cache the response for performance
        cache.set(cacheKey, weatherData);
        return { ...mountain, ...weatherData };

      } catch (error) {
        console.error(`Error fetching weather for ${mountain.name}:`, error.message);
        return { ...mountain, weather: "Unknown", hasSnow: false, forecastSnow: false, forecastDays: null };
      }
    });

    // Resolve all weather promises
    const updatedMountains = await Promise.all(mountainWeatherPromises);
    res.json(updatedMountains);

  } catch (error) {
    console.error("Error retrieving mountains:", error.message);
    res.status(500).json({ error: "Error retrieving mountains" });
  }
};
