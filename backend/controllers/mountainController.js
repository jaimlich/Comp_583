const axios = require('axios');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 });
const geolib = require("geolib");

const LOS_ANGELES_COORDS = { latitude: 34.0522, longitude: -118.2437 };

exports.getMountains = async (req, res) => {
    const { location = "Los Angeles" } = req.query;

    try {
        let cacheKey = `weather_${location}`;
        let cachedWeather = cache.get(cacheKey);
        if (cachedWeather) {
            return res.json(cachedWeather);
        }

        const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=us&include=days,current&key=${apiKey}&contentType=json`;

        const response = await axios.get(url);
        console.log("Weather API Response:", response.data); // Debugging
        const weatherData = response.data;
        const forecast = weatherData.days.slice(0, 7);

        if (!response.data.currentConditions) {
            console.error("Weather data is missing:", response.data);
        }

        // Assume we have a list of mountains with coordinates
        const mountains = [
            { name: "Big Bear", latitude: 34.2636, longitude: -116.8456 },
            { name: "Mammoth Mountain", latitude: 37.6308, longitude: -119.0322 }
        ];

        const processedMountains = mountains.map(mountain => {
            const distance = geolib.getDistance(
                { latitude: LOS_ANGELES_COORDS.latitude, longitude: LOS_ANGELES_COORDS.longitude },
                { latitude: mountain.latitude, longitude: mountain.longitude }
            );

            const distanceInMiles = (distance / 1609.34).toFixed(1);

            const todayWeather = forecast[0];
            const hasSnow = todayWeather.snow > 0 ? "Snowing" : "No Snow";

            return {
                name: mountain.name,
                distance: `${distanceInMiles} mi`,
                weather: todayWeather.conditions,
                forecast: forecast,
                hasSnow: hasSnow
            };
        });

        cache.set(cacheKey, processedMountains);

        res.json(processedMountains);
    } catch (error) {
        console.error("Weather API Error:", error.message);
        console.log("Weather API Response:", response.data);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
};
