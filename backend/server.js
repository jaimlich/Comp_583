require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});
require('./jobs/weatherSync');

const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const locationRoutes = require('./routes/location');
const mountainsRoutes = require('./routes/mountains');
const roadClosuresRoutes = require('./routes/roadClosures');
const reservationsRoutes = require('./routes/reservations');
const bookingRoutes = require('./routes/booking');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Mount routes
app.use('/api/location', locationRoutes);
app.use('/api/mountains', mountainsRoutes);
app.use('/api/road-closures', roadClosuresRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Snow Mountain Tracker Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
