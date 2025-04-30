const express = require('express');
const router = express.Router();
const mountainController = require('../controllers/mountainController');
const weatherSync = require('../jobs/weatherSync');

router.get('/', mountainController.getMountains);

// New: Refresh weather data manually
router.post('/refresh', async (req, res) => {
  try {
    await weatherSync.runOnce();
    res.status(200).json({ message: 'Mountain weather refreshed.' });
  } catch (err) {
    console.error('❌ Manual weather refresh failed:', err.message);
    res.status(500).json({ error: 'Failed to refresh weather' });
  }
});

module.exports = router;
