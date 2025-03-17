const express = require('express');
const router = express.Router();
const mountainController = require('../controllers/mountainController');

router.get('/', mountainController.getMountains);

router.get('/', (req, res) => {
  try {
    res.json(popularMountains);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mountains' });
  }
});

module.exports = router;
