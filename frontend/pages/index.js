import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Box, TextField, Button, Typography, Container, Paper, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import BookingSystem from "../components/BookingSystem";
import Calendar from "../components/Calendar";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mountains, setMountains] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lon: -116.823348, lat: 37.621193 }); // Default: SoCal
  const [mapKey, setMapKey] = useState(0);
  const [modalType, setModalType] = useState(null); // null, 'login', 'register'
  const { user, logout } = useAuth();

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
        setMapKey((prevKey) => prevKey + 1);
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
          setMapKey((prevKey) => prevKey + 1);
        },
        () => alert("Geolocation permission denied or not supported.")
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Box className="snowflake-bg" sx={{ backgroundColor: "#f0f7ff", minHeight: "100vh", pb: 4 }}>
      <Head>
        <title>Snow Mountain Tracker</title>
      </Head>

      <Box sx={{ textAlign: "center", py: 2, background: "#1565c0", color: "white" }}>
        <Typography variant="h4">🏔️ Snow Mountain Tracker</Typography>
      </Box>

      <Container maxWidth="xl">
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Box sx={{ width: "23%" }}>
            <Sidebar mountains={mountains} setMapCenter={setMapCenter} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: "10px",
              }}
            >
              <TextField
                label="🔍 Search by city or zip code"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                sx={{ borderRadius: "8px" }}
              />
              <Button variant="contained" color="primary" onClick={handleSearch} sx={{ height: "56px" }}>
                <SearchIcon /> Search
              </Button>
              <IconButton color="secondary" onClick={handleLocateMe} sx={{ height: "56px" }}>
                <MyLocationIcon fontSize="large" />
              </IconButton>

              <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                {!user ? (
                  <>
                    <Button variant="outlined" color="primary" onClick={() => setModalType('login')} sx={{ height: "56px" }}>
                      Login
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setModalType('register')} sx={{ height: "56px" }}>
                      Register
                    </Button>
                  </>
                ) : (
                  <Button variant="outlined" color="primary" onClick={logout} sx={{ height: "56px" }}>
                    Logout ({user.email})
                  </Button>
                )}
              </Box>
            </Paper>

            <Box
              key={mapKey}
              sx={{ height: "55vh", borderRadius: "12px", overflow: "hidden", boxShadow: 3, backgroundColor: "#e0e0e0" }}
            >
              <Map center={mapCenter} mountains={mountains} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Box sx={{ flex: 1 }}>
            <BookingSystem mountains={mountains} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: "12px" }}>
              <Calendar />
            </Paper>
          </Box>
        </Box>
      </Container>

      {modalType === 'login' && (
        <LoginModal
          onClose={() => setModalType(null)}
          onSwitchToRegister={() => setModalType('register')}
        />
      )}

      {modalType === 'register' && (
        <RegisterModal
          onClose={() => setModalType(null)}
          onSwitchToLogin={() => setModalType('login')}
        />
      )}
    </Box>
  );
};

export default Home;
