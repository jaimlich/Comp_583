import React, { useState, useEffect } from "react";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Typography, Divider, Box, Link } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { user } = useAuth();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        📅 Select a Date for Booking
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          sx={{
            width: "100%",
            ".MuiDayCalendar-weekContainer": {
              justifyContent: "space-between", // ✅ spreads the weekdays
              gap: "8px", // optional spacing between days
            },
            ".MuiDayCalendar-header": {
              justifyContent: "space-between",
            },
          }}
        />
      </LocalizationProvider>

      <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)" }} /> {/* ✅ Subtle divider */}

      {user ? (
        <Typography variant="h6">
          Your upcoming bookings:
        </Typography>
      ) : (
        <Typography variant="body1" align="center">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const event = new CustomEvent("open-login-modal");
              window.dispatchEvent(event);
            }}
            sx={{ cursor: "pointer" }}
          >
            Login
          </Link> to view your upcoming bookings.
        </Typography>
      )}
    </Box>
  );
};

export default Calendar;
