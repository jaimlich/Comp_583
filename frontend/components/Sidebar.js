import React, { useEffect, useState } from "react";
import {
  Box, List, ListItem, ListItemText, Typography, Divider,
  Button, CircularProgress, IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";

const icons = {
  weather: "🌤️", temperature: "🌡️", snowfallCurrent: "❄️",
  snowfallLast24h: "☃️", rainLast24h: "🌧️", visibility: "👀", chainsRequired: "⛓️",
};

const scrollToMountain = (name) => {
  const id = `sidebar-${name.replace(/\s+/g, "-")}`;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
};

const Sidebar = ({
  mountains, setMapCenter, hoveredMountain, lockedMountain,
  onMountainHover, onMountainSelect, loading = false
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [localMountains, setLocalMountains] = useState(mountains);

  useEffect(() => {
    setLocalMountains(mountains);
  }, [mountains]);

  useEffect(() => {
    if (lockedMountain?.name) {
      setTimeout(() => scrollToMountain(lockedMountain.name), 0);
    }
  }, [lockedMountain]);

  const handleZoom = (mtn) => {
    if (mtn.latitude && mtn.longitude) {
      setMapCenter({ lat: mtn.latitude, lon: mtn.longitude });
    } else alert("Missing coordinates.");
  };

  const progressiveRefresh = async () => {
    setRefreshing(true);
    const updated = [];

    for (const mtn of mountains) {
      try {
        await fetch(`/api/mountains/refresh-one?name=${encodeURIComponent(mtn.name)}`, {
          method: "POST"
        });
        const reload = await fetch("http://localhost:5000/api/mountains");
        const data = await reload.json();
        const latest = data.find(x => x.name === mtn.name);
        if (latest) updated.push(latest);
      } catch (err) {
        console.error("Refresh error:", err.message);
      }
    }

    setLocalMountains(updated);
    setRefreshing(false);
    toast.success("Weather data refreshed!");
  };

  return (
    <Box sx={{ height: "70vh", overflowY: "auto", px: 0.5 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 0 }}>
        <Typography variant="h6">Popular Mountains</Typography>
        <Box textAlign="center">
          <IconButton onClick={progressiveRefresh} size="small" sx={{ ml: 1 }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" sx={{ fontSize: "11px" }}>Weather</Typography>
        </Box>
      </Box>

      {(loading || refreshing) ? (
        <Box sx={{ display: "flex", justifyContent: "center", minHeight: "300px" }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {localMountains.map((mtn, i) => {
            const isHovered = hoveredMountain?.name === mtn.name;
            const isLocked = lockedMountain?.name === mtn.name;
            return (
              <React.Fragment key={i}>
                <ListItem
                  id={`sidebar-${mtn.name.replace(/\s+/g, "-")}`}
                  sx={{
                    backgroundColor: isLocked ? "#e0f7fa" : isHovered ? "#fff9db" : "inherit",
                    border: isLocked ? "1px solid #00acc1" : isHovered ? "1px solid #f7c948" : "transparent",
                    borderRadius: "10px", mb: 1, transition: "all 0.2s ease-in-out"
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">{mtn.name}</Typography>
                        <Button size="small" variant="contained" onClick={() => {
                          handleZoom(mtn);
                          onMountainHover(mtn);
                          onMountainSelect(mtn);
                        }}>
                          Zoom
                        </Button>
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2">{icons.weather} Weather: {mtn.weather || "Unavailable"}</Typography>
                        <Typography variant="body2">{icons.temperature} Temp: {mtn.temperature}°F</Typography>
                        <Typography variant="body2">{icons.snowfallCurrent} Snow Depth: {mtn.snowfallCurrent || 0} in</Typography>
                        <Typography variant="body2">{icons.snowfallLast24h} Snow (24h): {mtn.snowfallLast24h || 0} in</Typography>
                        <Typography variant="body2">{icons.rainLast24h} Rain (24h): {mtn.rainLast24h || 0} in</Typography>
                        {mtn.visibility != null && (
                          <Typography variant="body2">{icons.visibility} Visibility: {mtn.visibility} mi</Typography>
                        )}
                        {mtn.forecastSnow && mtn.forecastDays != null && (
                          <Typography variant="body2" color="primary">
                            ❄️ Snow expected in {mtn.forecastDays} days
                          </Typography>
                        )}
                        <Typography variant="body2" color={mtn.chainsRequired ? "error" : "inherit"}>
                          {icons.chainsRequired} Chains Required: {mtn.chainsRequired ? "Yes" : "No"}
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ component: "div" }}
                    secondaryTypographyProps={{ component: "div" }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default Sidebar;
