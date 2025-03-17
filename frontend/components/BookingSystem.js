import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BookingSystem = ({ mountains = [] }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [bookings, setBookings] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mountain: mountains.length > 0 ? mountains[0].name : "", // Default to first mountain if available
    date: dayjs(),
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    setFormData({ ...formData, date: newValue });
  };

  const handleBookingSubmit = async () => {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to book reservation");

      const newBooking = await response.json();
      setBookings([...bookings, newBooking]);
      alert("Booking successful!");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Error booking reservation. Please try again.");
    }
  };

  const handleDeleteBooking = (index) => {
    const updatedBookings = bookings.filter((_, i) => i !== index);
    setBookings(updatedBookings);
  };

  return (
    <Box sx={{ p: 3, borderTop: "1px solid #ccc" }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontSize: "1.3rem", fontWeight: "bold" }}>
        🎟️ Book Ski Lift Tickets & 📅 Booking Calendar
      </Typography>

      {mountains.length === 0 ? (
        <Typography variant="body2" sx={{ color: "gray", fontStyle: "italic", textAlign: "center" }}>
          Loading mountain data...
        </Typography>
      ) : (
        <Grid container spacing={4} alignItems="stretch">
          {/* Left Side: Booking Form */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 2, boxShadow: 3, borderRadius: "12px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏔️ Book Your Spot
                </Typography>
                <TextField
                  label="Name"
                  variant="outlined"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Email"
                  variant="outlined"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                {/* Mountain Dropdown */}
                <TextField
                  select
                  label="Select Mountain"
                  variant="outlined"
                  name="mountain"
                  value={formData.mountain}
                  onChange={handleInputChange}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {mountains.map((mountain, index) => (
                    <MenuItem key={index} value={mountain.name}>
                      {mountain.name}
                    </MenuItem>
                  ))}
                </TextField>
                {/* Date Picker */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleBookingSubmit}>
                  Confirm Booking
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Middle Divider */}
          <Grid item xs={12} md={1} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Divider orientation="vertical" flexItem sx={{ height: "90%" }} />
          </Grid>

          {/* Right Side: Booking Calendar */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, boxShadow: 3, borderRadius: "12px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 Your Bookings
                </Typography>
                {bookings.length > 0 ? (
                  <List>
                    {bookings.map((booking, index) => (
                      <ListItem key={index} divider sx={{ display: "flex", justifyContent: "space-between" }}>
                        <ListItemText
                          primary={booking.name}
                          secondary={`🏔️ ${booking.mountain} | 📅 ${booking.date}`}
                        />
                        <Box>
                          <IconButton color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDeleteBooking(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ textAlign: "center", mt: 2, color: "gray" }}>
                    No bookings found for this date.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BookingSystem;
