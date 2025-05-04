import React from "react";
import {
  Box,
  FormControlLabel,
  Checkbox,
  Slider,
  Typography,
  Button
} from "@mui/material";

const defaultFilters = {
  showHasSnow: true,
  showForecastSnow: true,
  showNoSnow: true,
  forecastDays: 7
};

const MountainFilter = ({ filters, setFilters }) => {
  const handleCheckbox = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.checked });
  };

  const handleSlider = (_, newValue) => {
    setFilters({ ...filters, forecastDays: newValue });
  };

  const sliderMarks = Array.from({ length: 7 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`
  }));

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 0,
        backgroundColor: "rgba(255,255,255,0.95)",
        boxShadow: 2,
        borderRadius: "8px"
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1
        }}
      >
        <Typography variant="h6" sx={{ mt: 0.4 }}>
          ⛷️ Mountain Filters
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setFilters(defaultFilters)}
        >
          RESET FILTERS
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showHasSnow}
              onChange={handleCheckbox}
              name="showHasSnow"
            />
          }
          label="Currently has snow"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showForecastSnow}
              onChange={handleCheckbox}
              name="showForecastSnow"
            />
          }
          label="Forecasted to snow"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.showNoSnow}
              onChange={handleCheckbox}
              name="showNoSnow"
            />
          }
          label="No snow"
        />

        <Box sx={{ minWidth: 220, flexGrow: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Forecast Range (days)
          </Typography>
          <Slider
            value={filters.forecastDays}
            onChange={handleSlider}
            valueLabelDisplay="auto"
            min={1}
            max={7}
            marks={sliderMarks}
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MountainFilter;
