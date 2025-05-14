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
        p: 2,
        mb: 0,
        backgroundColor: "rgba(255,255,255,0.95)",
        boxShadow: 2,
        borderRadius: "6px"
      }}
    >
      {/* Top row: Title on left, checkboxes + button on right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 1
        }}
      >
        <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
          Mountain Filters
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2.5
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                size="small"
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
                size="small"
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
                size="small"
                checked={filters.showNoSnow}
                onChange={handleCheckbox}
                name="showNoSnow"
              />
            }
            label="No snow"
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setFilters(defaultFilters)}
          >
            RESET FILTERS
          </Button>
        </Box>
      </Box>

      {/* Full-width Forecast Range Slider */}
      <Box sx={{ width: "100%", mt: 0.5 }}>
        <Typography variant="body2" sx={{ mb: 0.25 }}>
          Forecast Range (days)
        </Typography>
        <Slider
          value={filters.forecastDays}
          onChange={handleSlider}
          valueLabelDisplay="auto"
          min={1}
          max={7}
          marks={sliderMarks}
        />
      </Box>
    </Box>
  );
};

export default MountainFilter;
