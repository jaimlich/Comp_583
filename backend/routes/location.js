const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching location:', error.message);
    res.status(500).json({ error: 'Error fetching location data' });
  }
});

module.exports = router;
