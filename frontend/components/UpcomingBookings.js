import React, { useEffect, useState } from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";

const UpcomingBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings/user/${user.user_id}`);
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };
    fetchBookings();
  }, [user]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        📅 Your Upcoming Bookings
      </Typography>
      {bookings.length === 0 ? (
        <Typography variant="body2">No upcoming bookings.</Typography>
      ) : (
        <List dense>
          {bookings.map((b, i) => (
            <ListItem key={i}>
              <ListItemText
                primary={`${b.mountain_name} — ${dayjs(b.reservation_date).format("MMM D")} (${b.slot_label})`}
                secondary={`Booking ID: ${b.booking_id}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default UpcomingBookings;
