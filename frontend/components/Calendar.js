import React, { useState } from "react";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Typography, Divider, Box, Link } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useModalStore } from "../store/useModalStore";
import dayjs from "dayjs";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { user } = useAuth();
  const { openModal } = useModalStore();

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
              justifyContent: "space-between",
              gap: "8px",
            },
            ".MuiDayCalendar-header": {
              justifyContent: "space-between",
            },
          }}
        />
      </LocalizationProvider>

      <Divider sx={{ my: 3, borderColor: "rgba(0,0,0,0.1)" }} />

      {user ? (
        <Typography variant="h6">Your upcoming bookings:</Typography>
      ) : (
        <Typography variant="body1" align="center">
          <Link onClick={() => openModal("login")} sx={{ cursor: "pointer" }}>
            Login
          </Link>{" "}
          to view your upcoming bookings
        </Typography>
      )}
    </Box>
  );
};

export default Calendar;
