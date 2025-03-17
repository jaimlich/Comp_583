import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Box, TextField, Button, Typography, Container, Grid, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import BookingSystem from "../components/BookingSystem";
import Calendar from "../components/Calendar";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mountains, setMountains] = useState([]);
  const [mapKey, setMapKey] = useState(0); // Key to force re-render

  // Fetch mountain data (default is Southern California popular mountains)
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
    setTimeout(() => setMapKey((prevKey) => prevKey + 1), 500); // Force re-render of Map
  }, []);

  const handleSearch = () => {
    fetchMountains(searchQuery);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User position:", position.coords);
          alert(`📍 Location detected: \nLatitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
          // Here, you can update the map with the user's location
        },
        () => alert("Geolocation permission denied or not supported.")
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Box className="snowflake-bg" sx={{ backgroundColor: "#f0f7ff", minHeight: "100vh", pb: 4, px: { xs: 2, md: 4 } }}>
      <Head>
        <Typography variant="h4" sx={{ fontWeight: "bold", textShadow: "1px 1px 5px rgba(0,0,0,0.2)" }}>
        <title>Snow Mountain Tracker</title>
        </Typography>
      </Head>

      {/* Page Title with Snowflake Background */}
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          background: "url('icons/SVG/mountain_no_snow.svg') repeat, #1565c0",
          backgroundSize: "cover",
          color: "white",
          position: "relative",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", textShadow: "1px 1px 5px rgba(0,0,0,0.2)" }}>
          🏔️ Snow Mountain Tracker
        </Typography>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={1} sx={{ mt: 2 }}>
          {/* Sidebar Section */}
          <Grid item xs={12} md={3}>
            <Sidebar mountains={mountains} />
          </Grid>

          {/* Main Content Section */}
          <Grid item xs={12} md={9}>
            {/* Search Bar Section */}
            <Paper elevation={3} sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", gap: 1, borderRadius: "12px" }}>
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

            {/* Map Section (Force Reload if Needed) */}
            <Box
              key={mapKey}
              sx={{
                height: "55vh",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: 3,
                backgroundColor: "#e0e0e0", // Light grey to indicate loading
              }}
            >
              <Map mountains={mountains} />
            </Box>
          </Grid>
        </Grid>

        {/* Booking System & Calendar Row */}
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2, textAlign: "center", fontWeight: "bold", fontSize: "1.2rem", mb: 1 }}>
              🎟️ Book Ski Lift Tickets & 📅 Booking Calendar
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <BookingSystem mountains={mountains} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Calendar />
          </Grid>
        </Grid>

        {/* Divider */}
        <Box sx={{ my: 2, borderBottom: "3px dashed #aaa", width: "80%", mx: "auto" }}></Box>

        {/* Your Bookings Section */}
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
              📅 Your Bookings
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
