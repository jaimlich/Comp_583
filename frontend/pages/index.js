import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box, TextField, Button, Typography, Container, Paper,
  IconButton, Drawer, useMediaQuery, Link
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import BookingSystem from "../components/BookingSystem";
import Calendar from "../components/Calendar";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import Snowfall from "../components/Snowfall";
import { useModalStore } from "../store/useModalStore";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mountains, setMountains] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lon: -116.823348, lat: 37.621193 });
  const [mapKey, setMapKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { user, logout } = useAuth();
  const { modalType, openModal, closeModal } = useModalStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
        overflowX: "hidden",
        backgroundColor: "transparent"
      }}
    >
      <Snowfall />
      <Head>
        <title>Snow Mountain Tracker</title>
        <link rel="icon" href="/logo/smt-logo.png" type="image/png" />
      </Head>

      {/* Sticky Header */}
      <Box sx={{ position: "sticky", top: 0, zIndex: 1000, py: 2, background: "#1565c0", color: "white", textAlign: "center" }}>
        <Typography variant="h4">🏔️ Snow Mountain Tracker 🏔️</Typography>
      </Box>

      <Container maxWidth="xl" sx={{ flex: 1, backgroundColor: "transparent" }}>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {isMobile ? (
            <>
              <Button variant="outlined" onClick={() => setSidebarOpen(true)}>☰ Mountains</Button>
              <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <Box sx={{
                  width: 250, p: 2,
                  backgroundImage: "url('/logo/smt-logo.png')",
                  backgroundSize: "80%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  opacity: 0.1
                }}>
                  <Sidebar mountains={mountains} setMapCenter={setMapCenter} />
                </Box>
              </Drawer>
            </>
          ) : (
            <Box
              sx={{
                width: "23%",
                borderRadius: "12px",
                boxShadow: 3,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                height: "63vh",
                overflow: "hidden",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "120%",
                  height: "120%",
                  transform: "translate(-50%, -50%)",
                  backgroundImage: "url('/logo/smt-logo.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  opacity: 0.3,
                  zIndex: 0,
                  pointerEvents: "none"
                }
              }}
            >
              <Box sx={{ zIndex: 1, width: "100%" }}>
                <Sidebar mountains={mountains} setMapCenter={setMapCenter} />
              </Box>
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgba(255, 255, 255, 0.8)", p: 2, mb: 2, display: "flex", alignItems: "center", gap: 1, borderRadius: "10px" }}>
              <TextField
                label="🔍 Search by city or zip code"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
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
                    <Button variant="outlined" color="primary" onClick={() => openModal('login')} sx={{ height: "56px" }}>
                      Login
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => openModal('register')} sx={{ height: "56px" }}>
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
              sx={{
                height: "54.7vh",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: 4,
                position: "relative",
              }}
            >
              <Map center={mapCenter} mountains={mountains} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Box sx={{ flex: 1 }}>
            <BookingSystem mountains={mountains} />
          </Box>

          <Box sx={{ flex: 1.5 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgba(255, 255, 255, 0.8)", p: 3, borderRadius: "12px", height: "100%" }}>
              <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: 6, py: 2, backgroundColor: "#1565c0", color: "white", textAlign: "center" }}>
        <Typography variant="body2">© {new Date().getFullYear()} Snow Mountain Tracker</Typography>
      </Box>

      {/* Floating watermark logo in bottom-right */}
      <Box
        component="img"
        src="/logo/smt-logo.png"
        alt="SMT Watermark"
        sx={{
          position: "fixed",
          bottom: 10,
          right: 10,
          width: 140,
          opacity: 0.87,
          zIndex: 0,
          pointerEvents: "none",
          animation: "floatLogo 6s ease-in-out infinite"
        }}
      />

      {/* Zustand-based modals */}
      {modalType === 'login' && (
        <LoginModal
          onClose={closeModal}
          onSwitchToRegister={() => openModal('register')}
        />
      )}
      {modalType === 'register' && (
        <RegisterModal
          onClose={closeModal}
          onSwitchToLogin={() => openModal('login')}
        />
      )}
    </Box>
  );
};

export default Home;
