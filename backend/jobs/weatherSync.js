const db = require('../models/database');
const axios = require('axios');
const haversine = require("haversine-distance");
const roadClosureCache = require("../utils/roadClosureCache");

const STALE_THRESHOLD_MS = 3 * 60 * 60 * 1000;

const runOnce = async () => {
  try {
    const [mountains] = await db.query(
      'SELECT id, name, latitude, longitude, lastUpdated FROM mountains'
    );

    const apiKey = process.env.VISUAL_CROSSING_WEATHER_API_KEY;
    if (!apiKey) return console.error('Missing weather API key');

    const now = Date.now();
    const staleMountains = mountains.filter(m =>
      !m.lastUpdated || new Date(m.lastUpdated).getTime() < now - STALE_THRESHOLD_MS
    );

    if (staleMountains.length === 0) {
      console.log('🟢 All mountains are up to date — skipping weather sync.');
    } else {
      for (const mountain of staleMountains) {
        await refreshSingleMountain(mountain);
      }
      console.log(`✅ Updated ${staleMountains.length} mountain(s)`);
    }
  } catch (error) {
    console.error('❌ Global Weather Sync Failure:', error.message);
  }
};

async function refreshSingleMountain(mountain) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${mountain.latitude},${mountain.longitude}?unitGroup=us&include=current,days&key=${process.env.VISUAL_CROSSING_WEATHER_API_KEY}&contentType=json`;

  try {
    const { data } = await axios.get(url);
    const day = data.days?.[0];
    const current = data.currentConditions;

    await db.query(`
      UPDATE mountains SET 
        temperature = ?, snowfallCurrent = ?, forecastSnow = ?, forecastDays = ?,
        visibility = ?, rainLast24h = ?, chainsRequired = ?, hasSnow = ?, 
        weather = ?, lastUpdated = NOW()
      WHERE id = ?`, [
      day.temp || 32,
      day.snowdepth || 0,
      day.snow > 0 ? 1 : 0,
      day.snow > 0 ? 1 : 0,
      day.visibility || 10,
      day.precip || 0,
      day.snowdepth > 0 ? 1 : 0,
      day.snowdepth > 0 ? 1 : 0,
      current?.conditions || "Clear",
      mountain.id
    ]);

    console.log(`🔄 Updated weather for ${mountain.name}`);
  } catch (err) {
    console.error(`❌ Error refreshing ${mountain.name}:`, err.response?.status || err.message);
  }
}

async function refreshRoadClosures() {
  try {
    const [mountains] = await db.query("SELECT name, latitude, longitude FROM mountains");

    // 🔁 Inject mock closures in development mode if flag is set
    if (process.env.USE_MOCK_CLOSURES === "true") {
      console.warn("⚠️ Using mock closures (USE_MOCK_CLOSURES=true)");

      const mockClosures = [
        {
          id: "mock-1",
          location: "Mock Closure near Big Bear",
          lat: 34.27,
          lon: -116.88,
          status: "Closed",
          details: "Mocked for development.",
          source: "https://example.com"
        },
        {
          id: "mock-2",
          location: "Mock Closure near Mammoth",
          lat: 37.63,
          lon: -118.875,
          status: "Delayed",
          details: "Testing display of delayed roads.",
          source: "https://example.com"
        }
      ];

      roadClosureCache.setClosures(mockClosures);
      return;
    }

    // 🛰️ Live Overpass fetch
    const closures = [];

    for (const mtn of mountains) {
      const lat = parseFloat(mtn.latitude);
      const lon = parseFloat(mtn.longitude);
      const radius = 16000;

      const query = `
        [out:json];
        (
          way["highway"]["access"="no"](around:${radius},${lat},${lon});
          way["highway"]["construction"](around:${radius},${lat},${lon});
          way["highway"]["disused"](around:${radius},${lat},${lon});
        );
        out center;
      `;

      const res = await axios.post("https://overpass-api.de/api/interpreter", `data=${encodeURIComponent(query)}`, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      for (const el of res.data.elements || []) {
        if (!el.center || !el.tags) continue;

        closures.push({
          id: `osm-${el.id}`,
          location: el.tags.name || `near ${mtn.name}`,
          lat: el.center.lat,
          lon: el.center.lon,
          status: el.tags.construction ? "Construction" : el.tags.disused ? "Disused" : "Closed",
          details: el.tags.highway ? `Tagged as: ${el.tags.highway}` : "Unknown type",
          source: `https://openstreetmap.org/way/${el.id}`
        });

        console.log("📍 Creating closure marker:", el.tags.name || `near ${mtn.name}`, el.center.lat, el.center.lon);
      }
    }

    roadClosureCache.setClosures(closures);
    console.log(`🚦 Synced ${closures.length} closures from Overpass`);
  } catch (err) {
    console.error("❌ Road closure sync failed:", err.message);
  }
}

// Run now
runOnce();
refreshRoadClosures();

// Re-run every 3 hours
setInterval(() => {
  runOnce();
  refreshRoadClosures();
}, 3 * 60 * 60 * 1000);

module.exports = { runOnce, refreshSingleMountain };
