import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Box, TextField, Button, Typography, Container, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import BookingSystem from "../components/BookingSystem";
import Calendar from "../components/Calendar";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mountains, setMountains] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lon: -116.823348, lat: 37.621193 }); // Default: SoCal
  const [mapKey, setMapKey] = useState(0); // Force re-render of map when center changes

  // Fetch mountain data (default: Southern California popular mountains)
  const fetchMountains = async (query = "Southern California") => {
    try {
      const response = await fetch(`http://localhost:5000/api/mountains?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Mountains API not found");
      const data = await response.json();
      setMountains(data);
    } catch (error) {
      console.error("Error fetching mountain data:", error);
    }
  };

  useEffect(() => {
    fetchMountains();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter({ lat: parseFloat(lat), lon: parseFloat(lon) });
        setMapKey((prevKey) => prevKey + 1); // Force re-render
      } else {
        alert("Location not found. Try another city or zip code.");
      }
    } catch (error) {
      console.error("Error fetching search location:", error);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setMapKey((prevKey) => prevKey + 1); // Force re-render
        },
        () => alert("Geolocation permission denied or not supported.")
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Box className="snowflake-bg" sx={{ backgroundColor: "#f0f7ff", minHeight: "100vh", pb: 4, position: "relative" }}>
      <Head>
        <title>Snow Mountain Tracker</title>
      </Head>

      {/* Page Title with Snowflake Background */}
      <Box
        sx={{
          textAlign: "center",
          py: 2,
          background: "url('icons/SVG/mountain_no_snow.svg') repeat, #1565c0",
          backgroundSize: "cover",
          color: "white",
          position: "relative",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", textShadow: "2px 2px 8px rgba(0,0,0,0.4)" }}>
          🏔️ Snow Mountain Tracker
        </Typography>
      </Box>

      <Container maxWidth="xl">
        {/* Main Content Layout */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {/* Sidebar Section */}
          <Box sx={{ width: "23%" }}>
            <Sidebar mountains={mountains} setMapCenter={setMapCenter} />
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Search Bar */}
            <Paper elevation={3} sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 1, borderRadius: "10px" }}>
              <TextField
                label="🔍 Search by city or zip code"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                sx={{ borderRadius: "8px" }}
              />
              <Button variant="contained" color="primary" onClick={handleSearch} sx={{ minWidth: "120px", height: "56px" }}>
                <SearchIcon /> Search
              </Button>
              <IconButton color="secondary" onClick={handleLocateMe} sx={{ height: "56px" }}>
                <MyLocationIcon fontSize="large" />
              </IconButton>
            </Paper>

            {/* Map Section */}
            <Box key={mapKey} sx={{ height: "55vh", borderRadius: "12px", overflow: "hidden", boxShadow: 3, backgroundColor: "#e0e0e0" }}>
              <Map center={mapCenter} mountains={mountains} />
            </Box>
          </Box>
        </Box>

        {/* Booking System & Calendar Row (Two-Column Layout) */}
        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          {/* 🎟️ Book Your Spot */}
          <Box sx={{ flex: 1 }}>
            <BookingSystem mountains={mountains} />
          </Box>

          {/* 📅 Calendar with Date Selection */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: "12px" }}>
              <Calendar />
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
