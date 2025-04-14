import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, MenuItem, Typography, Paper,
  Divider, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle,
  DialogContent
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BookingSystem = ({ mountains = [], selectedMountain }) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [slot, setSlot] = useState("AM");
  const [formData, setFormData] = useState({ mountain: "" });
  const [confirmation, setConfirmation] = useState(null);
  const [availability, setAvailability] = useState({ AM: true, PM: true });

  const mountain = mountains.find(m =>
    (m.id || m.name) === (formData.mountain || selectedMountain?.id || selectedMountain?.name)
  );

  useEffect(() => {
    if (selectedMountain) {
      setFormData(prev => ({
        ...prev,
        mountain: selectedMountain.id || selectedMountain.name
      }));
    }
  }, [selectedMountain]);

  useEffect(() => {
    if (!formData.mountain || !selectedDate) return;

    const checkAvailability = async () => {
      try {
        const res = await axios.get("/api/booking/availability", {
          params: {
            lift_id: formData.mountain,
            reservation_date: selectedDate.format("YYYY-MM-DD")
          }
        });
        setAvailability(res.data);
      } catch (err) {
        console.error("Error checking availability", err);
        setAvailability({ AM: true, PM: true });
      }
    };

    checkAvailability();
  }, [formData.mountain, selectedDate]);

  const handleSlotChange = (_, newSlot) => {
    if (newSlot && availability[newSlot]) {
      setSlot(newSlot);
    }
  };

  const handleBooking = async () => {
    if (!user) return toast.error("Please login to book.");
    if (!formData.mountain) return toast.error("Please select a mountain.");
    if (!slot || !selectedDate) return toast.error("Choose date and time slot.");

    try {
      const response = await axios.post("/api/booking", {
        user_id: user.user_id,
        lift_id: formData.mountain,
        reservation_date: selectedDate.format("YYYY-MM-DD"),
        slot
      });

      toast.success("Booking confirmed!");
      setConfirmation({
        qr_code_url: response.data.qr_code_url,
        mountain: formData.mountain,
        slot,
        date: selectedDate.format("YYYY-MM-DD")
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed.");
    }
  };

  if (confirmation) {
    return (
      <Dialog open onClose={() => setConfirmation(null)} fullWidth>
        <DialogTitle>Booking Confirmed</DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Typography variant="h6">Your lift ticket is confirmed!</Typography>
          <Typography>{confirmation.date} ({confirmation.slot})</Typography>
          <img src={confirmation.qr_code_url} alt="QR Code" style={{ marginTop: 20 }} />
          <Typography sx={{ mt: 2, fontSize: 12 }} color="text.secondary">
            [🧪 Placeholder] QR will be emailed. Stub feature - complete in next release.
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: "12px", boxShadow: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        🎟️ Book Your Spot
      </Typography>

      <TextField
        label="Select Mountain"
        name="mountain"
        select
        value={formData.mountain}
        onChange={e => setFormData({ ...formData, mountain: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      >
        {mountains.map((mtn, i) => (
          <MenuItem key={i} value={mtn.id || mtn.name}>
            {mtn.name}
          </MenuItem>
        ))}
      </TextField>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={newDate => setSelectedDate(newDate)}
          sx={{ mb: 2, width: "100%" }}
        />
      </LocalizationProvider>

      <Typography variant="subtitle1" gutterBottom>Select Time Slot</Typography>
      <ToggleButtonGroup
        value={slot}
        exclusive
        onChange={handleSlotChange}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="AM" disabled={!availability.AM}>AM</ToggleButton>
        <ToggleButton value="PM" disabled={!availability.PM}>PM</ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color="primary"
        onClick={handleBooking}
        disabled={!availability[slot]}
      >
        Confirm Booking
      </Button>
    </Paper>
  );
};

export default BookingSystem;
