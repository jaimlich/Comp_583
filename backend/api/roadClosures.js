const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

exports.getRoadClosures = async (req, res) => {
  try {
    // Placeholder static data; replace with actual API call if available.
    const roadClosures = [
      { id: 1, location: 'I-15 near Big Bear Lake', status: 'Closed', details: 'Accident on the highway.' },
      { id: 2, location: 'CA-138 near Mammoth Lakes', status: 'Delayed', details: 'Heavy snowfall causing delays.' }
    ];
    res.json(roadClosures);
  } catch (error) {
    console.error('Road closures API error:', error.message);
    res.status(500).json({ error: 'Error fetching road closures data' });
  }
};
