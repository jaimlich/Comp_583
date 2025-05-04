const express = require('express');
const router = express.Router();
const mountainController = require('../controllers/mountainController');
const weatherSync = require('../jobs/weatherSync');

router.get('/', mountainController.getMountains);

router.post('/refresh', async (req, res) => {
  try {
    await weatherSync.runOnce();
    res.status(200).json({ message: 'Mountain weather refreshed.' });
  } catch (err) {
    console.error('❌ Manual weather refresh failed:', err.message);
    res.status(500).json({ error: 'Failed to refresh weather' });
  }
});

router.post('/refresh-one', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: "Missing name" });

  try {
    const updated = await weatherSync.refreshSingleMountain(name);
    if (!updated) throw new Error("Refresh failed");
    res.json({ message: "Mountain updated", name });
  } catch (err) {
    console.error("Error refreshing single mountain:", err.message);
    res.status(500).json({ error: "Failed to refresh mountain" });
  }
});

module.exports = router;
