import React, { useEffect, useState, useRef } from "react";
import {
  Box, TextField, Button, IconButton, Paper, Typography, Tooltip, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const SearchBarWithAlerts = ({ onSearch, onLocate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roadClosures, setRoadClosures] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const handleSearch = () => {
    if (searchQuery.trim()) onSearch(searchQuery);
  };

  useEffect(() => {
    const fetchClosures = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/road-closures");
        const data = await res.json();
        setRoadClosures(data);
      } catch (err) {
        console.error("❌ Road closures fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosures();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/road-closures")
        .then((res) => res.ok ? res.json() : [])
        .then(setRoadClosures)
        .catch(() => {});
    }, 6000); // Check every 6 seconds
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (roadClosures.length <= 2) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 2) % roadClosures.length);
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [roadClosures]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 2) % roadClosures.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 2 + roadClosures.length) % roadClosures.length);
  };

  const visibleClosures = roadClosures.slice(currentIndex, currentIndex + 2);

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      {/* Search Block */}
      <Paper elevation={3} sx={{ flex: 1, p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          label="🔍 Search by city name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          fullWidth
        />
        <Button onClick={handleSearch} variant="contained" sx={{ height: 56 }}>
          <SearchIcon /> Search
        </Button>
        <IconButton onClick={onLocate} color="primary" sx={{ height: 56 }}>
          <MyLocationIcon fontSize="large" />
        </IconButton>
      </Paper>

      {/* Road Closure Alerts Block */}
      <Paper elevation={3} sx={{ flex: 1, p: 2, background: "#fff7f6", position: "relative", minHeight: 112 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1">🚧 Road Closures</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? "" : `${roadClosures.length} active`}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={60}>
            <CircularProgress size={24} />
          </Box>
        ) : roadClosures.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No alerts found.</Typography>
        ) : (
          <>
            {visibleClosures.map((alert, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Tooltip title={alert.details}>
                  <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
                </Tooltip>
                <Typography variant="body2" sx={{ fontWeight: "bold", flex: 1 }}>
                  {alert.location}
                </Typography>
                <Typography variant="body2" color="error" sx={{ fontWeight: 500, mr: 1 }}>
                  {alert.status}
                </Typography>
                {alert.source && (
                  <Typography
                    component="a"
                    href={alert.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: "0.75rem",
                      color: "#1565c0",
                      textDecoration: "underline"
                    }}
                  >
                    Source
                  </Typography>
                )}
              </Box>
            ))}

            {roadClosures.length > 2 && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <IconButton onClick={handlePrev} size="small"><ChevronLeftIcon /></IconButton>
                <IconButton onClick={handleNext} size="small"><ChevronRightIcon /></IconButton>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SearchBarWithAlerts;
