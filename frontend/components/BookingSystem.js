import React, { useState } from "react";
import {
  Box, TextField, Button, MenuItem, Typography, Paper, Divider, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import BookingConfirmation from "./BookingConfirmation";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BookingSystem = ({ mountains = [] }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [slot, setSlot] = useState("AM");
  const [formData, setFormData] = useState({ mountain: "" });
  const [confirmation, setConfirmation] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSlotChange = (event, newSlot) => {
    if (newSlot) setSlot(newSlot);
  };

  const handleBooking = async () => {
    if (!user) return alert("Please login to book.");
    if (!formData.mountain) return alert("Select a mountain.");
    if (!slot || !selectedDate) return alert("Choose date and time slot.");

    try {
      const response = await axios.post("/api/booking", {
        user_id: user.user_id,
        lift_id: formData.mountain,
        reservation_date: selectedDate.format("YYYY-MM-DD"),
        slot
      });

      setConfirmation({
        mountain: formData.mountain,
        date: selectedDate.format("YYYY-MM-DD"),
        slot,
        qr_code_url: response.data.qr_code_url
      });
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed.");
    }
  };

  if (confirmation) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: "12px" }}>
        <BookingConfirmation bookingData={confirmation} onClose={() => setConfirmation(null)} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: "12px", boxShadow: 3, height: "100%"}}>
      <Typography variant="h6" gutterBottom>
        🎟️ Book Your Spot
      </Typography>

      <TextField
        label="Select Mountain"
        name="mountain"
        select
        value={formData.mountain}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        {mountains.map((mtn, index) => (
          <MenuItem key={index} value={mtn.id || mtn.name}>
            {mtn.name}
          </MenuItem>
        ))}
      </TextField>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={(newDate) => setSelectedDate(newDate)}
          sx={{ mb: 2, width: "100%" }}
        />
      </LocalizationProvider>

      <Typography variant="subtitle1" gutterBottom>
        Select Time Slot
      </Typography>
      <ToggleButtonGroup
        value={slot}
        exclusive
        onChange={handleSlotChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="AM">AM</ToggleButton>
        <ToggleButton value="PM">PM</ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      <Button variant="contained" fullWidth color="primary" onClick={handleBooking}>
        Confirm Booking
      </Button>
    </Paper>
  );
};

export default BookingSystem;
