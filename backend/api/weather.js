const axios = require('axios');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 1800 }); // 30 minutes

exports.getWeather = async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: 'Missing location parameter' });
  }
  try {
    const cacheKey = `weather_${location}`;
    const cachedWeather = cache.get(cacheKey);
    if (cachedWeather) {
      return res.json(cachedWeather);
    }
    const apiKey = process.env.VISUAL_CROSSING_API_KEY;
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&include=days&key=${apiKey}&contentType=json`;
    const response = await axios.get(url);
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Weather API Error:', error.message);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
};
