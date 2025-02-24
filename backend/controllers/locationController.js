const axios = require('axios');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 });

exports.getLocation = async (req, res) => {
    try {
        // Check cache for location data
        let cachedLocation = cache.get("location");
        if (cachedLocation) {
            return res.json(cachedLocation);
        }
        // Fetch location data from ipinfo.io
        const response = await axios.get(`https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`);
        cache.set("location", response.data);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching location data' });
    }
};
