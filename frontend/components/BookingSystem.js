import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, MenuItem, Typography, Paper,
  Divider, ToggleButton, ToggleButtonGroup, Dialog, DialogTitle,
  DialogContent, Fade
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

const BookingSystem = ({ mountains = [], selectedMountain }) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [slot, setSlot] = useState("AM");
  const [formData, setFormData] = useState({ mountain: "" });
  const [confirmation, setConfirmation] = useState(null);
  const [availability, setAvailability] = useState({ AM: 0, PM: 0 });

  const selectedMountainObj = mountains.find(m =>
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
        if (res.data) {
          setAvailability({
            AM: parseInt(res.data.AM) || 0,
            PM: parseInt(res.data.PM) || 0
          });
        } else {
          setAvailability({ AM: 0, PM: 0 });
        }
      } catch (err) {
        console.error("Error checking availability", err);
        setAvailability({ AM: 0, PM: 0 });
      }
    };

    checkAvailability();
  }, [formData.mountain, selectedDate]);

  const handleSlotChange = (_, newSlot) => {
    if (newSlot && availability[newSlot] > 0) {
      setSlot(newSlot);
    }
  };

  const handleBooking = async () => {
    if (!user) return toast.error("Please login to book.");
    if (!formData.mountain) return toast.error("Please select a mountain.");
    if (!slot || !selectedDate) return toast.error("Choose date and time slot.");
    if (availability[slot] <= 0) return toast.error("This time slot is full.");

    try {
      const response = await axios.post("/api/booking", {
        user_id: user.user_id,
        lift_id: formData.mountain,
        reservation_date: selectedDate.format("YYYY-MM-DD"),
        slot
      });

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
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

  const selectedLabel = selectedMountainObj?.name || formData.mountain;
  const artworkUrl = slot === "AM"
    ? "/assets/sunrise_clean_transparent.png"
    : "/assets/night_clean_transparent.png";

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: "12px",
        boxShadow: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom>🎟️ Book Your Spot</Typography>

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
          sx={{ mb: 1 }}
        >
          {["AM", "PM"].map((time) => {
            const count = availability[time];
            const isLow = count > 0 && count <= 5;
            const isFull = count <= 0;

            return (
              <ToggleButton
                key={time}
                value={time}
                disabled={isFull}
                sx={{
                  fontWeight: isLow ? "bold" : "normal",
                  color: isLow ? "orange" : "inherit"
                }}
              >
                {time} ({isFull ? "FULL" : `${count} LEFT`})
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        {/* Time Ranges */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="caption" color="text.secondary">06:00AM – 12:00PM</Typography>
          <Typography variant="caption" color="text.secondary">12:00PM – 05:00PM</Typography>
        </Box>

        <Fade in timeout={400}>
          <Box
            sx={{
              mt: 1,
              width: "100%",
              height: 180,
              zoom: 1.3,
              backgroundImage: `url(${artworkUrl})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              borderRadius: 3.5,
              filter: "blur(0.2px)"
            }}
          />
        </Fade>
      </Box>

      <Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
          {selectedLabel && selectedDate
            ? `You are booking ${selectedLabel} on ${selectedDate.format("MM/DD/YYYY")} (${slot})`
            : `Select mountain, date, and time to continue.`}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleBooking}
          disabled={availability[slot] <= 0}
        >
          Confirm Booking
        </Button>
      </Box>
    </Paper>
  );
};

export default BookingSystem;
