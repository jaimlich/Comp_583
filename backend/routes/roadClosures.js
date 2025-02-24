const express = require('express');
const router = express.Router();

// Simulated road closure data. Replace with a real API if available.
const roadClosures = [
  { id: 1, location: 'I-15 near Big Bear', status: 'Closed', details: 'Accident on highway.' },
  { id: 2, location: 'CA-138 near Mammoth', status: 'Delayed', details: 'Heavy snowfall causing delays.' }
];

router.get('/', (req, res) => {
  res.json(roadClosures);
});

module.exports = router;
