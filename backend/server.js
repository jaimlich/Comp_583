require('dotenv').config();
const express = require('express');
const cors = require('cors');

const locationRoutes = require('./routes/location');
const mountainsRoutes = require('./routes/mountains');
const roadClosuresRoutes = require('./routes/roadClosures');
const reservationsRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/location', locationRoutes);
app.use('/api/mountains', mountainsRoutes);
app.use('/api/road-closures', roadClosuresRoutes);
app.use('/api/reservations', reservationsRoutes);

app.get('/', (req, res) => {
  res.send('Snow Mountain Tracker Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
