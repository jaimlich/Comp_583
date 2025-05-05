import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  Box, TextField, Button, Typography, Container, Paper,
  IconButton, Drawer, useMediaQuery, Menu, MenuItem, Avatar, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";
import MountainFilter from "../components/MountainFilter";
import BookingSystem from "../components/BookingSystem";
import Calendar from "../components/Dashboard";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import Snowfall from "../components/Snowfall";
import { useModalStore } from "../store/useModalStore";
import { useRouter } from "next/router";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [mountains, setMountains] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [filters, setFilters] = useState({
    showHasSnow: true,
    showForecastSnow: true,
    showNoSnow: true,
    forecastDays: 7
  });
  const [mapKey, setMapKey] = useState(0);
  const [hoveredMountain, setHoveredMountain] = useState(null);
  const [lockedMountain, setLockedMountain] = useState(null);
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const { modalType, openModal, closeModal } = useModalStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    const fetchMountains = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/mountains");
        if (!response.ok) throw new Error("Mountains API not found");
        const data = await response.json();
        setMountains(data);
      } catch (error) {
        console.error("Error fetching mountain data:", error);
      }
    };
    fetchMountains();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter({ lat: parseFloat(lat), lon: parseFloat(lon) });
        setMapKey((prev) => prev + 1);
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setMapKey((prev) => prev + 1);
      },
      () => alert("Permission denied.")
    );
  };

  const handleMountainHover = (mtn) => {
    if (!lockedMountain || mtn?.name !== lockedMountain?.name) {
      setHoveredMountain(mtn);
    }
  };

  const handleMountainSelect = (mtn) => {
    setLockedMountain(mtn);
    setSelectedMountain(mtn);
    setHoveredMountain(mtn);
  };

  const handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleViewProfile = () => {
    router.push("/profile");
    handleMenuClose();
  };

  const handleMyBookings = () => {
    router.push("/my-bookings");
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/mountains/refresh", { method: "POST" });
      if (!res.ok) throw new Error("Refresh failed");

      const updated = await fetch("http://localhost:5000/api/mountains");
      const data = await updated.json();
      setMountains(data);
    } catch (err) {
      console.error("Error refreshing mountain weather:", err.message);
      alert("Failed to refresh weather.");
    } finally {
      setRefreshing(false);
    }
  };

  const getInitials = () => {
    if (user?.name) return user.name[0].toUpperCase();
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, overflowX: "hidden", backgroundColor: "transparent", pb: "80px" }}>
      <Snowfall />
      <Head>
        <title>Snow Mountain Tracker</title>
        <link rel="icon" href="/logo/smt-logo.png" />
      </Head>

      {/* Sticky Header */}
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          py: 1.6,
          px: 4,
          backgroundColor: scrolled ? "#104ca1" : "#1565c0",
          color: "white",
          zIndex: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s"
        }}
      >
        <Typography variant="h4" sx={{ animation: "fadeInDown 0.5s ease-in-out" }}>
          🏔️ Snow Mountain Tracker 🏔️
        </Typography>

        {/* Auth controls fixed to the right */}
        <Box sx={{ position: "absolute", right: 24, display: "flex", gap: 1 }}>
          {user ? (
            <>
              <IconButton onClick={handleMenuOpen}>
                <Avatar>{getInitials()}</Avatar>
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                <MenuItem onClick={handleViewProfile}>👤 View Profile</MenuItem>
                <MenuItem onClick={handleMyBookings}>📅 My Bookings</MenuItem>
                <MenuItem onClick={handleLogout}>🚪 Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button variant="contained" onClick={() => openModal("login")}>Login</Button>
              <Button variant="contained" onClick={() => openModal("register")}>Register</Button>
            </>
          )}
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ flex: 1, pt: "85px", pb: "1px" }}>
        {/* Sidebar + Map */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {isMobile ? (
            <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
              {mountains.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px" p={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Sidebar
                  mountains={mountains}
                  setMapCenter={setMapCenter}
                  hoveredMountain={hoveredMountain}
                  onMountainHover={handleMountainHover}
                  onMountainSelect={handleMountainSelect}
                  onRefresh={handleRefresh}
                  loading={refreshing}
                />
              )}
            </Drawer>
          ) : (
            <Box sx={{
              width: "23%", height: "73vh", p: 2, borderRadius: 2, boxShadow: 3, overflow: "hidden", position: "relative",
              display: "flex", justifyContent: "center", alignItems: "center",
              "&::before": {
                content: '""', position: "absolute", top: "50%", left: "50%", width: "120%", height: "120%",
                transform: "translate(-50%, -50%)", backgroundImage: "url('/logo/smt-logo.png')",
                backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity: 0.3, zIndex: 0
              }
            }}>
              <Box sx={{ zIndex: 1, width: "100%" }}>
                {mountains.length === 0 ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <Sidebar
                    key={lockedMountain?.name || "sidebar"}
                    mountains={mountains}
                    setMapCenter={setMapCenter}
                    hoveredMountain={hoveredMountain}
                    lockedMountain={lockedMountain}
                    onMountainHover={handleMountainHover}
                    onMountainSelect={handleMountainSelect}
                    onRefresh={handleRefresh}
                    loading={refreshing}
                  />
                )}
              </Box>
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgba(255,255,255,0.8)", p: 2, mb: 2, borderRadius: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                label="🔍 Search by city or zip code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                fullWidth
              />
              <Button onClick={handleSearch} variant="contained" sx={{ height: 56 }}>
                <SearchIcon /> Search
              </Button>
              <IconButton onClick={handleLocateMe} color="primary" sx={{ height: 56 }}>
                <MyLocationIcon fontSize="large" />
              </IconButton>
            </Paper>

            <Box key={mapKey} sx={{ height: "64.8vh", borderRadius: 6, boxShadow: 4, position: "relative" }}>
              <MountainFilter filters={filters} setFilters={setFilters} />
              <Map
                center={mapCenter}
                filters={filters}
                onMountainHover={handleMountainHover}
                onMountainSelect={handleMountainSelect}
                lockedMountain={lockedMountain}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Box sx={{ flex: 1 }}>
            <BookingSystem mountains={mountains} selectedMountain={selectedMountain} />
          </Box>
          <Box sx={{ flex: 1.5 }}>
            <Paper elevation={3} sx={{ height:"54.5vh", p: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.8)" }}>
              <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Sticky Footer */}
      <Box component="footer" sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        py: 1.6,
        textAlign: "center",
        backgroundColor: "#1565c0",
        color: "white",
        zIndex: 1100
      }}>
        <Typography variant="body2">© {new Date().getFullYear()} Snow Mountain Tracker</Typography>
      </Box>

      {/* Floating Logo */}
      <Box
        component="img"
        src="/logo/smt-logo.png"
        alt="SMT Watermark"
        sx={{
          position: "fixed",
          bottom: 53,
          right: 10,
          width: 140,
          opacity: 0.87,
          pointerEvents: "none",
          zIndex: 0,
          animation: "floatLogo 6s ease-in-out infinite"
        }}
      />

      {/* Modals */}
      {modalType === "login" && <LoginModal onClose={closeModal} onSwitchToRegister={() => openModal("register")} />}
      {modalType === "register" && <RegisterModal onClose={closeModal} onSwitchToLogin={() => openModal("login")} />}
    </Box>
  );
};

export default Home;