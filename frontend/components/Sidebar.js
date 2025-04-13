import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button
} from "@mui/material";

const icons = {
  distance: "📍",
  weather: "🌤️",
  temperature: "🌡️",
  snowfallCurrent: "❄️",
  snowfallLast24h: "☃️",
  rainLast24h: "🌧️",
  visibility: "👀",
  chainsRequired: "⛓️",
};

const Sidebar = ({ mountains, setMapCenter, hoveredMountain, onMountainHover, onMountainSelect }) => {
  const handleZoomToMountain = (mountain) => {
    if (mountain.latitude && mountain.longitude) {
      setMapCenter({ lat: mountain.latitude, lon: mountain.longitude });
    } else {
      alert("Coordinates not found for this mountain.");
    }
  };

  return (
    <Box sx={{ width: "300px", height: "70vh", overflowY: "auto", borderRight: "1px solid #ccc", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        🏔️ Popular Mountains
      </Typography>
      <List>
        {mountains.map((mountain, index) => {
          const isHovered = hoveredMountain && hoveredMountain.name === mountain.name;

          return (
            <React.Fragment key={index}>
              <ListItem
                id={`sidebar-${mountain.name.replace(/\s+/g, "-")}`}
                sx={{
                  backgroundColor: isHovered ? "#fff9db" : "inherit",
                  border: isHovered ? "1px solid #f7c948" : "transparent",
                  transition: "all 0.2s ease-in-out",
                  borderRadius: "10px",
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{mountain.name}</span>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {
                          handleZoomToMountain(mountain);
                          onMountainHover(mountain);
                          onMountainSelect(mountain); // ✅ triggers locked popup
                        }}
                      >
                      Zoom
                    </Button>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">{icons.distance} Distance: {mountain.distance || "N/A"} miles</Typography>
                      <Typography variant="body2">{icons.weather} Weather: {mountain.weather || "Unknown"}</Typography>
                      <Typography variant="body2">{icons.temperature} Temperature: {mountain.temperature}°F</Typography>
                      <Typography variant="body2">{icons.snowfallCurrent} Snow Depth: {mountain.snowfallCurrent || "0"} inches</Typography>
                      <Typography variant="body2">{icons.snowfallLast24h} Snow (Last 24h): {mountain.snowfallLast24h || "0"} inches</Typography>
                      <Typography variant="body2">{icons.rainLast24h} Rain (Last 24h): {mountain.rainLast24h || "0"} inches</Typography>
                      <Typography variant="body2">{icons.visibility} Visibility: {mountain.visibility} miles</Typography>
                      {mountain.forecastSnow && (
                        <Typography variant="body2" color="primary">
                          ❄️ Snow expected in {mountain.forecastDays} days
                        </Typography>
                      )}
                      <Typography variant="body2" color={mountain.chainsRequired ? "error" : "inherit"}>
                        {icons.chainsRequired} Chains Required: {mountain.chainsRequired ? "Yes" : "No"}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
