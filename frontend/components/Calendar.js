import React, { useState, useEffect } from "react";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField, Box, List, ListItem, ListItemText, Typography, Paper, Divider } from "@mui/material";
import dayjs from "dayjs";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        const dateStr = selectedDate.format("YYYY-MM-DD");
        const response = await fetch(`/api/reservations?date=${dateStr}`);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Fetched bookings:", data);

        if (isMounted) setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        if (isMounted) setBookings([]);
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  return (
    <Paper sx={{ p: 2, boxShadow: 3, borderRadius: "12px" }}>
      <Typography variant="h6" gutterBottom>
        📅 Select a Date for Booking
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
        />
      </LocalizationProvider>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        📋 Your Bookings on {selectedDate.format("MMM D, YYYY")}
      </Typography>
      {bookings.length > 0 ? (
        <List>
          {bookings.map((booking, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={booking.name} secondary={`🏔️ ${booking.mountain}`} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "gray" }}>
          No bookings found for this date.
        </Typography>
      )}
    </Paper>
  );
};

export default Calendar;
