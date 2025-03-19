import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";

// Emoji/icon mapping for each field
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

const Sidebar = ({ mountains, setMapCenter }) => {
  const [selectedMountain, setSelectedMountain] = useState(null);

  const handleOpenDialog = (mountain) => {
    setSelectedMountain(mountain);
  };

  const handleCloseDialog = () => {
    setSelectedMountain(null);
  };

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
        {mountains.map((mountain, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{mountain.name}</span>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => handleZoomToMountain(mountain)}
                    >
                      Zoom
                    </Button>
                  </Box>
                }
                secondary={
                  <>
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
                  </>
                }
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Typography variant="body2" color="textSecondary">
        🚦 Road Closures: {mountains.length > 0 && mountains[0].roadClosure ? "Active" : "None"}
      </Typography>

      {/* Modal Dialog for Mountain Details */}
      <Dialog open={Boolean(selectedMountain)} onClose={handleCloseDialog}>
        <DialogTitle>{selectedMountain?.name}</DialogTitle>
        <DialogContent>
          <Typography>{icons.distance} Distance: {selectedMountain?.distance} miles</Typography>
          <Typography>{icons.weather} Weather: {selectedMountain?.weather}</Typography>
          <Typography>{icons.temperature} Temperature: {selectedMountain?.temperature}°F</Typography>
          <Typography>{icons.snowfallCurrent} Snow Depth: {selectedMountain?.snowfallCurrent} inches</Typography>
          <Typography>{icons.snowfallLast24h} Snow (Last 24h): {selectedMountain?.snowfallLast24h} inches</Typography>
          <Typography>{icons.rainLast24h} Rain (Last 24h): {selectedMountain?.rainLast24h} inches</Typography>
          <Typography>{icons.windSpeed} Wind Speed: {selectedMountain?.windSpeed} mph</Typography>
          <Typography>{icons.visibility} Visibility: {selectedMountain?.visibility} miles</Typography>
          {selectedMountain?.forecastSnow && (
            <Typography color="primary">
              ❄️ Snow expected in {selectedMountain.forecastDays} days
            </Typography>
          )}
          <Typography color={selectedMountain?.chainsRequired ? "error" : "inherit"}>
            {icons.chainsRequired} Chains Required: {selectedMountain?.chainsRequired ? "Yes" : "No"}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
