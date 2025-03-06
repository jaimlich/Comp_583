const express = require('express');
const router = express.Router();

// This is simulated data; in a production system, you might fetch this from a database or external API.
const popularMountains = [
  {
    name: 'Mammoth Mountain',
    latitude: 37.6304,
    longitude: -118.8753,
    weather: 'Snowing',
    hasSnow: true,
    forecastSnow: false,
    forecastDays: null,
    distance: 180,  // in km from Los Angeles
  },
  {
    name: 'Big Bear Mountain',
    latitude: 34.2439,
    longitude: -116.9114,
    weather: 'Clear',
    hasSnow: false,
    forecastSnow: true,
    forecastDays: 2, // snow forecasted in 2 days
    distance: 160,
  },
  {
    name: 'Mt. Baldy',
    latitude: 34.2361,
    longitude: -117.6573,
    weather: 'Partly Cloudy',
    hasSnow: false,
    forecastSnow: false,
    forecastDays: null,
    distance: 70,
  },
  // Add more mountain entries as needed
];

router.get('/', (req, res) => {
  try {
    res.json(popularMountains);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mountains' });
  }
});

// old
// router.get('/', (req, res) => {
//   const { query } = req.query;
//   // For demonstration, we ignore the query parameter and return the static list.
//   res.json(popularMountains);
// });

module.exports = router;
